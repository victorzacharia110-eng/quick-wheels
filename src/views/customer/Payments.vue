<template>
  <div class="payments">
    <div class="page-header">
      <h1 class="page-title">{{ $t('customer.payments') }}</h1>
      <p class="page-subtitle">{{ $t('customer.paymentsSubtitle') }}</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
    </div>

    <template v-else>
      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'manual' }]"
          @click="activeTab = 'manual'"
        >
          <font-awesome-icon icon="fa-solid fa-mobile-screen-button" />
          {{ $t('payment.manual') }}
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'clickpesa' }]"
          @click="activeTab = 'clickpesa'"
        >
          <font-awesome-icon icon="fa-solid fa-credit-card" />
          {{ $t('payment.clickPesa') }}
        </button>
      </div>

      <div v-if="activeTab === 'manual'" class="tab-content">
        <p class="section-desc">{{ $t('payment.manualDescription') }}</p>

        <div class="accounts-grid">
          <div v-for="acc in accounts" :key="acc.provider" class="account-card">
            <div class="account-provider">
              <font-awesome-icon icon="fa-solid fa-building-columns" />
              <strong>{{ acc.provider }}</strong>
            </div>
            <div class="account-number">{{ acc.number }}</div>
            <p class="account-instructions">{{ acc.instructions }}</p>
          </div>
        </div>

        <div class="manual-form">
          <h3 class="form-title">{{ $t('payment.submitPayment') }}</h3>

          <div class="form-group">
            <label>{{ $t('payment.booking') }}</label>
            <select v-model="manualForm.booking_id" class="form-select">
              <option value="">{{ $t('payment.selectBooking') }}</option>
              <option v-for="b in bookings" :key="b.id" :value="b.id">
                #{{ b.id }} - {{ b.vehicle_name || $t('contract.vehicle') }} (${{ b.total_amount }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>{{ $t('payment.amount') }}</label>
              <input v-model.number="manualForm.amount" type="number" step="0.01" class="form-input" :placeholder="$t('payment.amountPlaceholder')" />
            </div>
            <div class="form-group">
              <label>{{ $t('payment.provider') }}</label>
              <select v-model="manualForm.provider" class="form-select">
                <option value="">{{ $t('payment.selectProvider') }}</option>
                <option v-for="acc in accounts" :key="acc.provider" :value="acc.provider">{{ acc.provider }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('payment.referenceNumber') }}</label>
            <input v-model="manualForm.reference_number" class="form-input" :placeholder="$t('payment.referencePlaceholder')" />
          </div>

          <div class="form-group">
            <label>{{ $t('payment.transactionId') }} <span class="optional">{{ $t('common.optional') }}</span></label>
            <input v-model="manualForm.transaction_id" class="form-input" :placeholder="$t('payment.transactionPlaceholder')" />
          </div>

          <button class="submit-btn" :disabled="submitting" @click="submitManual">
            <font-awesome-icon v-if="submitting" icon="fa-solid fa-spinner" spin />
            {{ submitting ? $t('common.submitting') : $t('payment.submitPaymentBtn') }}
          </button>
          <p v-if="manualMsg" :class="['form-msg', manualMsgType]">{{ manualMsg }}</p>
        </div>
      </div>

      <div v-if="activeTab === 'clickpesa'" class="tab-content">
        <p class="section-desc">{{ $t('payment.clickPesaDescription') }}</p>

        <div class="clickpesa-form">
          <div class="form-group">
            <label>{{ $t('payment.booking') }}</label>
            <select v-model="clickForm.booking_id" class="form-select">
              <option value="">{{ $t('payment.selectBooking') }}</option>
              <option v-for="b in bookings" :key="b.id" :value="b.id">
                #{{ b.id }} - {{ b.vehicle_name || $t('contract.vehicle') }} (${{ b.total_amount }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ $t('payment.phone') }}</label>
            <input v-model="clickForm.phone" type="tel" class="form-input" :placeholder="$t('payment.phonePlaceholder')" />
          </div>

          <button class="submit-btn clickpesa-btn" :disabled="submitting" @click="initClickPesa">
            <font-awesome-icon v-if="submitting" icon="fa-solid fa-spinner" spin />
            {{ submitting ? $t('common.processing') : $t('payment.payWithClickPesa') }}
          </button>
          <p v-if="clickMsg" :class="['form-msg', clickMsgType]">{{ clickMsg }}</p>
        </div>
      </div>

      <div v-if="payments.length" class="payment-history">
        <h3 class="form-title">{{ $t('payment.history') }}</h3>
        <div v-for="p in payments" :key="p.id" class="history-card">
          <div class="history-left">
            <span class="history-amount">${{ p.amount }}</span>
            <span class="history-method">{{ p.method === 'clickpesa' ? $t('payment.clickPesa') : p.payment_method || $t('payment.manual') }}</span>
          </div>
          <div class="history-right">
            <span :class="['history-status', `hstatus-${p.status}`]">{{ $t('status.' + p.status) }}</span>
            <span class="history-date">{{ new Date(p.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const API = import.meta.env.VITE_API_URL

const loading = ref(true)
const activeTab = ref('manual')
const accounts = ref([])
const bookings = ref([])
const payments = ref([])
const submitting = ref(false)
const manualMsg = ref('')
const manualMsgType = ref('success')
const clickMsg = ref('')
const clickMsgType = ref('success')

const manualForm = ref({
  booking_id: '',
  amount: null,
  provider: '',
  reference_number: '',
  transaction_id: '',
})

const clickForm = ref({
  booking_id: '',
  phone: '',
})

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
  })
  return res.json()
}

