<template>
  <div class="maintenance-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('maintenance.title') }}</h1>
        <p class="page-sub">{{ $t('maintenance.subtitle') }}</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" :placeholder="$t('maintenance.searchReports')" class="search-input" @input="debouncedSearch" />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" class="filter-select" @change="fetchReports(1)">
          <option value="">{{ $t('common.all') }}</option>
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>
    </div>

    <SkeletonLoader v-if="loading" variant="table" :rows="8" :cols="5" />

    <div v-else-if="reports.length === 0" class="empty-state">
      <font-awesome-icon icon="fa-solid fa-wrench" size="3x" />
      <h3>{{ $t('maintenance.noReports') }}</h3>
      <p>{{ $t('maintenance.noReportsDesc') }}</p>
    </div>

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('maintenance.reportNumber') }}</th>
            <th>{{ $t('maintenance.vehicle') }}</th>
            <th>{{ $t('maintenance.technician') }}</th>
            <th>{{ $t('maintenance.title') }}</th>
            <th>{{ $t('common.priority') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id" @click="viewReport(r)" class="clickable-row">
            <td><strong>{{ r.report_number }}</strong></td>
            <td>{{ r.vehicle_name }}</td>
            <td>{{ r.employee_name }}</td>
            <td>{{ r.title }}</td>
            <td>
              <span class="priority-badge" :style="{ color: r.priority_color }">{{ r.priority_label }}</span>
            </td>
            <td>
              <span class="status-badge" :style="{ background: r.status_color + '22', color: r.status_color }">{{ r.status_label }}</span>
            </td>
            <td @click.stop>
              <button @click="viewReport(r)" class="btn-icon" :title="$t('common.view')">
                <font-awesome-icon icon="fa-solid fa-eye" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination :currentPage="currentPage" :perPage="perPage" :total="totalReports" @page-change="fetchReports" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import api from '@/composables/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()
const router = useRouter()

const reports = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = ref(15)
const totalReports = ref(0)

const statuses = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'processing', label: 'Processing' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'verified', label: 'Verified' },
  { value: 'completed', label: 'Completed' },
]

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchReports(1), 400)
}

async function fetchReports(page = 1) {
  loading.value = true
  try {
    const params = { page }
    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    const res = await api.get('/owner/maintenance', { params })
    if (res.data.success) {
      reports.value = res.data.data || []
      if (res.data.meta) {
        currentPage.value = res.data.meta.current_page || 1
        perPage.value = res.data.meta.per_page || 15
        totalReports.value = res.data.meta.total || 0
      }
    }
  } catch (err) {
    console.error('Failed to fetch reports:', err)
  } finally {
    loading.value = false
  }
}

function viewReport(r) {
  router.push(`/owner/maintenance/${r.id}`)
}

onMounted(() => fetchReports(1))
</script>

<style scoped>
.maintenance-page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.search-bar { flex: 1; position: relative; min-width: 200px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); }
.search-input { width: 100%; padding: 10px 16px 10px 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
.search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
.filter-select { padding: 10px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; font-family: 'Space Grotesk', sans-serif; cursor: pointer; }

.table-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; min-width: 750px; }
.data-table th { text-align: left; padding: 14px 16px; color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.data-table td { padding: 14px 16px; color: rgba(255,255,255,0.7); font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.clickable-row { cursor: pointer; }

.priority-badge { font-weight: 600; font-size: 0.8rem; }
.status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; }

.btn-icon { padding: 4px 8px; border: none; background: rgba(255,255,255,0.05); border-radius: 4px; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }

.empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

@media (max-width: 768px) { .filters-bar { flex-direction: column; } }
</style>
