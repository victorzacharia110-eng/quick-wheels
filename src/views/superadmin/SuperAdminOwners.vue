<template>
  <div class="owners-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('superadmin.manageOwners') }}</h1>
        <p class="page-sub">{{ $t('superadmin.ownersSubtitle') }}</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" :placeholder="$t('superadmin.searchOwners')" class="search-input" @input="debouncedSearch" />
      </div>
      <div class="filter-group">
        <select v-model="verifiedFilter" class="filter-select" @change="fetchOwners(1)">
          <option value="">{{ $t('superadmin.allVerification') }}</option>
          <option value="1">{{ $t('superadmin.verified') }}</option>
          <option value="0">{{ $t('superadmin.unverified') }}</option>
        </select>
      </div>
    </div>

    <SkeletonLoader v-if="loading" variant="table" :rows="8" :cols="5" />

    <div v-else-if="error" class="error-state">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" size="2x" />
      <p>{{ $t('common.error') }}: {{ error }}</p>
      <button class="btn-primary" @click="fetchOwners(1)">{{ $t('home.retry') }}</button>
    </div>

    <div v-else-if="owners.length === 0" class="empty-state">
      <font-awesome-icon icon="fa-solid fa-building" size="3x" />
      <h3>{{ $t('superadmin.noOwnersFound') }}</h3>
      <p>{{ $t('superadmin.noOwnersMatch') }}</p>
    </div>

    <div v-else class="table-container">
      <table class="owners-table">
        <thead>
          <tr>
            <th>{{ $t('superadmin.businessName') }}</th>
            <th>{{ $t('common.email') }}</th>
            <th>{{ $t('common.phone') }}</th>
            <th>{{ $t('superadmin.license') }}</th>
            <th>{{ $t('superadmin.verification') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th>{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="owner in owners" :key="owner.id" @click="selectOwner(owner)" class="clickable-row">
            <td><strong>{{ owner.business_name || owner.user?.name }}</strong></td>
            <td>{{ owner.business_email || owner.user?.email }}</td>
            <td>{{ owner.business_phone || owner.user?.phone }}</td>
            <td>{{ owner.business_license || '\u2014' }}</td>
            <td>
              <span class="badge" :class="owner.is_verified ? 'verified' : 'unverified'">
                {{ owner.is_verified ? $t('superadmin.verified') : $t('superadmin.unverified') }}
              </span>
            </td>
            <td>
              <span class="badge" :class="owner.user?.is_active ? 'active' : 'inactive'">
                {{ owner.user?.is_active ? $t('status.active') : $t('status.inactive') }}
              </span>
            </td>
            <td class="actions-cell" @click.stop>
              <button @click="confirmToggleVerification(owner)" class="btn-icon" :title="owner.is_verified ? $t('superadmin.unverify') : $t('superadmin.verify')">
                <font-awesome-icon :icon="owner.is_verified ? 'fa-solid fa-times-circle' : 'fa-solid fa-check-circle'" />
              </button>
              <button @click="confirmToggleStatus(owner)" class="btn-icon" :title="owner.user?.is_active ? $t('superadmin.deactivate') : $t('superadmin.activate')">
                <font-awesome-icon :icon="owner.user?.is_active ? 'fa-solid fa-ban' : 'fa-solid fa-check'" />
              </button>
              <button @click="confirmDelete(owner)" class="btn-icon danger" :title="$t('common.delete')">
                <font-awesome-icon icon="fa-solid fa-trash" />
              </button>
              <button @click="confirmResetPassword(owner)" class="btn-icon" :title="$t('superadmin.resetPassword')">
                <font-awesome-icon icon="fa-solid fa-key" />
              </button>
              <button @click="openEditModal(owner)" class="btn-icon" :title="$t('common.edit')">
                <font-awesome-icon icon="fa-solid fa-pen" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        :currentPage="currentPage"
        :perPage="perPage"
        :total="totalOwners"
        @page-change="fetchOwners"
      />
    </div>

    <Transition name="modal">
      <div v-if="showDetailModal && selectedOwner" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ selectedOwner.business_name || selectedOwner.user?.name }}</h3>
            <button class="modal-close" @click="showDetailModal = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.ownerName') }}</span>
              <span class="detail-value">{{ selectedOwner.user?.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('common.email') }}</span>
              <span class="detail-value">{{ selectedOwner.business_email || selectedOwner.user?.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('common.phone') }}</span>
              <span class="detail-value">{{ selectedOwner.business_phone || selectedOwner.user?.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.businessName') }}</span>
              <span class="detail-value">{{ selectedOwner.business_name || '\u2014' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.businessAddress') }}</span>
              <span class="detail-value">{{ selectedOwner.business_address || '\u2014' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.license') }}</span>
              <span class="detail-value">{{ selectedOwner.business_license || '\u2014' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.businessWebsite') }}</span>
              <span class="detail-value">{{ selectedOwner.business_website || '\u2014' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('common.nida') }}</span>
              <span class="detail-value">{{ selectedOwner.user?.nida_number || '\u2014' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.verification') }}</span>
              <span class="detail-value">
                <span class="badge" :class="selectedOwner.is_verified ? 'verified' : 'unverified'">
                  {{ selectedOwner.is_verified ? $t('superadmin.verified') : $t('superadmin.unverified') }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('common.status') }}</span>
              <span class="detail-value">
                <span class="badge" :class="selectedOwner.user?.is_active ? 'active' : 'inactive'">
                  {{ selectedOwner.user?.is_active ? $t('status.active') : $t('status.inactive') }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">{{ $t('superadmin.joined') }}</span>
              <span class="detail-value">{{ formatDate(selectedOwner.created_at) }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showDetailModal = false" class="btn-outline">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showEditModal && editingOwner" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('superadmin.editOwner') }}</h3>
            <button class="modal-close" @click="showEditModal = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>
          <form @submit.prevent="saveEdit">
            <div class="form-grid">
              <div class="form-group">
                <label>{{ $t('superadmin.ownerName') }}</label>
                <input v-model="editForm.name" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>{{ $t('common.email') }}</label>
                <input v-model="editForm.email" type="email" class="form-input" />
              </div>
              <div class="form-group">
                <label>{{ $t('common.phone') }}</label>
                <input v-model="editForm.phone" type="tel" class="form-input" />
              </div>
              <div class="form-group">
                <label>{{ $t('superadmin.businessName') }}</label>
                <input v-model="editForm.business_name" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>{{ $t('superadmin.businessAddress') }}</label>
                <input v-model="editForm.business_address" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>{{ $t('superadmin.license') }}</label>
                <input v-model="editForm.business_license" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>{{ $t('superadmin.businessWebsite') }}</label>
                <input v-model="editForm.business_website" type="url" class="form-input" />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEditModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <span v-if="isSaving"><span class="spinner-sm"></span> {{ $t('common.saving') }}</span>
                <span v-else>{{ $t('common.saveChanges') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showResetModal" class="modal-overlay" @click.self="showResetModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('superadmin.resetPassword') }}</h3>
            <button class="modal-close" @click="showResetModal = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 16px;">
            {{ $t('superadmin.resetPasswordConfirm') }} <strong>{{ resettingOwner?.user?.name }}</strong>?
          </p>
          <div v-if="resetResult" class="reset-result">
            <p style="color: #4ADE80; margin-bottom: 8px;">{{ $t('superadmin.resetPasswordSuccess') }}</p>
            <div class="password-display">
              <code>{{ resetResult.default_password }}</code>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showResetModal = false" class="btn-outline">{{ resetResult ? $t('common.close') : $t('common.cancel') }}</button>
            <button v-if="!resetResult" @click="doResetPassword" class="btn-primary" :disabled="isResetting">
              <span v-if="isResetting"><span class="spinner-sm"></span> {{ $t('common.pleaseWait') }}</span>
              <span v-else><font-awesome-icon icon="fa-solid fa-key" /> {{ $t('superadmin.resetPassword') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()

const owners = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const verifiedFilter = ref('')
const showDetailModal = ref(false)
const selectedOwner = ref(null)
const showEditModal = ref(false)
const editingOwner = ref(null)
const isSaving = ref(false)
const editForm = ref({})
const currentPage = ref(1)
const perPage = ref(15)
const totalOwners = ref(0)
const showResetModal = ref(false)
const resettingOwner = ref(null)
const resetResult = ref(null)
const isResetting = ref(false)

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { fetchOwners(1) }, 400)
}

function formatDate(date) {
  if (!date) return '\u2014'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function fetchOwners(page = 1) {
  loading.value = true
  error.value = null
  try {
    const params = { page }
    if (searchQuery.value) params.search = searchQuery.value
    if (verifiedFilter.value !== '') params.verified = verifiedFilter.value
    const res = await api.get('/superadmin/owners', { params })
    if (res.data.success) {
      owners.value = res.data.data || []
      if (res.data.meta) {
        currentPage.value = res.data.meta.current_page || 1
        perPage.value = res.data.meta.per_page || 15
        totalOwners.value = res.data.meta.total || 0
      }
    }
  } catch (err) {
    console.error('Failed to fetch owners:', err)
    error.value = err.response?.data?.message || err.message
  } finally {
    loading.value = false
  }
}

async function selectOwner(owner) {
  try {
    const res = await api.get(`/superadmin/owners/${owner.id}`)
    if (res.data.success) {
      selectedOwner.value = res.data.data
      showDetailModal.value = true
    }
  } catch (err) {
    console.error('Failed to fetch owner details:', err)
    alert(err.response?.data?.message || err.message)
  }
}

function confirmToggleVerification(owner) {
  const action = owner.is_verified ? t('superadmin.unverify') : t('superadmin.verify')
  if (!confirm(`${action} "${owner.business_name || owner.user?.name}"?`)) return
  toggleVerification(owner)
}

async function toggleVerification(owner) {
  try {
    const res = await api.post(`/superadmin/owners/${owner.id}/toggle-verification`)
    if (res.data.success) {
      owner.is_verified = !owner.is_verified
    }
  } catch (err) {
    console.error('Failed to toggle verification:', err)
    alert(err.response?.data?.message || err.message)
  }
}

function confirmToggleStatus(owner) {
  const action = owner.user?.is_active ? t('superadmin.deactivate') : t('superadmin.activate')
  if (!confirm(`${action} "${owner.business_name || owner.user?.name}"?`)) return
  toggleStatus(owner)
}

async function toggleStatus(owner) {
  try {
    const res = await api.post(`/superadmin/owners/${owner.id}/toggle-status`)
    if (res.data.success) {
      if (owner.user) owner.user.is_active = !owner.user.is_active
    }
  } catch (err) {
    console.error('Failed to toggle status:', err)
    alert(err.response?.data?.message || err.message)
  }
}

function confirmDelete(owner) {
  if (!confirm(`Delete owner "${owner.business_name || owner.user?.name}"? This cannot be undone.`)) return
  deleteOwner(owner)
}

async function deleteOwner(owner) {
  try {
    const res = await api.delete(`/superadmin/owners/${owner.id}`)
    if (res.data.success) {
      owners.value = owners.value.filter(o => o.id !== owner.id)
      totalOwners.value = Math.max(0, totalOwners.value - 1)
    }
  } catch (err) {
    console.error('Failed to delete owner:', err)
    alert(err.response?.data?.message || err.message)
  }
}

function openEditModal(owner) {
  editingOwner.value = owner
  editForm.value = {
    name: owner.user?.name || '',
    email: owner.business_email || owner.user?.email || '',
    phone: owner.business_phone || owner.user?.phone || '',
    business_name: owner.business_name || '',
    business_address: owner.business_address || '',
    business_license: owner.business_license || '',
    business_website: owner.business_website || '',
  }
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingOwner.value) return
  isSaving.value = true
  try {
    const res = await api.put(`/superadmin/owners/${editingOwner.value.id}`, editForm.value)
    if (res.data.success) {
      showEditModal.value = false
      await fetchOwners(currentPage.value)
    }
  } catch (err) {
    console.error('Failed to update owner:', err)
    alert(err.response?.data?.message || err.message)
  } finally {
    isSaving.value = false
  }
}

function confirmResetPassword(owner) {
  resettingOwner.value = owner
  resetResult.value = null
  showResetModal.value = true
}

async function doResetPassword() {
  if (!resettingOwner.value) return
  isResetting.value = true
  try {
    const res = await api.post(`/superadmin/owners/${resettingOwner.value.id}/reset-password`)
    if (res.data.success) {
      resetResult.value = res.data.data
    }
  } catch (err) {
    console.error('Failed to reset password:', err)
    alert(err.response?.data?.message || err.message)
  } finally {
    isResetting.value = false
  }
}

onMounted(() => fetchOwners(1))
</script>

<style scoped>
.owners-page { padding: 0; }
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

.filters-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.search-bar {
  flex: 1;
  position: relative;
  min-width: 200px;
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
.filter-group { display: flex; gap: 10px; }
.filter-select {
  padding: 10px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
}
.filter-select:focus { border-color: rgba(0,229,255,0.4); }

.table-container {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow-x: auto;
}
.owners-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}
.owners-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.owners-table td {
  padding: 14px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.owners-table tr:hover td { background: rgba(255,255,255,0.02); }
.owners-table tr:last-child td { border-bottom: none; }
.clickable-row { cursor: pointer; }

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

.actions-cell { white-space: nowrap; }
.btn-icon {
  padding: 4px 8px;
  border: none;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 2px;
}
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-icon.danger:hover { background: rgba(255,107,107,0.2); color: #ff6b6b; }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.error-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255,255,255,0.5);
}
.error-state svg { color: #ff6b6b; margin-bottom: 12px; }
.error-state p { margin-bottom: 16px; color: rgba(255,255,255,0.4); }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.modal-box {
  background: #13102a;
  border: 1px solid rgba(0,229,255,0.15);
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.2rem; }
.modal-close {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 6px 10px;
  transition: all 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 0.9rem; color: #fff; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); }
.form-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,229,255,0.35); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

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

.spinner-sm {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(10,8,24,0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.reset-result { margin: 16px 0; }
.password-display {
  background: rgba(74,222,128,0.1);
  border: 1px solid rgba(74,222,128,0.2);
  border-radius: 8px;
  padding: 12px 16px;
}
.password-display code {
  color: #4ADE80;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95); }

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .filter-group { flex-wrap: wrap; }
  .detail-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .modal-box { padding: 24px; }
  .page-header { flex-direction: column; align-items: stretch; }
}
@media (max-width: 480px) {
  .modal-box { padding: 20px; }
  .modal-actions { flex-direction: column; }
  .modal-actions .btn-primary,
  .modal-actions .btn-outline { width: 100%; justify-content: center; }
}
</style>
