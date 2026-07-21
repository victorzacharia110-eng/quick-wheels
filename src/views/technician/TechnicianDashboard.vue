<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useMaintenanceStore } from '@/stores/maintenance'

const authStore = useAuthStore()
const maintenanceStore = useMaintenanceStore()
const { t } = useI18n()

onMounted(async () => {
  await maintenanceStore.fetchDashboard()
})

function getPriorityIcon(priority) {
  const icons = {
    low: 'fa-solid fa-arrow-down',
    medium: 'fa-solid fa-minus',
    high: 'fa-solid fa-arrow-up',
    critical: 'fa-solid fa-exclamation-triangle',
  }
  return icons[priority] || 'fa-solid fa-circle'
}
</script>

<template>
  <div class="tech-dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">{{ $t('maintenance.dashboard') }}</h1>
        <p class="page-sub">{{ $t('maintenance.welcomeBack') }}, {{ authStore.userName }}!</p>
      </div>
      <RouterLink to="/technician/create-report" class="btn-primary">
        <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('maintenance.newReport') }}
      </RouterLink>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(0, 229, 255, 0.12); color: #00e5ff;">
          <font-awesome-icon icon="fa-solid fa-clipboard-list" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ maintenanceStore.totalReports }}</div>
          <div class="stat-label">{{ $t('maintenance.totalReports') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(255, 217, 61, 0.12); color: #FFD93D;">
          <font-awesome-icon icon="fa-solid fa-clock" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ maintenanceStore.pendingReports }}</div>
          <div class="stat-label">{{ $t('maintenance.pending') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(0, 196, 212, 0.12); color: #00C4D4;">
          <font-awesome-icon icon="fa-solid fa-wrench" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ maintenanceStore.inProgressReports }}</div>
          <div class="stat-label">{{ $t('maintenance.inProgress') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(74, 222, 128, 0.12); color: #4ADE80;">
          <font-awesome-icon icon="fa-solid fa-check-circle" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ maintenanceStore.completedReports }}</div>
          <div class="stat-label">{{ $t('maintenance.completed') }}</div>
        </div>
      </div>
    </div>

    <!-- Assigned Vehicle -->
    <div class="assigned-vehicle" v-if="maintenanceStore.dashboardStats?.employee?.vehicle_name">
      <div class="vehicle-badge">
        <font-awesome-icon icon="fa-solid fa-car" />
      </div>
      <div class="vehicle-info">
        <span class="vehicle-label">{{ $t('maintenance.assignedVehicle') }}</span>
        <span class="vehicle-name">{{ maintenanceStore.dashboardStats.employee.vehicle_name }}</span>
      </div>
    </div>

    <!-- Critical Alerts -->
    <div class="critical-alert" v-if="maintenanceStore.criticalReports > 0">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
      <span>{{ maintenanceStore.criticalReports }} {{ $t('maintenance.criticalAlerts') }}</span>
    </div>

    <!-- Recent Reports -->
    <div class="recent-section">
      <h3 class="section-title">{{ $t('maintenance.recentReports') }}</h3>
      <div v-if="!maintenanceStore.dashboardStats?.recent_reports?.length" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-clipboard" size="3x" />
        <h3>{{ $t('maintenance.noReportsYet') }}</h3>
        <p>{{ $t('maintenance.noReportsDesc') }}</p>
        <RouterLink to="/technician/create-report" class="btn-primary">
          {{ $t('maintenance.createFirstReport') }}
        </RouterLink>
      </div>
      <div v-else class="reports-list">
        <RouterLink
          v-for="report in maintenanceStore.dashboardStats.recent_reports"
          :key="report.id"
          :to="`/technician/reports/${report.id}`"
          class="report-item"
        >
          <div class="report-left">
            <div class="report-number">{{ report.report_number }}</div>
            <div class="report-title">{{ report.title }}</div>
            <div class="report-meta">
              <span class="vehicle-tag">
                <font-awesome-icon icon="fa-solid fa-car" />
                {{ report.vehicle_name }} ({{ report.vehicle_type }})
              </span>
              <span class="date">{{ maintenanceStore.formatDate(report.created_at) }}</span>
            </div>
          </div>
          <div class="report-right">
            <span class="priority-badge" :style="{ background: maintenanceStore.getPriorityColor(report.priority) + '22', color: maintenanceStore.getPriorityColor(report.priority) }">
              <font-awesome-icon :icon="getPriorityIcon(report.priority)" />
              {{ report.priority_label }}
            </span>
            <span class="status-badge" :style="{ background: maintenanceStore.getStatusColor(report.status) + '22', color: maintenanceStore.getStatusColor(report.status) }">
              {{ report.status_label }}
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-dashboard { padding: 0; }

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3); }

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
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.stat-label {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.4);
}

.assigned-vehicle {
  background: rgba(0, 196, 212, 0.06);
  border: 1px solid rgba(0, 196, 212, 0.15);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.vehicle-badge {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: rgba(0, 196, 212, 0.15);
  color: #00C4D4;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
}
.vehicle-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  display: block;
}
.vehicle-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
}

.critical-alert {
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 10px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ff6b6b;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 24px;
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

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }
.empty-state p { margin-bottom: 20px; }

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
}
.report-item:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(0, 229, 255, 0.15);
}
.report-number {
  font-size: 0.72rem;
  color: #00C4D4;
  font-weight: 600;
  margin-bottom: 4px;
}
.report-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}
.report-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}
.vehicle-tag {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  gap: 4px;
}
.date {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
}
.report-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.priority-badge, .status-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .dashboard-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .report-item { flex-direction: column; align-items: flex-start; gap: 10px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
