<template>
  <div class="cleanup-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('superadmin.cleanupTitle') }}</h1>
        <p class="page-sub">{{ $t('superadmin.cleanupSubtitle') }}</p>
      </div>
      <button @click="fetchDeleted" class="btn-outline" :disabled="loading">
        <font-awesome-icon icon="fa-solid fa-rotate" /> {{ $t('gps.refresh') }}
      </button>
    </div>

    <SkeletonLoader v-if="loading" variant="table" :rows="6" :cols="5" />

    <template v-else>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-count">{{ counts.owners }}</div>
          <div class="summary-label">{{ $t('nav.owners') }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-count">{{ counts.employees }}</div>
          <div class="summary-label">{{ $t('nav.employees') }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-count">{{ counts.users }}</div>
          <div class="summary-label">{{ $t('superadmin.standaloneUsers') }}</div>
        </div>
        <div class="summary-card total">
          <div class="summary-count">{{ counts.total }}</div>
          <div class="summary-label">{{ $t('superadmin.totalSoftDeleted') }}</div>
        </div>
      </div>

      <div v-if="counts.total === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-check-circle" size="3x" />
        <h3>{{ $t('superadmin.noDeletedRecords') }}</h3>
        <p>{{ $t('superadmin.noDeletedRecordsDesc') }}</p>
      </div>

      <template v-else>
        <div v-if="records.owners.length" class="section-block">
          <div class="section-header">
            <h3>{{ $t('nav.owners') }} ({{ records.owners.length }})</h3>
            <button @click="confirmPurge('owner')" class="btn-danger-sm">
              <font-awesome-icon icon="fa-solid fa-trash" /> {{ $t('superadmin.purgeAll') }}
            </button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t('common.name') }}</th>
                  <th>{{ $t('common.email') }}</th>
                  <th>{{ $t('common.deletedAt') }}</th>
                  <th>{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in records.owners" :key="'owner-'+r.id">
                  <td>{{ r.name }}</td>
                  <td>{{ r.email }}</td>
                  <td>{{ formatDate(r.deleted_at) }}</td>
                  <td>
                    <button @click="confirmForceDelete('owner', r)" class="btn-icon danger" :title="$t('superadmin.permanentDelete')">
                      <font-awesome-icon icon="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="records.employees.length" class="section-block">
          <div class="section-header">
            <h3>{{ $t('nav.employees') }} ({{ records.employees.length }})</h3>
            <button @click="confirmPurge('employee')" class="btn-danger-sm">
              <font-awesome-icon icon="fa-solid fa-trash" /> {{ $t('superadmin.purgeAll') }}
            </button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t('common.name') }}</th>
                  <th>{{ $t('common.email') }}</th>
                  <th>{{ $t('common.position') }}</th>
                  <th>{{ $t('common.deletedAt') }}</th>
                  <th>{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in records.employees" :key="'emp-'+r.id">
                  <td>{{ r.name }}</td>
                  <td>{{ r.email }}</td>
                  <td>{{ r.position }}</td>
                  <td>{{ formatDate(r.deleted_at) }}</td>
                  <td>
                    <button @click="confirmForceDelete('employee', r)" class="btn-icon danger" :title="$t('superadmin.permanentDelete')">
                      <font-awesome-icon icon="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="records.users.length" class="section-block">
          <div class="section-header">
            <h3>{{ $t('superadmin.standaloneUsers') }} ({{ records.users.length }})</h3>
            <button @click="confirmPurge('user')" class="btn-danger-sm">
              <font-awesome-icon icon="fa-solid fa-trash" /> {{ $t('superadmin.purgeAll') }}
            </button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t('common.name') }}</th>
                  <th>{{ $t('common.email') }}</th>
                  <th>{{ $t('common.role') }}</th>
                  <th>{{ $t('common.deletedAt') }}</th>
                  <th>{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in records.users" :key="'user-'+r.id">
                  <td>{{ r.name }}</td>
                  <td>{{ r.email }}</td>
                  <td>{{ r.role }}</td>
                  <td>{{ formatDate(r.deleted_at) }}</td>
                  <td>
                    <button @click="confirmForceDelete('user', r)" class="btn-icon danger" :title="$t('superadmin.permanentDelete')">
                      <font-awesome-icon icon="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()

const loading = ref(true)
const records = reactive({ owners: [], employees: [], users: [] })
const counts = reactive({ owners: 0, employees: 0, users: 0, total: 0 })

function formatDate(date) {
  if (!date) return '\u2014'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

async function fetchDeleted() {
  loading.value = true
  try {
    const res = await api.get('/superadmin/deleted')
    if (res.data.success) {
      records.owners = res.data.data.owners || []
      records.employees = res.data.data.employees || []
      records.users = res.data.data.users || []
      Object.assign(counts, res.data.counts)
    }
  } catch (err) {
    console.error('Failed to fetch deleted records:', err)
  } finally {
    loading.value = false
  }
}

function confirmForceDelete(type, record) {
  if (!confirm(`${t('superadmin.confirmPermanentDelete')} "${record.name}"?`)) return
  forceDeleteRecord(type, record.id)
}

async function forceDeleteRecord(type, id) {
  try {
    const res = await api.delete(`/superadmin/deleted/${type}/${id}`)
    if (res.data.success) {
      await fetchDeleted()
    }
  } catch (err) {
    console.error('Failed to delete:', err)
    alert(err.response?.data?.message || err.message)
  }
}

function confirmPurge(type) {
  const typeName = type === 'owner' ? t('nav.owners') : type === 'employee' ? t('nav.employees') : t('superadmin.standaloneUsers')
  if (!confirm(`${t('superadmin.confirmPurgeAll')} ${typeName}?`)) return
  purgeType(type)
}

async function purgeType(type) {
  try {
    const res = await api.delete(`/superadmin/deleted/${type}`)
    if (res.data.success) {
      await fetchDeleted()
    }
  } catch (err) {
    console.error('Failed to purge:', err)
    alert(err.response?.data?.message || err.message)
  }
}

onMounted(() => fetchDeleted())
</script>

<style scoped>
.cleanup-page { padding: 0; }
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
.page-sub { color: rgba(255, 255, 255, 0.4); font-size: 0.95rem; }

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}
.summary-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.summary-card.total {
  border-color: rgba(255,107,107,0.25);
}
.summary-count {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  font-family: 'Syne', sans-serif;
}
.summary-card.total .summary-count { color: #ff6b6b; }
.summary-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.section-block { margin-bottom: 28px; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h3 { color: #fff; font-size: 1rem; font-weight: 600; }

.table-container {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  text-align: left;
  padding: 12px 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.data-table td {
  padding: 12px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.data-table tr:hover td { background: rgba(255,255,255,0.02); }

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
.btn-icon.danger:hover { background: rgba(255,107,107,0.2); color: #ff6b6b; }

.btn-danger-sm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(255,107,107,0.1);
  border: 1px solid rgba(255,107,107,0.2);
  color: #ff6b6b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-danger-sm:hover { background: rgba(255,107,107,0.2); }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; color: #4ADE80; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

@media (max-width: 768px) {
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
