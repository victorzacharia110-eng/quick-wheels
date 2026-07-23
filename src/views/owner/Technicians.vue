<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

const { t } = useI18n()
const technicians = ref([])
const vehicles = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showPasswordModal = ref(false)
const createdPassword = ref('')
const selectedTechnician = ref(null)
const isSubmitting = ref(false)

const form = ref({
  name: '', email: '', phone: '', address: '', nida_number: '',
  license_number: '', salary: '', shift: '', vehicle_id: '',
  workshop_address: '', workshop_latitude: '', workshop_longitude: '',
})

const filteredTechnicians = computed(() => {
  if (!searchQuery.value) return technicians.value
  const q = searchQuery.value.toLowerCase()
  return technicians.value.filter(t =>
    t.name.toLowerCase().includes(q) || (t.email || '').toLowerCase().includes(q) || (t.phone || '').includes(q)
  )
})

async function loadTechnicians() {
  isLoading.value = true
  try {
    const { data } = await api.get('/owner/technicians')
    technicians.value = data.data?.data || data.data || []
  } catch { technicians.value = [] }
  isLoading.value = false
}

async function loadVehicles() {
  try {
    const { data } = await api.get('/owner/vehicles')
    vehicles.value = data.data?.data || data.data || []
  } catch { vehicles.value = [] }
}

function openCreate() {
  form.value = { name: '', email: '', phone: '', address: '', nida_number: '', license_number: '', salary: '', shift: '', vehicle_id: '', workshop_address: '', workshop_latitude: '', workshop_longitude: '' }
  showCreateModal.value = true
}

function openEdit(tech) {
  selectedTechnician.value = tech
  form.value = {
    name: tech.name, email: tech.email, phone: tech.phone || '', address: tech.address || '',
    nida_number: tech.nida_number || '', license_number: tech.license_number || '',
    salary: tech.salary || '', shift: tech.shift || '', vehicle_id: tech.vehicle_id || '',
    workshop_address: tech.workshop_address || '', workshop_latitude: tech.workshop_latitude || '', workshop_longitude: tech.workshop_longitude || '',
  }
  showEditModal.value = true
}

function openDelete(tech) {
  selectedTechnician.value = tech
  showDeleteModal.value = true
}

async function createTechnician() {
  isSubmitting.value = true
  try {
    const { data } = await api.post('/owner/technicians', form.value)
    createdPassword.value = data.data.password
    showCreateModal.value = false
    showPasswordModal.value = true
    loadTechnicians()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to create technician')
  }
  isSubmitting.value = false
}

async function updateTechnician() {
  isSubmitting.value = true
  try {
    await api.put(`/owner/technicians/${selectedTechnician.value.id}`, form.value)
    showEditModal.value = false
    loadTechnicians()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update technician')
  }
  isSubmitting.value = false
}

async function deleteTechnician() {
  try {
    await api.delete(`/owner/technicians/${selectedTechnician.value.id}`)
    showDeleteModal.value = false
    loadTechnicians()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete technician')
  }
}

async function toggleStatus(tech) {
  try {
    await api.patch(`/owner/technicians/${tech.id}/toggle-status`)
    loadTechnicians()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to toggle status')
  }
}

const geocoding = ref(false)
async function geocodeWorkshopAddress() {
  const address = form.value.workshop_address?.trim()
  if (!address) return
  geocoding.value = true
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    })
    const results = await res.json()
    if (results.length > 0) {
      form.value.workshop_latitude = parseFloat(results[0].lat)
      form.value.workshop_longitude = parseFloat(results[0].lon)
    }
  } catch (e) { /* geocoding failed silently */ }
  geocoding.value = false
}

onMounted(() => {
  loadTechnicians()
  loadVehicles()
})
</script>

