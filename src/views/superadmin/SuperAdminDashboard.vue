<template>
  <div class="superadmin-dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">SuperAdmin Dashboard</h1>
        <p class="page-sub">Welcome back, {{ authStore.userName }}!</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon owners-icon"><font-awesome-icon icon="fa-solid fa-building" /></div>
          <div class="stat-value">{{ stats.total_owners || 0 }}</div>
          <div class="stat-label">Total Owners</div>
        </div>
        <div class="stat-card verified">
          <div class="stat-icon verified-icon"><font-awesome-icon icon="fa-solid fa-check-circle" /></div>
          <div class="stat-value">{{ stats.verified_owners || 0 }}</div>
          <div class="stat-label">Verified</div>
        </div>
        <div class="stat-card unverified">
          <div class="stat-icon unverified-icon"><font-awesome-icon icon="fa-solid fa-clock" /></div>
          <div class="stat-value">{{ stats.unverified_owners || 0 }}</div>
          <div class="stat-label">Unverified</div>
        </div>
        <div class="stat-card employees">
          <div class="stat-icon employees-icon"><font-awesome-icon icon="fa-solid fa-users" /></div>
          <div class="stat-value">{{ stats.total_employees || 0 }}</div>
          <div class="stat-label">Total Employees</div>
        </div>
        <div class="stat-card clients">
          <div class="stat-icon clients-icon"><font-awesome-icon icon="fa-solid fa-user-friends" /></div>
          <div class="stat-value">{{ stats.total_clients || 0 }}</div>
          <div class="stat-label">Total Clients</div>
        </div>
        <div class="stat-card vehicles">
          <div class="stat-icon vehicles-icon"><font-awesome-icon icon="fa-solid fa-car" /></div>
          <div class="stat-value">{{ stats.total_vehicles || 0 }}</div>
          <div class="stat-label">Total Vehicles</div>
        </div>
      </div>

      <div class="recent-owners">
        <h3 class="section-title">Recent Owners</h3>
        <div v-if="recentOwners.length === 0" class="empty-state-small">
          <p>No owners registered yet.</p>
        </div>
        <div v-else class="table-container">
          <table class="owners-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="owner in recentOwners" :key="owner.id">
                <td><strong>{{ owner.business?.business_name || owner.name }}</strong></td>
                <td>{{ owner.business?.business_email || owner.email }}</td>
                <td>{{ owner.business?.business_phone || owner.phone }}</td>
                <td>
                  <span class="badge" :class="owner.is_active ? 'active' : 'inactive'">
                    {{ owner.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="owner.is_verified ? 'verified' : 'unverified'">
                    {{ owner.is_verified ? 'Verified' : 'Unverified' }}
                  </span>
                </td>
                <td>{{ formatDate(owner.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref({})
const recentOwners = ref([])

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

onMounted(async () => {
  try {
    const res = await api.get('/superadmin/dashboard')
    if (res.data.success) {
      stats.value = res.data.data.stats || {}
      recentOwners.value = res.data.data.recent_owners || []
    }
  } catch (err) {
    console.error('Failed to load dashboard:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.superadmin-dashboard { padding: 0; }
.dashboard-header { margin-bottom: 24px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

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
  font-size: 1.3rem;
  flex-shrink: 0;
}
.owners-icon { background: rgba(0,229,255,0.12); color: #00E5FF; }
.verified-icon { background: rgba(74,222,128,0.12); color: #4ADE80; }
.unverified-icon { background: rgba(255,217,61,0.12); color: #FFD93D; }
.employees-icon { background: rgba(99,102,241,0.12); color: #6366F1; }
.clients-icon { background: rgba(168,85,247,0.12); color: #A855F7; }
.vehicles-icon { background: rgba(249,115,22,0.12); color: #F97316; }
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 2px; }

.recent-owners {
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

.table-container {
  overflow-x: auto;
}
.owners-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}
.owners-table th {
  text-align: left;
  padding: 12px 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.owners-table td {
  padding: 12px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.owners-table tr:hover td { background: rgba(255,255,255,0.02); }
.owners-table tr:last-child td { border-bottom: none; }

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}
.badge.active { background: rgba(74,222,128,0.15); color: #4ADE80; }
.badge.inactive { background: rgba(255,107,107,0.15); color: #ff6b6b; }
.badge.verified { background: rgba(0,229,255,0.15); color: #00E5FF; }
.badge.unverified { background: rgba(255,217,61,0.15); color: #FFD93D; }

.empty-state-small { text-align: center; padding: 20px; color: rgba(255,255,255,0.3); }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
