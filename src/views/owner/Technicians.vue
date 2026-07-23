<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'

const { t } = useI18n()

function showError(title, details) {
  errorTitle.value = title
  errorDetails.value = Array.isArray(details) ? details : details ? [details] : []
  showErrorModal.value = true
}
const technicians = ref([])
const vehicles = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showForceDeleteModal = ref(false)
const showPasswordModal = ref(false)
const showErrorModal = ref(false)
const showResetPasswordModal = ref(false)
const resetDefaultPassword = ref('')
const errorTitle = ref('')
const errorDetails = ref([])
const createdPassword = ref('')
const selectedTechnician = ref(null)
const activeTab = ref('active')
const deletedTechnicians = ref([])
const isSubmitting = ref(false)

const form = ref({
  name: '', email: '', phone: '', address: '', nida_number: '',
  license_number: '', salary: '', shift: '', vehicle_id: '',
  workshop_address: '', workshop_latitude: '', workshop_longitude: '',
  can_drive: false,
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
  form.value = { name: '', email: '', phone: '', address: '', nida_number: '', license_number: '', salary: '', shift: '', vehicle_id: '', workshop_address: '', workshop_latitude: '', workshop_longitude: '', can_drive: false }
  showCreateModal.value = true
}

function openEdit(tech) {
  selectedTechnician.value = tech
  form.value = {
    name: tech.name, email: tech.email, phone: tech.phone || '', address: tech.address || '',
    nida_number: tech.nida_number || '', license_number: tech.license_number || '',
    salary: tech.salary || '', shift: tech.shift || '', vehicle_id: tech.vehicle_id || '',
    workshop_address: tech.workshop_address || '', workshop_latitude: tech.workshop_latitude || '', workshop_longitude: tech.workshop_longitude || '',
    can_drive: tech.can_drive || false,
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
    const payload = { ...form.value }
    for (const k of Object.keys(payload)) {
      if (payload[k] === '' || payload[k] === undefined) payload[k] = null
    }
    const { data } = await api.post('/owner/technicians', payload)
    if (data.data.existing_user) {
      showError(t('maintenance.technicianLinkedExisting'))
    } else {
      createdPassword.value = data.data.password
      showPasswordModal.value = true
    }
    showCreateModal.value = false
    loadTechnicians()
  } catch (err) {
    const errors = err.response?.data?.errors
    const msg = err.response?.data?.message || 'Failed to create technician'
    const details = errors ? Object.entries(errors).map(([k, v]) => `${k}: ${v.join(', ')}`) : []
    showError(msg, details)
  }
  isSubmitting.value = false
}

async function updateTechnician() {
  isSubmitting.value = true
  try {
    const payload = { ...form.value }
    for (const k of Object.keys(payload)) {
      if (payload[k] === '') payload[k] = null
    }
    await api.put(`/owner/technicians/${selectedTechnician.value.id}`, payload)
    showEditModal.value = false
    loadTechnicians()
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to update technician')
  }
  isSubmitting.value = false
}

async function deleteTechnician() {
  try {
    await api.delete(`/owner/technicians/${selectedTechnician.value.id}`)
    showDeleteModal.value = false
    loadTechnicians()
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to delete technician')
  }
}

async function loadDeletedTechnicians() {
  try {
    const { data } = await api.get('/owner/technicians', { params: { trashed: true } })
    deletedTechnicians.value = data.data?.data || data.data || []
  } catch { deletedTechnicians.value = [] }
}

async function restoreTechnician(tech) {
  try {
    await api.patch(`/owner/technicians/${tech.id}/restore`)
    loadDeletedTechnicians()
    loadTechnicians()
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to restore technician')
  }
}

function openForceDelete(tech) {
  selectedTechnician.value = tech
  showForceDeleteModal.value = true
}

async function forceDeleteTechnician() {
  try {
    await api.delete(`/owner/technicians/${selectedTechnician.value.id}/force-delete`)
    showForceDeleteModal.value = false
    loadDeletedTechnicians()
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to permanently delete technician')
  }
}

async function toggleStatus(tech) {
  try {
    await api.patch(`/owner/technicians/${tech.id}/toggle-status`)
    loadTechnicians()
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to toggle status')
  }
}

async function resetPassword(tech) {
  try {
    const { data } = await api.post(`/owner/technicians/${tech.id}/reset-password`)
    resetDefaultPassword.value = data.data.default_password
    showResetPasswordModal.value = true
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to reset password')
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

watch(activeTab, (tab) => {
  if (tab === 'deleted') loadDeletedTechnicians()
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
      <div class="tab-bar">
        <button :class="['tab-btn', activeTab === 'active' && 'active']" @click="activeTab = 'active'">
          <font-awesome-icon icon="fa-solid fa-users" /> {{ $t('common.active') }}
        </button>
        <button :class="['tab-btn', activeTab === 'deleted' && 'active']" @click="activeTab = 'deleted'">
          <font-awesome-icon icon="fa-solid fa-trash-can" /> {{ $t('common.deleted') }}
        </button>
      </div>
      <div class="search-box">
        <font-awesome-icon icon="fa-solid fa-search" />
        <input v-model="searchQuery" :placeholder="$t('maintenance.searchTechnicians')" />
      </div>
    </div>

    <div v-if="isLoading && activeTab === 'active'" class="loading-state">
      <font-awesome-icon icon="fa-solid fa-spinner" spin size="2x" />
    </div>

    <template v-if="activeTab === 'active'">
      <div v-if="!isLoading && filteredTechnicians.length === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-user-gear" size="3x" />
        <h3>{{ $t('maintenance.noTechnicians') }}</h3>
        <p>{{ $t('maintenance.noTechniciansDesc') }}</p>
      </div>

      <div v-else-if="!isLoading" class="tech-grid">
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
            <button @click="resetPassword(tech)" class="action-btn toggle" :title="$t('common.resetPassword')">
              <font-awesome-icon icon="fa-solid fa-key" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-if="activeTab === 'deleted'">
      <div v-if="deletedTechnicians.length === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-trash-can" size="3x" />
        <h3>{{ $t('common.noDeleted') }}</h3>
      </div>
      <div v-else class="tech-grid">
        <div v-for="tech in deletedTechnicians" :key="tech.id" class="tech-card deleted-card">
          <div class="tech-header">
            <div class="tech-avatar">{{ tech.name.charAt(0) }}</div>
            <div class="tech-info">
              <div class="tech-name">{{ tech.name }}</div>
              <div class="tech-email">{{ tech.email }}</div>
            </div>
          </div>
          <div class="tech-details">
            <div class="detail-row" v-if="tech.phone">
              <font-awesome-icon icon="fa-solid fa-phone" />
              <span>{{ tech.phone }}</span>
            </div>
          </div>
          <div class="tech-actions">
            <button @click="restoreTechnician(tech)" class="action-btn edit">
              <font-awesome-icon icon="fa-solid fa-rotate-left" /> {{ $t('common.restore') }}
            </button>
            <button @click="openForceDelete(tech)" class="action-btn delete">
              <font-awesome-icon icon="fa-solid fa-ban" /> {{ $t('common.permanentDelete') }}
            </button>
          </div>
        </div>
      </div>
    </template>

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
            <label class="checkbox-row">
              <input type="checkbox" v-model="form.can_drive" />
              <span>{{ $t('employee.canDrive') }}</span>
            </label>
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

    <!-- Force Delete Modal -->
    <Teleport to="body">
      <div v-if="showForceDeleteModal" class="modal-overlay" @click.self="showForceDeleteModal = false">
        <div class="modal">
          <h3>{{ $t('common.permanentDelete') }}?</h3>
          <p class="modal-desc">{{ $t('common.permanentDeleteConfirm') }}</p>
          <div class="modal-actions">
            <button @click="showForceDeleteModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
            <button @click="forceDeleteTechnician" class="btn-danger">{{ $t('common.permanentDelete') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reset Password Modal -->
    <Teleport to="body">
      <div v-if="showResetPasswordModal" class="modal-overlay" @click.self="showResetPasswordModal = false">
        <div class="modal">
          <div class="password-icon">
            <font-awesome-icon icon="fa-solid fa-key" size="2x" />
          </div>
          <h3>{{ $t('common.passwordReset') }}</h3>
          <p class="modal-desc">{{ $t('common.resetPasswordConfirm') }}</p>
          <div class="password-display">
            <code>{{ resetDefaultPassword }}</code>
          </div>
          <p class="password-hint">{{ $t('maintenance.passwordHint') }}</p>
          <div class="modal-actions">
            <button @click="showResetPasswordModal = false" class="btn-primary">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Error Modal -->
    <Teleport to="body">
      <Transition name="error-modal">
        <div v-if="showErrorModal" class="modal-overlay error-overlay" @click.self="showErrorModal = false">
          <div class="error-modal">
            <div class="error-icon-wrap">
              <div class="error-icon-ring">
                <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="error-icon" />
              </div>
              <div class="error-pulse"></div>
            </div>
            <h3 class="error-title">{{ errorTitle }}</h3>
            <ul v-if="errorDetails.length" class="error-list">
              <li v-for="(d, i) in errorDetails" :key="i" class="error-item">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="error-item-icon" />
                {{ d }}
              </li>
            </ul>
            <button @click="showErrorModal = false" class="error-dismiss">{{ $t('common.close') }}</button>
          </div>
        </div>
      </Transition>
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

.filters-bar { margin-bottom: 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.tab-bar { display: flex; gap: 4px; background: rgba(255,255,255,0.03); border-radius: 10px; padding: 4px; }
.tab-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.4);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab-btn.active { background: rgba(0,229,255,0.1); color: #00E5FF; }
.tab-btn:hover { color: rgba(255,255,255,0.7); }
.deleted-card { opacity: 0.7; border-color: rgba(255,107,107,0.15); }
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
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  cursor: pointer;
}
.checkbox-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #00C4D4;
  cursor: pointer;
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
  .modal { width: 95%; padding: 18px; max-height: 90vh; overflow-y: auto; }
  .form-row-2 { grid-template-columns: 1fr; }
  .error-modal { width: 92%; }
}

/* Error Modal */
.error-overlay { background: rgba(0,0,0,0.75); }
.error-modal {
  background: #13112a;
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 16px;
  padding: 28px;
  width: 90%;
  max-width: 420px;
  text-align: center;
}
.error-icon-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}
.error-icon-ring {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid rgba(255, 107, 107, 0.3);
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
}
.error-icon {
  font-size: 1.4rem;
  color: #ff6b6b;
}
.error-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid rgba(255, 107, 107, 0.15);
  animation: error-pulse 2s ease-in-out infinite;
}
@keyframes error-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0; }
}
.error-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  line-height: 1.3;
}
.error-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
}
.error-item {
  padding: 8px 12px;
  margin-bottom: 6px;
  background: rgba(255, 107, 107, 0.06);
  border: 1px solid rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.75);
  font-size: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: 'Space Grotesk', sans-serif;
}
.error-item-icon {
  color: rgba(255, 107, 107, 0.5);
  margin-top: 2px;
  flex-shrink: 0;
}
.error-dismiss {
  padding: 10px 28px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  background: rgba(255, 107, 107, 0.08);
  color: #ff6b6b;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.error-dismiss:hover {
  background: rgba(255, 107, 107, 0.15);
  border-color: rgba(255, 107, 107, 0.4);
}

/* Transitions */
.error-modal-enter-active { animation: error-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.error-modal-leave-active { animation: error-out 0.2s ease-in forwards; }
@keyframes error-in {
  0% { opacity: 0; transform: scale(0.85) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes error-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9) translateY(8px); }
}
</style>
