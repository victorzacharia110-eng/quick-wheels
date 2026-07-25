<template>
  <div class="tech-reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('techOwnerReports.title') }}</h1>
        <p class="page-sub">{{ $t('techOwnerReports.subtitle') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending">
          <font-awesome-icon icon="fa-solid fa-clock" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">{{ $t('techOwnerReports.pending') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon submitted">
          <font-awesome-icon icon="fa-solid fa-paper-plane" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ submittedCount }}</div>
          <div class="stat-label">{{ $t('techOwnerReports.submitted') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <font-awesome-icon icon="fa-solid fa-check-circle" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">{{ $t('techOwnerReports.completed') }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Reports List -->
    <div v-if="loading" class="loading-state">
      <font-awesome-icon icon="fa-solid fa-spinner" spin size="2x" />
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="filteredReports.length === 0" class="empty-state">
      <font-awesome-icon icon="fa-solid fa-clipboard" size="3x" />
      <h3>{{ $t('techOwnerReports.noReports') }}</h3>
      <p>{{ $t('techOwnerReports.noReportsDesc') }}</p>
    </div>

    <div v-else class="reports-list">
      <RouterLink
        v-for="report in filteredReports"
        :key="report.id"
        :to="`/technician/owner-reports/${report.id}`"
        class="report-card"
      >
        <div class="report-top">
          <div class="report-title">{{ report.title }}</div>
          <span class="status-badge" :style="{ background: getStatusColor(report.status) + '18', color: getStatusColor(report.status) }">
            {{ getStatusLabel(report.status) }}
          </span>
        </div>
        <div class="report-meta">
          <span v-if="report.vehicle">
            <font-awesome-icon icon="fa-solid fa-car" /> {{ report.vehicle.name }}
          </span>
          <span>
            <font-awesome-icon icon="fa-solid fa-calendar" /> {{ formatDate(report.created_at) }}
          </span>
          <span v-if="report.questions?.length">
            <font-awesome-icon icon="fa-solid fa-circle-question" /> {{ report.questions.length }} {{ $t('techOwnerReports.questions') }}
          </span>
        </div>
        <div v-if="report.description" class="report-desc">{{ report.description }}</div>
        <div class="report-progress" v-if="report.questions?.length">
          <div class="progress-text">
            {{ answeredCount(report) }}/{{ report.questions.length }} {{ $t('techOwnerReports.answered') }}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (answeredCount(report) / report.questions.length * 100) + '%' }"></div>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

const { t } = useI18n()
const loading = ref(true)
const reports = ref([])
const activeTab = ref('pending')

const tabs = computed(() => [
  { key: 'pending', label: t('techOwnerReports.tabPending'), count: pendingCount.value },
  { key: 'submitted', label: t('techOwnerReports.tabSubmitted'), count: submittedCount.value },
  { key: 'completed', label: t('techOwnerReports.tabCompleted'), count: completedCount.value },
  { key: 'all', label: t('techOwnerReports.tabAll'), count: reports.value.length },
])

const pendingCount = computed(() => reports.value.filter(r => r.status === 'pending_technician').length)
const submittedCount = computed(() => reports.value.filter(r => r.status === 'submitted').length)
const completedCount = computed(() => reports.value.filter(r => r.status === 'completed' || r.status === 'reviewed' || r.status === 'verified').length)

const filteredReports = computed(() => {
  if (activeTab.value === 'all') return reports.value
  if (activeTab.value === 'pending') return reports.value.filter(r => r.status === 'pending_technician')
  if (activeTab.value === 'submitted') return reports.value.filter(r => r.status === 'submitted')
  if (activeTab.value === 'completed') return reports.value.filter(r => ['completed', 'reviewed', 'verified'].includes(r.status))
  return reports.value
})

function answeredCount(report) {
  return (report.questions || []).filter(q => q.answer).length
}

function getStatusColor(status) {
  const map = { pending_technician:'#3b82f6', submitted:'#FFD93D', reviewed:'#a855f7', verified:'#6C63FF', completed:'#4ADE80', cancelled:'#ff6b6b' }
  return map[status] || 'rgba(255,255,255,0.35)'
}

function getStatusLabel(status) {
  const map = { pending_technician: t('techOwnerReports.statusPending'), submitted: t('techOwnerReports.statusSubmitted'), reviewed: t('techOwnerReports.statusReviewed'), verified: t('techOwnerReports.statusVerified'), completed: t('techOwnerReports.statusCompleted'), cancelled: t('techOwnerReports.statusCancelled') }
  return map[status] || status
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchReports() {
  loading.value = true
  try {
    const { data } = await api.get('/technician/owner-reports')
    reports.value = data.data?.data || data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchReports)
</script>

<style scoped>
.tech-reports-page { padding: 0; }

.page-header { margin-bottom: 24px; }
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
.stat-icon.pending { background: rgba(59,130,246,0.12); color: #3b82f6; }
.stat-icon.submitted { background: rgba(255,217,61,0.12); color: #FFD93D; }
.stat-icon.completed { background: rgba(74,222,128,0.12); color: #4ADE80; }
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.tab-btn:hover { background: rgba(255,255,255,0.06); }
.tab-btn.active { background: rgba(0,229,255,0.1); border-color: rgba(0,229,255,0.3); color: #00E5FF; }
.tab-count {
  background: rgba(255,255,255,0.1);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
}
.tab-btn.active .tab-count { background: rgba(0,229,255,0.2); }

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.reports-list { display: flex; flex-direction: column; gap: 12px; }
.report-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 18px 20px;
  text-decoration: none;
  transition: all 0.2s;
}
.report-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(0,229,255,0.15); }
.report-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.report-title { font-weight: 700; color: #fff; font-size: 1rem; }
.status-badge { padding: 4px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.report-meta {
  display: flex; gap: 16px; flex-wrap: wrap;
  font-size: 0.8rem; color: rgba(255,255,255,0.4);
  margin-bottom: 8px;
}
.report-meta span { display: flex; align-items: center; gap: 5px; }
.report-desc { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 10px; }
.report-progress { margin-top: 8px; }
.progress-text { font-size: 0.75rem; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
.progress-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #00C4D4, #00E5FF); border-radius: 2px; transition: width 0.3s; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .filter-tabs { flex-wrap: wrap; }
}
</style>
