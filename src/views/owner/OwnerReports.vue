<template>
  <div class="owner-reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('ownerReports.title') }}</h1>
        <p class="page-sub">{{ $t('ownerReports.subtitle') }}</p>
      </div>
      <RouterLink to="/owner/owner-reports/create" class="btn btn-primary">
        <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('ownerReports.createReport') }}
      </RouterLink>
    </div>

    <div class="stats-grid" v-if="stats">
      <div class="stat-card" v-for="s in statCards" :key="s.key">
        <div class="stat-icon" :style="{ background: s.color + '15', color: s.color }">
          <font-awesome-icon :icon="s.icon" />
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats[s.key] || 0 }}</div>
          <div class="stat-label">{{ $t(s.label) }}</div>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" :placeholder="$t('ownerReports.searchReports')" class="search-input" @input="debouncedSearch" />
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
      <font-awesome-icon icon="fa-solid fa-clipboard-list" size="3x" />
      <h3>{{ $t('ownerReports.noReports') }}</h3>
      <p>{{ $t('ownerReports.noReportsDesc') }}</p>
      <RouterLink to="/owner/owner-reports/create" class="btn btn-primary">
        {{ $t('ownerReports.createFirst') }}
      </RouterLink>
    </div>

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('common.title') }}</th>
            <th>{{ $t('ownerReports.vehicle') }}</th>
            <th>{{ $t('ownerReports.technician') }}</th>
            <th>{{ $t('ownerReports.progress') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('common.date') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id" @click="viewReport(r)" class="clickable-row">
            <td><strong>#{{ r.id }}</strong></td>
            <td>{{ r.title }}</td>
            <td>{{ r.vehicle?.name || '-' }}</td>
            <td>{{ r.technician?.name || '-' }}</td>
            <td>
              <div class="progress-bar-mini">
                <div class="progress-fill" :style="{ width: getProgress(r) + '%', background: getStatusColor(r.status) }"></div>
              </div>
              <span class="progress-text">{{ getAnsweredCount(r) }}/{{ r.questions?.length || 0 }}</span>
            </td>
            <td>
              <span class="status-badge" :style="{ background: getStatusColor(r.status) + '22', color: getStatusColor(r.status) }">
                {{ getStatusLabel(r.status) }}
              </span>
            </td>
            <td>{{ formatDate(r.created_at) }}</td>
            <td @click.stop>
              <div class="action-btns">
                <RouterLink :to="`/owner/owner-reports/${r.id}`" class="btn-icon" :title="$t('common.view')">
                  <font-awesome-icon icon="fa-solid fa-eye" />
                </RouterLink>
                <RouterLink v-if="r.status === 'draft'" :to="`/owner/owner-reports/${r.id}/edit`" class="btn-icon" :title="$t('common.edit')">
                  <font-awesome-icon icon="fa-solid fa-edit" />
                </RouterLink>
                <button v-if="r.status === 'draft'" @click="confirmDelete(r)" class="btn-icon btn-danger" :title="$t('common.delete')">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination :currentPage="currentPage" :perPage="perPage" :total="totalReports" @page-change="fetchReports" />
    </div>

    <Teleport to="body">
      <div v-if="deleteModal" class="modal-overlay" @click.self="deleteModal = false">
        <div class="modal-content">
          <h3>{{ $t('ownerReports.deleteReport') }}</h3>
          <p>{{ $t('ownerReports.deleteConfirm') }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="deleteModal = false">{{ $t('common.cancel') }}</button>
            <button class="btn btn-danger" @click="deleteReport" :disabled="deleting">
              {{ deleting ? $t('common.deleting') : $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import api from '@/composables/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const reports = ref([])
const stats = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const perPage = ref(15)
const totalReports = ref(0)
const deleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const statuses = [
  { value: 'draft', label: t('ownerReports.statusDraft') },
  { value: 'pending_technician', label: t('ownerReports.statusPending') },
  { value: 'submitted', label: t('ownerReports.statusSubmitted') },
  { value: 'reviewed', label: t('ownerReports.statusReviewed') },
  { value: 'verified', label: t('ownerReports.statusVerified') },
  { value: 'completed', label: t('ownerReports.statusCompleted') },
  { value: 'cancelled', label: t('ownerReports.statusCancelled') },
]

const statCards = [
  { key: 'total', label: 'ownerReports.totalReports', icon: 'fa-solid fa-clipboard-list', color: '#2563eb' },
  { key: 'draft', label: 'ownerReports.statusDraft', icon: 'fa-solid fa-file-pen', color: '#6b7280' },
  { key: 'pending', label: 'ownerReports.statusPending', icon: 'fa-solid fa-clock', color: '#3b82f6' },
  { key: 'completed', label: 'ownerReports.statusCompleted', icon: 'fa-solid fa-check-circle', color: '#22c55e' },
]

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchReports(1), 300)
}

async function fetchReports(page = 1) {
  loading.value = true
  try {
    const { data } = await api.get('/owner/reports', {
      params: { page, per_page: perPage.value, status: statusFilter.value, search: searchQuery.value }
    })
    reports.value = data.data.data
    currentPage.value = data.data.current_page
    totalReports.value = data.data.total
  } catch (e) {
    console.error('Failed to fetch reports', e)
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const { data } = await api.get('/owner/reports/stats')
    stats.value = data.data
  } catch (e) { /* ignore */ }
}

function viewReport(r) { router.push(`/owner/owner-reports/${r.id}`) }

function confirmDelete(r) { deleteTarget.value = r; deleteModal.value = true }
async function deleteReport() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete(`/owner/reports/${deleteTarget.value.id}`)
    deleteModal.value = false
    fetchReports(currentPage.value)
    fetchStats()
  } catch (e) { console.error(e) }
  finally { deleting.value = false }
}

function getProgress(r) {
  if (!r.questions?.length) return 0
  const answered = r.questions.filter(q => q.answer).length
  return Math.round((answered / r.questions.length) * 100)
}
function getAnsweredCount(r) {
  return r.questions?.filter(q => q.answer).length || 0
}
function getStatusColor(status) {
  const map = { draft:'#6b7280', pending_technician:'#3b82f6', submitted:'#eab308', reviewed:'#a855f7', verified:'#4f46e5', completed:'#22c55e', cancelled:'#ef4444' }
  return map[status] || '#6b7280'
}
function getStatusLabel(status) {
  const map = { draft:'Draft', pending_technician:'Pending', submitted:'Submitted', reviewed:'Reviewed', verified:'Verified', completed:'Completed', cancelled:'Cancelled' }
  return map[status] || status
}
function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => { fetchReports(); fetchStats() })
</script>

