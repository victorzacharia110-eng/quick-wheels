<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMaintenanceStore } from '@/stores/maintenance'

const maintenanceStore = useMaintenanceStore()
const { t } = useI18n()

const searchQuery = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')

const filteredReports = computed(() => {
  let result = maintenanceStore.reports
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.report_number.toLowerCase().includes(q) ||
      (r.vehicle_name || '').toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) {
    result = result.filter(r => r.status === statusFilter.value)
  }
  if (priorityFilter.value) {
    result = result.filter(r => r.priority === priorityFilter.value)
  }
  return result
})

function getPriorityIcon(priority) {
  const icons = { low: 'fa-solid fa-arrow-down', medium: 'fa-solid fa-minus', high: 'fa-solid fa-arrow-up', critical: 'fa-solid fa-exclamation-triangle' }
  return icons[priority] || 'fa-solid fa-circle'
}

async function loadPage(page) {
  await maintenanceStore.fetchReports({ page, search: searchQuery.value, status: statusFilter.value, priority: priorityFilter.value })
}

onMounted(() => {
  maintenanceStore.fetchReports()
})
</script>

<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('maintenance.reports') }}</h1>
        <p class="page-sub">{{ $t('maintenance.reportsSubtitle') }}</p>
      </div>
      <RouterLink to="/technician/create-report" class="btn-primary">
        <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('maintenance.newReport') }}
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <font-awesome-icon icon="fa-solid fa-search" />
        <input v-model="searchQuery" :placeholder="$t('maintenance.searchReports')" @input="loadPage(1)" />
      </div>
      <select v-model="statusFilter" @change="loadPage(1)" class="filter-select">
        <option value="">{{ $t('common.allStatus') }}</option>
        <option value="pending">{{ $t('status.pending') }}</option>
        <option value="in_progress">{{ $t('maintenance.inProgress') }}</option>
        <option value="completed">{{ $t('status.completed') }}</option>
        <option value="cancelled">{{ $t('status.cancelled') }}</option>
      </select>
      <select v-model="priorityFilter" @change="loadPage(1)" class="filter-select">
        <option value="">{{ $t('common.all') }} {{ $t('common.type') }}</option>
        <option value="low">{{ $t('maintenance.low') }}</option>
        <option value="medium">{{ $t('maintenance.medium') }}</option>
        <option value="high">{{ $t('maintenance.high') }}</option>
        <option value="critical">{{ $t('maintenance.critical') }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="maintenanceStore.isLoading" class="loading-state">
      <font-awesome-icon icon="fa-solid fa-spinner" spin size="2x" />
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredReports.length === 0" class="empty-state">
      <font-awesome-icon icon="fa-solid fa-clipboard" size="3x" />
      <h3>{{ $t('maintenance.noReports') }}</h3>
      <p>{{ $t('maintenance.noReportsDesc') }}</p>
    </div>

    <!-- Reports Table -->
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('maintenance.reportNumber') }}</th>
            <th>{{ $t('maintenance.title') }}</th>
            <th>{{ $t('contract.vehicle') }}</th>
            <th>{{ $t('vehicle.color') || 'Color' }}</th>
            <th>{{ $t('vehicle.chassisNumber') || 'Chassis #' }}</th>
            <th>{{ $t('maintenance.priority') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('maintenance.items') }}</th>
            <th>{{ $t('common.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in filteredReports" :key="report.id" @click="$router.push(`/technician/reports/${report.id}`)" class="clickable-row">
            <td><span class="report-num">{{ report.report_number }}</span></td>
            <td><span class="report-title-cell">{{ report.title }}</span></td>
            <td>
              <span class="vehicle-cell">
                <font-awesome-icon :icon="report.vehicle_type === 'Motorcycle' ? 'fa-solid fa-motorcycle' : report.vehicle_type === 'Bajaji' ? 'fa-solid fa-truck-front' : 'fa-solid fa-car'" />
                {{ report.vehicle_name }}
              </span>
            </td>
            <td>{{ report.vehicle_color || '—' }}</td>
            <td>{{ report.vehicle_chassis_number || '—' }}</td>
            <td>
              <span class="priority-badge" :style="{ background: maintenanceStore.getPriorityColor(report.priority) + '22', color: maintenanceStore.getPriorityColor(report.priority) }">
                <font-awesome-icon :icon="getPriorityIcon(report.priority)" />
                {{ report.priority_label }}
              </span>
            </td>
            <td>
              <span class="status-badge" :style="{ background: maintenanceStore.getStatusColor(report.status) + '22', color: maintenanceStore.getStatusColor(report.status) }">
                {{ report.status_label }}
              </span>
            </td>
            <td>
              <span class="items-count">{{ report.parts_count }} {{ $t('maintenance.parts') }} / {{ report.services_count }} {{ $t('maintenance.services') }}</span>
            </td>
            <td><span class="date-cell">{{ maintenanceStore.formatDate(report.created_at) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="maintenanceStore.pagination.last_page > 1" class="pagination">
      <button :disabled="maintenanceStore.pagination.current_page <= 1" @click="loadPage(maintenanceStore.pagination.current_page - 1)">
        {{ $t('common.previous') }}
      </button>
      <span>{{ $t('common.page') }} {{ maintenanceStore.pagination.current_page }} {{ $t('common.of') }} {{ maintenanceStore.pagination.last_page }}</span>
      <button :disabled="maintenanceStore.pagination.current_page >= maintenanceStore.pagination.last_page" @click="loadPage(maintenanceStore.pagination.current_page + 1)">
        {{ $t('common.next') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.reports-page { padding: 0; }

.page-header {
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

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}
.search-box svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.3);
  font-size: 0.8rem;
}
.search-box input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus { border-color: rgba(0, 229, 255, 0.3); }
.search-box input::placeholder { color: rgba(255,255,255,0.25); }

.filter-select {
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
  cursor: pointer;
  min-width: 140px;
}
.filter-select option { background: #0a0818; color: #fff; }

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.table-wrapper {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.35);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  white-space: nowrap;
}
.data-table td {
  padding: 14px 16px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.8);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: rgba(255,255,255,0.03); }
.report-num { color: #00C4D4; font-weight: 600; font-size: 0.8rem; }
.report-title-cell { font-weight: 600; }
.vehicle-cell { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; }
.vehicle-cell svg { color: rgba(255,255,255,0.3); }
.priority-badge, .status-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.items-count { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.date-cell { font-size: 0.78rem; color: rgba(255,255,255,0.35); white-space: nowrap; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  color: rgba(255,255,255,0.4);
  font-size: 0.82rem;
}
.pagination button {
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.pagination button:hover:not(:disabled) { background: rgba(0, 229, 255, 0.1); border-color: rgba(0, 229, 255, 0.2); }
.pagination button:disabled { opacity: 0.3; cursor: not-allowed; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .filters-bar { flex-direction: column; }
  .table-wrapper { overflow-x: auto; }
}
</style>
