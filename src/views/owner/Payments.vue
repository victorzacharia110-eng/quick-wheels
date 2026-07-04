<template>
  <div class="payments-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('payment.title') }}</h1>
        <p class="page-sub">{{ $t('payment.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        {{ $t('payment.recordPayment') }}
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ paymentStore.totalPayments }}</div>
        <div class="stat-label">{{ $t('payment.totalPayments') }}</div>
      </div>
      <div class="stat-card paid">
        <div class="stat-value">TZS {{ paymentStore.totalAmount.toLocaleString() }}</div>
        <div class="stat-label">{{ $t('payment.totalCollected') }}</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ paymentStore.pendingPayments.length }}</div>
        <div class="stat-label">{{ $t('payment.pending') }}</div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" :placeholder="$t('payment.searchPlaceholder')" class="search-input" />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="all">{{ $t('payment.allStatus') }}</option>
        <option value="paid">{{ $t('payment.paid') }}</option>
        <option value="pending">{{ $t('payment.pending') }}</option>
      </select>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="paymentStore.isLoading" key="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('payment.loading') }}</p>
      </div>

      <div v-else key="content">
        <div v-if="filteredPayments.length > 0" class="table-container">
          <table class="payments-table">
            <thead>
              <tr>
                <th>{{ $t('payment.driver') }}</th>
                <th>{{ $t('payment.amount') }}</th>
                <th>{{ $t('payment.method') }}</th>
                <th>{{ $t('payment.date') }}</th>
                <th>{{ $t('payment.status') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in paginatedData" :key="payment.id">
                <td><strong>{{ payment.driver_name }}</strong></td>
                <td class="amount">TZS {{ payment.amount.toLocaleString() }}</td>
                <td>{{ payment.method }}</td>
                <td>{{ formatDate(payment.date) }}</td>
                <td>
                  <span class="status-badge" :class="payment.status">
                    {{ $t('status.' + payment.status) }}
                  </span>
                </td>
                <td>
                  <button @click="deletePayment(payment.id)" class="btn-icon danger" :title="$t('common.delete')">
                    <font-awesome-icon icon="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <Pagination :current-page="page" :per-page="perPage" :total="filteredPayments.length" @page-change="page = $event" />
        </div>

        <div v-else class="empty-state">
          <font-awesome-icon icon="fa-solid fa-money-bill-wave" size="3x" />
          <h3>{{ $t('common.noPayments') }}</h3>
          <p>{{ $t('payment.noPaymentsDesc') }}</p>
        </div>
      </div>
    </Transition>

    <!-- Create Modal -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('payment.recordPayment') }}</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="handleCreate">
            <div class="form-grid">
              <div class="form-group">
                <label>{{ $t('payment.driverName') }} <span class="required">*</span></label>
                <input v-model="form.driver_name" class="form-input" :placeholder="$t('payment.driverName')" required />
              </div>
              <div class="form-group">
                <label>{{ $t('payment.amountWithCurrency') }} <span class="required">*</span></label>
                <input v-model.number="form.amount" type="number" class="form-input" placeholder="0" min="0" required />
              </div>
              <div class="form-group">
                <label>{{ $t('payment.paymentMethod') }}</label>
                <select v-model="form.method" class="form-input">
                  <option value="">{{ $t('payment.selectMethod') }}</option>
                  <option value="Cash">{{ $t('payment.cash') }}</option>
                  <option value="Bank Transfer">{{ $t('payment.bankTransfer') }}</option>
                  <option value="Mobile Money">{{ $t('payment.mobileMoney') }}</option>
                  <option value="Cheque">{{ $t('payment.cheque') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('common.status') }}</label>
                <select v-model="form.status" class="form-input">
                  <option value="paid">{{ $t('status.paid') }}</option>
                  <option value="pending">{{ $t('status.pending') }}</option>
                  <option value="failed">{{ $t('status.failed') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('payment.date') }}</label>
                <input v-model="form.date" type="date" class="form-input" />
              </div>
              <div class="form-group full-width">
                <label>{{ $t('payment.notes') }}</label>
                <textarea v-model="form.notes" class="form-input" rows="2" :placeholder="$t('common.optionalNotes')"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="showCreateModal = false">{{ $t('payment.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <span v-if="saving"><span class="spinner-sm"></span> {{ $t('payment.creating') }}</span>
                <span v-else><font-awesome-icon icon="fa-solid fa-check" /> {{ $t('payment.record') }}</span>
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
import { usePaymentStore } from '@/stores/payments'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()
const paymentStore = usePaymentStore()
const searchQuery = ref('')
const filterStatus = ref('all')
const showCreateModal = ref(false)
const saving = ref(false)

const page = ref(1)
const perPage = 15

const form = ref({ driver_name: '', amount: 0, method: 'Cash', status: 'paid', date: '', notes: '' })

const filteredPayments = computed(() => {
  let filtered = paymentStore.payments
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(p => p.status === filterStatus.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.driver_name.toLowerCase().includes(q)
    )
  }
  return filtered
})

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredPayments.value.slice(start, start + perPage)
})

watch(searchQuery, () => { page.value = 1 })

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function handleCreate() {
  saving.value = true
  const payload = { ...form.value }
  if (!payload.date) payload.date = new Date().toISOString().split('T')[0]
  const res = await paymentStore.createPayment(payload)
  saving.value = false
  if (res.success) {
    showCreateModal.value = false
    form.value = { driver_name: '', amount: 0, method: 'Cash', status: 'paid', date: '', notes: '' }
  }
}

async function deletePayment(id) {
  if (confirm(t('payment.deleteConfirm'))) {
    await paymentStore.deletePayment(id)
  }
}

onMounted(() => { paymentStore.fetchPayments() })
</script>

<style scoped>
.payments-page { padding: 0; }
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

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.search-bar {
  flex: 1;
  position: relative;
  min-width: 200px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.25);
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 44px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
.filter-select {
  padding: 10px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
}

.table-container {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow-x: auto;
}
.payments-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
.payments-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.payments-table td {
  padding: 14px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.payments-table tr:hover td { background: rgba(255,255,255,0.02); }
.payments-table tr:last-child td { border-bottom: none; }
.payments-table .amount { color: #00E5FF; font-weight: 600; }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}
.status-badge.paid { background: rgba(0,229,255,0.15); color: #00E5FF; }
.status-badge.pending { background: rgba(255,217,61,0.15); color: #FFD93D; }

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-icon.danger:hover { background: rgba(255,107,107,0.15); color: #ff6b6b; }

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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.modal-box {
  background: #13102a;
  border: 1px solid rgba(0,229,255,0.15);
  border-radius: 16px;
  padding: 30px;
  width: 100%; max-width: 500px;
  max-height: 90vh; overflow-y: auto;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.2rem; margin: 0; }
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
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); }
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
.form-input::placeholder { color: rgba(255,255,255,0.25); }
select.form-input {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
textarea.form-input { resize: vertical; min-height: 60px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.btn-outline {
  padding: 10px 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.1); color: #fff; }
.spinner-sm { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(10,8,24,0.2); border-top-color: #0a0818; border-radius: 50%; animation: spin 0.7s linear infinite; }
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal-box { transform: scale(0.92) translateY(20px); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal-box { transform: scale(0.95); }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .filters-bar { flex-direction: column; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>