async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function fetchData() {
  try {
    const [accRes, bookRes, payRes] = await Promise.all([
      apiGet('/customer/payments/accounts'),
      apiGet('/customer/my-rides'),
      apiGet('/customer/payments'),
    ])
    if (accRes.success) accounts.value = accRes.data
    if (bookRes.success) bookings.value = bookRes.data
    if (payRes.success) payments.value = payRes.data
  } catch (e) {
    console.error('Failed to load payment data:', e)
  } finally {
    loading.value = false
  }
}

async function submitManual() {
  if (!manualForm.value.booking_id || !manualForm.value.amount || !manualForm.value.provider || !manualForm.value.reference_number) {
    manualMsg.value = t('payment.fillRequired')
    manualMsgType.value = 'error'
    return
  }
  submitting.value = true
  manualMsg.value = ''
  try {
    const json = await apiPost('/customer/payments/manual/confirm', manualForm.value)
    if (json.success) {
      manualMsg.value = t('payment.submittedSuccess')
      manualMsgType.value = 'success'
      manualForm.value = { booking_id: '', amount: null, provider: '', reference_number: '', transaction_id: '' }
      const payRes = await apiGet('/customer/payments')
      if (payRes.success) payments.value = payRes.data
    } else {
      manualMsg.value = json.message || t('payment.submitError')
      manualMsgType.value = 'error'
    }
  } catch (e) {
    manualMsg.value = t('common.error')
    manualMsgType.value = 'error'
  } finally {
    submitting.value = false
  }
}

async function initClickPesa() {
  if (!clickForm.value.booking_id || !clickForm.value.phone) {
    clickMsg.value = t('payment.fillRequired')
    clickMsgType.value = 'error'
    return
  }
  submitting.value = true
  clickMsg.value = ''
  try {
    const json = await apiPost('/customer/payments/clickpesa/init', clickForm.value)
    if (json.success) {
      clickMsg.value = t('payment.clickPesaSuccess')
      clickMsgType.value = 'success'
      clickForm.value = { booking_id: '', phone: '' }
      const payRes = await apiGet('/customer/payments')
      if (payRes.success) payments.value = payRes.data
    } else {
      clickMsg.value = json.message || t('payment.submitError')
      clickMsgType.value = 'error'
    }
  } catch (e) {
    clickMsg.value = t('common.error')
    clickMsgType.value = 'error'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.payments { max-width: 900px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }
.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.loader { width: 36px; height: 36px; border: 3px solid rgba(0,229,255,0.15); border-top-color: #00e5ff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.5); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
.tab-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
.tab-btn.active { background: rgba(0,196,212,0.12); border-color: rgba(0,229,255,0.3); color: #00e5ff; }
.tab-content { margin-bottom: 32px; }
.section-desc { font-size: 0.85rem; color: rgba(255,255,255,0.45); margin: 0 0 20px; }

.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 28px; }
.account-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
.account-provider { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: rgba(255,255,255,0.8); font-size: 0.85rem; }
.account-provider svg { color: #00e5ff; }
.account-number { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #22d3ee; margin-bottom: 6px; letter-spacing: 0.05em; }
.account-instructions { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin: 0; }

.manual-form, .clickpesa-form { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; max-width: 500px; }
.form-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.8); margin: 0 0 16px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 4px; font-weight: 500; }
.form-input, .form-select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #fff; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.form-input:focus, .form-select:focus { border-color: rgba(0,229,255,0.4); }
.form-input::placeholder { color: rgba(255,255,255,0.2); }
.form-select option { background: #0d0b1e; color: #fff; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.optional { font-size: 0.7rem; color: rgba(255,255,255,0.3); font-weight: 400; }
.submit-btn { width: 100%; padding: 12px; border-radius: 10px; border: none; background: linear-gradient(135deg, #1e1b5e, #00c4d4); color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: 'Space Grotesk', sans-serif; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.submit-btn:not(:disabled):hover { opacity: 0.9; }
.clickpesa-btn { background: linear-gradient(135deg, #2d2b7f, #00e5ff); margin-top: 4px; }
.form-msg { margin: 10px 0 0; font-size: 0.82rem; }
.form-msg.success { color: #4ade80; }
.form-msg.error { color: #f87171; }

.payment-history { margin-top: 12px; }
.history-card { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; }
.history-left { display: flex; flex-direction: column; }
.history-amount { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #22d3ee; }
.history-method { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
.history-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.history-status { font-size: 0.7rem; font-weight: 600; padding: 2px 10px; border-radius: 20px; text-transform: uppercase; }
.hstatus-pending { background: rgba(234,179,8,0.12); color: #facc15; }
.hstatus-approved { background: rgba(34,197,94,0.12); color: #4ade80; }
.hstatus-failed { background: rgba(239,68,68,0.12); color: #f87171; }
.history-date { font-size: 0.7rem; color: rgba(255,255,255,0.3); }
</style>