<template>
  <div class="technicians-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('maintenance.technicians') }}</h1>
        <p class="page-sub">{{ $t('maintenance.techniciansSubtitle') }}</p>
      </div>
      <button @click="openCreate" class="btn-primary">
        <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('maintenance.addTechnician') }}
      </button>
    </div>

    <div class="filters-bar">
      <div class="search-box">
        <font-awesome-icon icon="fa-solid fa-search" />
        <input v-model="searchQuery" :placeholder="$t('maintenance.searchTechnicians')" />
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <font-awesome-icon icon="fa-solid fa-spinner" spin size="2x" />
    </div>

    <div v-else-if="filteredTechnicians.length === 0" class="empty-state">
      <font-awesome-icon icon="fa-solid fa-user-gear" size="3x" />
      <h3>{{ $t('maintenance.noTechnicians') }}</h3>
      <p>{{ $t('maintenance.noTechniciansDesc') }}</p>
    </div>

    <div v-else class="tech-grid">
      <div v-for="tech in filteredTechnicians" :key="tech.id" class="tech-card">
        <div class="tech-header">
          <div class="tech-avatar">{{ tech.name.charAt(0) }}</div>
          <div class="tech-info">
            <div class="tech-name">{{ tech.name }}</div>
            <div class="tech-email">{{ tech.email }}</div>
          </div>
          <span class="status-dot" :class="tech.status"></span>
        </div>
        <div class="tech-details">
          <div class="detail-row" v-if="tech.vehicle_name">
            <font-awesome-icon icon="fa-solid fa-car" />
            <span>{{ tech.vehicle_name }}</span>
          </div>
          <div class="detail-row" v-if="tech.phone">
            <font-awesome-icon icon="fa-solid fa-phone" />
            <span>{{ tech.phone }}</span>
          </div>
          <div class="detail-row" v-if="tech.maintenance_stats">
            <font-awesome-icon icon="fa-solid fa-clipboard-list" />
            <span>{{ tech.maintenance_stats.total_reports }} {{ $t('maintenance.reports') }}</span>
          </div>
        </div>
        <div class="tech-actions">
          <button @click="openEdit(tech)" class="action-btn edit">
            <font-awesome-icon icon="fa-solid fa-edit" /> {{ $t('common.edit') }}
          </button>
          <button @click="toggleStatus(tech)" class="action-btn toggle" :title="tech.status === 'active' ? $t('documents.deactivate') : $t('documents.reactivate')">
            <font-awesome-icon :icon="tech.status === 'active' ? 'fa-solid fa-user-slash' : 'fa-solid fa-user-check'" />
          </button>
          <button @click="openDelete(tech)" class="action-btn delete">
            <font-awesome-icon icon="fa-solid fa-trash" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="showCreateModal = false; showEditModal = false">
        <div class="modal">
          <h3>{{ showCreateModal ? $t('maintenance.addTechnician') : $t('maintenance.editTechnician') }}</h3>
          <div class="modal-form">
            <input v-model="form.name" :placeholder="$t('common.fullName')" required />
            <input v-model="form.email" type="email" :placeholder="$t('common.email')" required />
            <input v-model="form.phone" :placeholder="$t('common.phone')" />
            <input v-model="form.nida_number" :placeholder="$t('common.nida')" />
            <input v-model="form.license_number" :placeholder="$t('employee.licenseNumber')" />
            <select v-model="form.vehicle_id">
              <option value="">{{ $t('common.none') }}</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.name }} ({{ v.type }})</option>
            </select>
            <div class="form-section-label">{{ $t('technician.workshop') }}</div>
            <div class="geocode-wrap">
              <input v-model="form.workshop_address" :placeholder="$t('technician.workshopAddress')" @blur="geocodeWorkshopAddress" />
              <span v-if="geocoding" class="geocode-spinner"><font-awesome-icon icon="fa-solid fa-spinner" spin /></span>
            </div>
            <div class="form-row-2">
              <input v-model="form.workshop_latitude" type="number" step="any" :placeholder="$t('technician.latitude')" />
              <input v-model="form.workshop_longitude" type="number" step="any" :placeholder="$t('technician.longitude')" />
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showCreateModal = false; showEditModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
            <button @click="showCreateModal ? createTechnician() : updateTechnician()" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? $t('common.saving') : (showCreateModal ? $t('common.create') : $t('common.save')) }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Password Modal -->
    <Teleport to="body">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
        <div class="modal">
          <div class="password-icon">
            <font-awesome-icon icon="fa-solid fa-key" size="2x" />
          </div>
          <h3>{{ $t('maintenance.technicianCreated') }}</h3>
          <p class="modal-desc">{{ $t('maintenance.sharePassword') }}</p>
          <div class="password-display">
            <code>{{ createdPassword }}</code>
          </div>
          <p class="password-hint">{{ $t('maintenance.passwordHint') }}</p>
          <div class="modal-actions">
            <button @click="showPasswordModal = false" class="btn-primary">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal">
          <h3>{{ $t('common.delete') }}?</h3>
          <p class="modal-desc">{{ $t('maintenance.deleteConfirm') }}</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
            <button @click="deleteTechnician" class="btn-danger">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.technicians-page { padding: 0; }

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
  border: none;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-outline {
  padding: 10px 20px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-danger {
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}

.filters-bar { margin-bottom: 20px; }
.search-box {
  position: relative;
  max-width: 400px;
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
}
.search-box input:focus { border-color: rgba(0, 229, 255, 0.3); }
.search-box input::placeholder { color: rgba(255,255,255,0.25); }

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.tech-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 20px;
}
.tech-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.tech-avatar {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2d2b7f, #00c4d4);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}
.tech-info { flex: 1; }
.tech-name { font-weight: 700; color: #fff; }
.tech-email { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
.status-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
}
.status-dot.active { background: #4ADE80; box-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
.status-dot.inactive { background: #ff6b6b; }

.tech-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.45);
}
.detail-row svg { width: 16px; color: rgba(255,255,255,0.25); }

.tech-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.5);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
}
.action-btn.edit:hover { color: #00E5FF; border-color: rgba(0, 229, 255, 0.2); }
.action-btn.toggle:hover { color: #FFD93D; border-color: rgba(255, 217, 61, 0.2); }
.action-btn.delete:hover { color: #ff6b6b; border-color: rgba(255, 107, 107, 0.2); }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #13112a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
}
.modal h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.modal-desc {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.modal-form input, .modal-form select {
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.modal-form input:focus, .modal-form select:focus { border-color: rgba(0, 229, 255, 0.3); }
.modal-form select option { background: #0a0818; }
.form-section-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255,255,255,0.35);
  font-weight: 600;
  margin-top: 6px;
}
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.password-icon {
  text-align: center;
  color: #00C4D4;
  margin-bottom: 16px;
}
.password-display {
  background: rgba(255,255,255,0.04);
  border: 1px dashed rgba(0, 229, 255, 0.3);
  border-radius: 8px;
  padding: 14px;
  text-align: center;
  margin-bottom: 12px;
}
.password-display code {
  font-size: 1.1rem;
  color: #00E5FF;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.password-hint {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.3);
  text-align: center;
  margin-bottom: 16px;
}

.geocode-wrap { position: relative; }
.geocode-wrap input { width: 100%; padding-right: 36px; }
.geocode-spinner {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: #00E5FF; font-size: 0.8rem;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .tech-grid { grid-template-columns: 1fr; }
}
</style>
