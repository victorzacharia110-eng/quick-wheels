<template>
  <div class="my-contract">
    <h1 class="page-title">{{ $t('employee.myContract') }}</h1>
    <p class="page-sub">{{ $t('employee.contractSubtitle') }}</p>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="contractStore.isLoading" key="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="myContract" key="contract" class="contract-details">
        <div class="contract-header">
          <div>
            <h2>{{ myContract.contract_number }}</h2>
            <span class="vehicle-name">{{ myContract.vehicle_name }}</span>
          </div>
          <span class="status-badge" :style="{ background: contractStore.getStatusColor(myContract.status) }">
            {{ $t('status.' + myContract.status) }}
          </span>
        </div>

        <div class="contract-info-grid">
          <div class="info-item">
            <span class="label">{{ $t('contract.vehicleType') }}</span>
            <span class="value">{{ myContract.vehicle_type }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('vehicle.registration') }}</span>
            <span class="value">{{ myContract.vehicle_registration }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('contract.contractType') }}</span>
              <span class="value">{{ $t('contract.' + myContract.contract_type) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('contract.paymentFreq') }}</span>
              <span class="value">{{ $t('status.' + myContract.payment_frequency) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('contract.startDate') }}</span>
            <span class="value">{{ formatDate(myContract.start_date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('contract.endDate') }}</span>
            <span class="value">{{ formatDate(myContract.end_date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('contract.amount') }}</span>
            <span class="value highlight">TZS {{ myContract.weekly_amount }}/wk</span>
          </div>
          <div class="info-item">
            <span class="label">{{ $t('contract.deposit') }}</span>
            <span class="value">TZS {{ myContract.deposit.toLocaleString() }}</span>
          </div>
        </div>

        <div class="progress-section">
          <h3>{{ $t('employee.paymentProgress') }}</h3>
          <div class="progress-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: contractStore.getProgress(myContract) + '%' }"></div>
            </div>
            <div class="progress-stats">
              <span>{{ $t('employee.paid') }}: TZS {{ myContract.paid_amount.toLocaleString() }}</span>
              <span>{{ $t('employee.remaining') }}: TZS {{ myContract.remaining_amount.toLocaleString() }}</span>
              <span>{{ contractStore.getProgress(myContract) }}% {{ $t('employee.complete') }}</span>
            </div>
          </div>
        </div>

        <div v-if="myContract.notes" class="notes-section">
          <h3>{{ $t('contract.notes') }}</h3>
          <p>{{ myContract.notes }}</p>
        </div>
      </div>

      <div v-else key="empty" class="no-contract">
        <font-awesome-icon icon="fa-solid fa-file-contract" size="3x" />
        <h3>{{ $t('employee.noActiveContract') }}</h3>
        <p>{{ $t('employee.noActiveContractDesc') }}</p>
        <p class="hint">{{ $t('employee.contactEmployer') }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useContractStore } from '@/stores/contracts'

const authStore = useAuthStore()
const contractStore = useContractStore()
const { t } = useI18n()

const myContract = computed(() => {
  return contractStore.contracts.find(c => 
    c.driver_name === authStore.userName || 
    c.driver_email === authStore.userEmail
  )
})

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

onMounted(() => { contractStore.fetchContracts() })
</script>

<style scoped>
.my-contract { padding: 0; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; margin-bottom: 24px; }

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

.contract-details {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
}
.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.contract-header h2 { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 700; color: #fff; }
.vehicle-name { color: rgba(255,255,255,0.6); font-size: 0.9rem; display: block; margin-top: 4px; }
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0a0818;
}

.contract-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-item .label { font-size: 0.75rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
.info-item .value { color: rgba(255,255,255,0.8); font-size: 1rem; }
.info-item .value.highlight { color: #00E5FF; font-weight: 600; }

.progress-section { margin-bottom: 24px; }
.progress-section h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}
.progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  border-radius: 4px;
  transition: width 0.3s ease;
}
.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
}
.progress-stats span:last-child { color: #00E5FF; font-weight: 600; }

.notes-section h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.notes-section p {
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  padding: 12px 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
}

.no-contract {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.3);
}
.no-contract svg { opacity: 0.3; margin-bottom: 16px; }
.no-contract h3 { color: #fff; margin-bottom: 8px; }
.no-contract .hint { font-size: 0.85rem; color: rgba(255,255,255,0.2); margin-top: 8px; }

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
  .contract-info-grid { grid-template-columns: 1fr; }
  .contract-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .progress-stats { flex-direction: column; gap: 4px; align-items: flex-start; }
}
</style>