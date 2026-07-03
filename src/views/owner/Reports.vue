<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('nav.reports') }}</h1>
        <p class="page-sub">{{ $t('reports.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="exportReport">
        <font-awesome-icon icon="fa-solid fa-download" />
        {{ $t('common.exportReport') }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">TZS {{ totalRevenue.toLocaleString() }}</div>
        <div class="stat-label">{{ $t('reports.totalRevenue') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalActiveContracts }}</div>
        <div class="stat-label">{{ $t('reports.activeContracts') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalEmployees }}</div>
        <div class="stat-label">{{ $t('reports.totalDrivers') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalVehicles }}</div>
        <div class="stat-label">{{ $t('reports.totalVehicles') }}</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <div class="chart-card glass-card">
        <h3>{{ $t('reports.revenueByMonth') }}</h3>
        <div class="chart-placeholder">
          <div class="bar-chart">
            <div v-for="(data, index) in monthlyRevenue" :key="index" class="bar-item">
              <div class="bar" :style="{ height: data.percentage + '%' }"></div>
              <span class="bar-label">{{ data.month }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card glass-card">
        <h3>{{ $t('reports.vehicleDistribution') }}</h3>
        <div class="chart-placeholder">
          <div class="pie-chart">
            <div v-for="(count, type) in vehicleTypes" :key="type" class="pie-item">
              <span class="pie-color" :style="{ background: getColor(type) }"></span>
              <span>{{ type }}: {{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-section">
      <h3 class="section-title">{{ $t('common.recentActivity') }}</h3>
      <div v-if="recentActivity.length === 0" class="empty-state-small">
        <p>{{ $t('common.noRecentActivity') }}</p>
      </div>
      <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
        <span class="activity-icon" :style="{ color: activity.color }">
          <font-awesome-icon :icon="activity.icon" />
        </span>
        <div class="activity-content">
          <p>{{ activity.message }}</p>
          <span class="activity-time">{{ formatDate(activity.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContractStore } from '@/stores/contracts'
import { useVehicleStore } from '@/stores/vehicles'
import { useEmployeeStore } from '@/stores/employees'
import { usePaymentStore } from '@/stores/payments'

const { t } = useI18n()
const contractStore = useContractStore()
const vehicleStore = useVehicleStore()
const employeeStore = useEmployeeStore()
const paymentStore = usePaymentStore()

const totalRevenue = computed(() => paymentStore.totalAmount || 0)
const totalActiveContracts = computed(() => contractStore.activeContracts.length || 0)
const totalEmployees = computed(() => employeeStore.totalEmployees || 0)
const totalVehicles = computed(() => vehicleStore.totalVehicles || 0)

const monthlyRevenue = ref([
  { month: 'Jan', amount: 500000, percentage: 40 },
  { month: 'Feb', amount: 750000, percentage: 60 },
  { month: 'Mar', amount: 600000, percentage: 48 },
  { month: 'Apr', amount: 900000, percentage: 72 },
  { month: 'May', amount: 800000, percentage: 64 },
  { month: 'Jun', amount: 1200000, percentage: 100 },
])

const vehicleTypes = computed(() => {
  const types = {}
  vehicleStore.vehicles.forEach(v => {
    const type = v.type || 'Other'
    types[type] = (types[type] || 0) + 1
  })
  return types
})

const recentActivity = ref([
  {
    id: 1,
    icon: 'fa-solid fa-money-bill-wave',
    color: '#00E5FF',
    message: 'John Mwangi made a payment of TZS 45,000',
    date: '2024-06-01'
  },
  {
    id: 2,
    icon: 'fa-solid fa-file-contract',
    color: '#FFD93D',
    message: 'New contract created for Michael Peter',
    date: '2024-06-01'
  }
])

function getColor(type) {
  const colors = {
    Motorcycle: '#00C4D4',
    Bajaji: '#FFD93D',
    Car: '#2563C4',
    SUV: '#6C63FF'
  }
  return colors[type] || '#rgba(255,255,255,0.3)'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function exportReport() {
  alert(t('common.exportReport') + ' functionality will be implemented here')
}

onMounted(async () => {
  await Promise.all([
    contractStore.fetchContracts(),
    vehicleStore.fetchVehicles(),
    employeeStore.fetchEmployees(),
    paymentStore.fetchPayments()
  ])
})
</script>

<style scoped>
.reports-page { padding: 0; }
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
  grid-template-columns: repeat(4, 1fr);
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

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
.chart-card {
  padding: 20px;
}
.chart-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}
.chart-placeholder {
  min-height: 200px;
  display: flex;
  align-items: flex-end;
}
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
  height: 150px;
}
.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, #00C4D4, #00E5FF);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 10px;
}
.bar-label { font-size: 0.7rem; color: rgba(255,255,255,0.3); }

.pie-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.pie-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
}
.pie-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.recent-section {
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
.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.activity-item:last-child { border-bottom: none; }
.activity-icon { width: 28px; font-size: 1rem; }
.activity-content { flex: 1; }
.activity-content p { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
.activity-time {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.2);
}
.empty-state-small { text-align: center; padding: 20px; color: rgba(255,255,255,0.3); }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>