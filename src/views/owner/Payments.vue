<template>
  <div class="payments-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Payments</h1>
        <p class="page-sub">Track all payment collections</p>
      </div>
      <button class="btn-primary" @click="showCreateModal = true">
        <font-awesome-icon icon="fa-solid fa-plus" />
        Record Payment
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ paymentStore.totalPayments }}</div>
        <div class="stat-label">Total Payments</div>
      </div>
      <div class="stat-card paid">
        <div class="stat-value">TZS {{ paymentStore.totalAmount.toLocaleString() }}</div>
        <div class="stat-label">Total Collected</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ paymentStore.pendingPayments.length }}</div>
        <div class="stat-label">Pending</div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search payments..." class="search-input" />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="all">All Status</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="paymentStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading payments...</p>
    </div>

    <!-- Table -->
    <div v-else-if="filteredPayments.length > 0" class="table-container">
      <table class="payments-table">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredPayments" :key="payment.id">
            <td><strong>{{ payment.driver_name }}</strong></td>
            <td class="amount">TZS {{ payment.amount.toLocaleString() }}</td>
            <td>{{ payment.method }}</td>
            <td>{{ formatDate(payment.date) }}</td>
            <td>
              <span class="status-badge" :class="payment.status">
                {{ payment.status }}
              </span>
            </td>
            <td>
              <button @click="deletePayment(payment.id)" class="btn-icon danger" title="Delete">
                <font-awesome-icon icon="fa-solid fa-trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <font-awesome-icon icon="fa-solid fa-money-bill-wave" size="3x" />
      <h3>No Payments</h3>
      <p>No payments recorded yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePaymentStore } from '@/stores/payments'

const paymentStore = usePaymentStore()
const searchQuery = ref('')
const filterStatus = ref('all')
const showCreateModal = ref(false)

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

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function deletePayment(id) {
  if (confirm('Delete this payment?')) {
    await paymentStore.deletePayment(id)
  }
}

onMounted(() => { paymentStore.fetchPayments() })
</script>

<style scoped>
.payments-page { animation: fadeIn 0.4s ease; padding: 0; }
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

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .filters-bar { flex-direction: column; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>