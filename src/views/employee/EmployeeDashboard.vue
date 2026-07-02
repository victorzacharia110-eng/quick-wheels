<template>
  <div class="employee-dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">My Dashboard</h1>
        <p class="page-sub">Welcome back, {{ authStore.userName }}!</p>
      </div>
    </div>

    <!-- Contract Status -->
    <div class="contract-status" v-if="myContract">
      <div class="status-header">
        <h3>My Contract</h3>
        <span class="status-badge" :style="{ background: contractStore.getStatusColor(myContract.status) }">
          {{ contractStore.getStatusLabel(myContract.status) }}
        </span>
      </div>
      <div class="status-body">
        <div class="status-row">
          <span class="label">Vehicle:</span>
          <span class="value">{{ myContract.vehicle_name }}</span>
        </div>
        <div class="status-row">
          <span class="label">Type:</span>
          <span class="value">{{ myContract.vehicle_type }}</span>
        </div>
        <div class="status-row">
          <span class="label">Payment:</span>
          <span class="value">TZS {{ myContract.weekly_amount }}/wk</span>
        </div>
        <div class="status-row">
          <span class="label">Progress:</span>
          <div class="progress-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: contractStore.getProgress(myContract) + '%' }"></div>
            </div>
            <span class="progress-text">{{ contractStore.getProgress(myContract) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-contract">
      <font-awesome-icon icon="fa-solid fa-file-contract" size="3x" />
      <h3>No Active Contract</h3>
      <p>You don't have an active contract at the moment.</p>
    </div>

    <!-- Recent Payments -->
    <div class="recent-payments">
      <h3 class="section-title">Recent Payments</h3>
      <div v-if="myPayments.length === 0" class="empty-state-small">
        <p>No payments recorded yet</p>
      </div>
      <div v-for="payment in myPayments" :key="payment.id" class="payment-item">
        <div class="payment-info">
          <span class="payment-amount">TZS {{ payment.amount.toLocaleString() }}</span>
          <span class="payment-date">{{ formatDate(payment.date) }}</span>
        </div>
        <span class="payment-status" :class="payment.status">
          {{ payment.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useContractStore } from '@/stores/contracts'
import { usePaymentStore } from '@/stores/payments'

const authStore = useAuthStore()
const contractStore = useContractStore()
const paymentStore = usePaymentStore()

const myContract = computed(() => {
  // Find contract for logged in employee (by name or email)
  return contractStore.contracts.find(c => 
    c.driver_name === authStore.userName || 
    c.driver_email === authStore.userEmail
  )
})

const myPayments = computed(() => {
  if (!myContract.value) return []
  return paymentStore.getPaymentsByContract(myContract.value.id)
})

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

onMounted(async () => {
  await Promise.all([
    contractStore.fetchContracts(),
    paymentStore.fetchPayments()
  ])
})
</script>

<style scoped>
.employee-dashboard { animation: fadeIn 0.4s ease; padding: 0; }
.dashboard-header { margin-bottom: 24px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.contract-status {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.status-header h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #fff; }
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0a0818;
}
.status-body { display: flex; flex-direction: column; gap: 12px; }
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-row .label { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
.status-row .value { color: #fff; font-weight: 500; }

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 200px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.progress-text { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

.no-contract {
  text-align: center;
  padding: 40px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.3);
  margin-bottom: 24px;
}
.no-contract svg { opacity: 0.3; margin-bottom: 16px; }
.no-contract h3 { color: #fff; margin-bottom: 8px; }

.recent-payments {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px 24px;
}
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}
.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.payment-item:last-child { border-bottom: none; }
.payment-info {
  display: flex;
  gap: 16px;
  align-items: center;
}
.payment-amount { color: #00E5FF; font-weight: 600; }
.payment-date { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
.payment-status {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
}
.payment-status.paid { background: rgba(0,229,255,0.15); color: #00E5FF; }
.payment-status.pending { background: rgba(255,217,61,0.15); color: #FFD93D; }
.empty-state-small { text-align: center; padding: 20px; color: rgba(255,255,255,0.3); }

@media (max-width: 768px) {
  .status-row { flex-direction: column; align-items: flex-start; gap: 4px; }
  .progress-wrapper { max-width: 100%; width: 100%; }
}
</style>