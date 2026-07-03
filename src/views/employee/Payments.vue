<template>
  <div class="employee-payments">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('nav.myPayments') }}</h1>
        <p class="page-sub">{{ $t('employee.viewPaymentHistory') }}</p>
      </div>
      <button class="btn-primary" @click="showPaymentModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        {{ $t('employee.makePayment') }}
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ myPayments.length }}</div>
        <div class="stat-label">{{ $t('employee.totalPayments') }}</div>
      </div>
      <div class="stat-card paid">
        <div class="stat-value">TZS {{ totalPaid.toLocaleString() }}</div>
        <div class="stat-label">{{ $t('employee.totalPaid') }}</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ pendingPayments.length }}</div>
        <div class="stat-label">{{ $t('employee.pendingPayments') }}</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="paymentStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Payments List -->
    <div v-else-if="myPayments.length > 0" class="payments-list">
      <div v-for="payment in paginatedData" :key="payment.id" class="payment-card">
        <div class="payment-header">
          <span class="payment-amount">TZS {{ payment.amount.toLocaleString() }}</span>
          <span class="payment-status" :class="payment.status">
            {{ $t('status.' + payment.status) }}
          </span>
        </div>
        <div class="payment-details">
          <span><font-awesome-icon icon="fa-regular fa-calendar" size="xs" /> {{ formatDate(payment.date) }}</span>
          <span><font-awesome-icon icon="fa-solid fa-credit-card" size="xs" /> {{ payment.method || $t('status.cash') }}</span>
          <span v-if="payment.notes" class="payment-notes">{{ payment.notes }}</span>
        </div>
      </div>
      <Pagination :current-page="page" :per-page="perPage" :total="sortedPayments.length" @page-change="page = $event" />
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-money-bill-wave" size="3x" />
      <h3>{{ $t('common.noPayments') }}</h3>
      <p>{{ $t('employee.noPaymentsDesc') }}</p>
    </div>

    <!-- Payment Modal -->
    <Transition name="modal">
      <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('employee.makePayment') }}</h3>
            <button class="modal-close" @click="showPaymentModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="submitPayment">
            <div class="form-group">
              <label>{{ $t('payment.amount') }} <span class="required">*</span></label>
              <input v-model="paymentForm.amount" type="number" class="form-input" placeholder="TZS" required />
            </div>
            <div class="form-group">
              <label>{{ $t('employee.paymentMethod') }} <span class="required">*</span></label>
              <select v-model="paymentForm.method" class="form-input" required>
                <option value="Cash">{{ $t('status.cash') }}</option>
                <option value="M-Pesa">{{ $t('common.mpesa') }}</option>
                <option value="Bank Transfer">{{ $t('status.bank_transfer') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t('payment.notes') }}</label>
              <textarea v-model="paymentForm.notes" class="form-input" rows="2" :placeholder="$t('common.additionalNotes')"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showPaymentModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting"><span class="spinner-sm"></span> {{ $t('employee.processing') }}</span>
                <span v-else>{{ $t('employee.submitPayment') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payments'
import Pagination from '@/components/common/Pagination.vue'

const authStore = useAuthStore()
const paymentStore = usePaymentStore()
const { t } = useI18n()

const showPaymentModal = ref(false)
const isSubmitting = ref(false)

const page = ref(1)
const perPage = 15
const searchQuery = ref('')

const paymentForm = ref({
  amount: '',
  method: 'Cash',
  notes: ''
})

const myPayments = computed(() => {
  return paymentStore.payments.filter(p => 
    p.driver_name === authStore.userName
  )
})

const sortedPayments = computed(() => {
  return [...myPayments.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return sortedPayments.value.slice(start, start + perPage)
})

watch(searchQuery, () => { page.value = 1 })

const totalPaid = computed(() => {
  return myPayments.value.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
})

const pendingPayments = computed(() => {
  return myPayments.value.filter(p => p.status === 'pending')
})

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function submitPayment() {
  isSubmitting.value = true
  try {
    const paymentData = {
      driver_name: authStore.userName,
      amount: parseFloat(paymentForm.value.amount),
      method: paymentForm.value.method,
      notes: paymentForm.value.notes,
      status: 'pending'
    }
    await paymentStore.createPayment(paymentData)
    showPaymentModal.value = false
    paymentForm.value = { amount: '', method: 'Cash', notes: '' }
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => { paymentStore.fetchPayments() })
</script>

<style scoped>
.employee-payments { padding: 0; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.stat-card.paid .stat-value { color: #00E5FF; }
.stat-card.pending .stat-value { color: #FFD93D; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: rgba(255,255,255,0.3);
}
.spinner {
  width: 44px; height: 44px;
  border: 3px solid rgba(0,196,212,0.1);
  border-top-color: #00C4D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.payment-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 16px 20px;
}
.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.payment-amount { font-size: 1.2rem; font-weight: 700; color: #fff; }
.payment-status {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
}
.payment-status.paid { background: rgba(0,229,255,0.15); color: #00E5FF; }
.payment-status.pending { background: rgba(255,217,61,0.15); color: #FFD93D; }
.payment-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
}
.payment-notes {
  color: rgba(255,255,255,0.4);
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.modal-box {
  background: #13102a;
  border: 1px solid rgba(0,229,255,0.15);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.2rem; }
.modal-close {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 6px 10px;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); margin-bottom: 4px; }
.required { color: #ff6b6b; }
.form-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
select.form-input {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
textarea.form-input { resize: vertical; min-height: 60px; }
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.spinner-sm {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(10,8,24,0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
  .modal-box { padding: 24px; }
}
</style>