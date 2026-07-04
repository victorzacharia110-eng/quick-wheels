<template>
  <div class="employee-clients">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('nav.clients') }}</h1>
        <p class="page-sub">Registered customers</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search by name, email or phone..." class="search-input" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="filteredClients.length === 0" class="empty-state">
      <font-awesome-icon icon="fa-solid fa-users" size="3x" />
      <h3>No clients found</h3>
      <p>No registered customers match your search.</p>
    </div>

    <div v-else class="clients-grid">
      <div v-for="client in filteredClients" :key="client.id" class="client-card" @click="toggleExpand(client.id)">
        <div class="client-header">
          <div class="client-avatar">{{ getInitials(client.name) }}</div>
          <div class="client-info">
            <div class="client-name">{{ client.name }}</div>
            <div class="client-email">{{ client.email }}</div>
          </div>
          <font-awesome-icon :icon="expandedClient === client.id ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'" class="expand-icon" />
        </div>

        <Transition name="expand">
          <div v-if="expandedClient === client.id" class="client-details">
            <div class="detail-row">
              <span class="detail-label">Phone</span>
              <span class="detail-value">{{ client.phone || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">NIDA Number</span>
              <span class="detail-value">{{ client.nida_number || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Registered</span>
              <span class="detail-value">{{ formatDate(client.created_at) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ client.email }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/composables/api'

const clients = ref([])
const loading = ref(true)
const searchQuery = ref('')
const expandedClient = ref(null)

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function toggleExpand(id) {
  expandedClient.value = expandedClient.value === id ? null : id
}

const filteredClients = computed(() => {
  if (!searchQuery.value) return clients.value
  const q = searchQuery.value.toLowerCase()
  return clients.value.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.phone?.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const res = await api.get('/employee/customers')
    if (res.data.success) {
      clients.value = res.data.data.customers || res.data.data || []
    }
  } catch (err) {
    console.error('Failed to fetch clients:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.employee-clients { padding: 0; }
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

.filters-bar {
  margin-bottom: 24px;
}
.search-bar {
  position: relative;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.25);
}
.search-input {
  width: 100%;
  padding: 10px 16px 10px 44px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }

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

.clients-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.client-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.client-card:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(0,229,255,0.15);
}
.client-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.client-avatar {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2d2b7f, #00c4d4);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.client-info {
  flex: 1;
  min-width: 0;
}
.client-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
}
.client-email {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}
.expand-icon {
  color: rgba(255,255,255,0.3);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.client-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.detail-value {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  margin-top: 0;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; }
  .search-bar { max-width: 100%; }
  .client-details { grid-template-columns: 1fr; }
}
</style>