<style scoped>
.owner-reports-page { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
.page-sub { color: #6b7280; margin: 4px 0 0 0; font-size: 0.9rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { display: flex; align-items: center; gap: 14px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
.stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.stat-number { font-size: 1.4rem; font-weight: 700; color: #111827; }
.stat-label { font-size: 0.78rem; color: #6b7280; }
.filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-bar { position: relative; flex: 1; min-width: 220px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-input { width: 100%; padding: 10px 12px 10px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; }
.filter-select { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; background: white; }
.progress-bar-mini { display: inline-block; width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; vertical-align: middle; margin-right: 6px; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.progress-text { font-size: 0.8rem; color: #6b7280; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; }
.action-btns { display: flex; gap: 6px; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: #f9fafb; }
.empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; }
.empty-state h3 { margin: 16px 0 8px; color: #374151; }
.empty-state p { margin: 0 0 20px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 12px; padding: 24px; max-width: 400px; width: 90%; }
.modal-content h3 { margin: 0 0 12px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; text-decoration: none; }
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-danger { background: #ef4444; color: white; }
.btn-icon { background: none; border: none; padding: 6px 8px; border-radius: 6px; cursor: pointer; color: #6b7280; }
.btn-icon:hover { background: #f3f4f6; color: #2563eb; }
.btn-danger:hover { color: #ef4444; }
</style>
