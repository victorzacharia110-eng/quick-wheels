<template>
  <div class="employees-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('employee.title') }}</h1>
        <p class="page-sub">{{ $t('employee.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <font-awesome-icon icon="fa-solid fa-plus" />
        {{ $t('employee.addDriver') }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ employeeStore.totalEmployees }}</div><div class="stat-label">{{ $t('employee.totalDrivers') }}</div></div>
      <div class="stat-card active"><div class="stat-value">{{ employeeStore.activeEmployees.length }}</div><div class="stat-label">{{ $t('employee.active') }}</div></div>
      <div class="stat-card inactive"><div class="stat-value">{{ employeeStore.inactiveEmployees.length }}</div><div class="stat-label">{{ $t('employee.inactive') }}</div></div>
    </div>

    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input v-model="searchQuery" type="text" :placeholder="$t('employee.searchPlaceholder')" class="search-input" />
    </div>

    <div v-if="employeeStore.isLoading" class="loading-skeleton-group">
      <SkeletonLoader variant="table" :rows="8" :cols="7" />
    </div>
    <template v-else>
    <Transition name="fade-slide" mode="out-in">
      <div v-if="filteredEmployees.length > 0" key="table" class="table-container">
        <table class="employees-table">
          <thead>
            <tr>
              <th>{{ $t('employee.name') }}</th>
              <th>{{ $t('employee.phone') }}</th>
              <th>{{ $t('employee.email') }}</th>
              <th>{{ $t('employee.license') }}</th>
              <th>{{ $t('employee.vehicle') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in paginatedData" :key="employee.id" class="table-row-fade" :class="{ 'row-inactive': employee.status === 'inactive' }">
              <td>
                <strong>{{ employee.name }}</strong>
                <span v-if="employee.documents_count" class="doc-count" :title="$t('documents.totalDocuments')">
                  <font-awesome-icon icon="fa-solid fa-file-alt" /> {{ employee.documents_count }}
                </span>
              </td>
              <td>{{ employee.phone }}</td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.license_number }}</td>
              <td>{{ employee.vehicle_name || '—' }}</td>
              <td>
                <span class="status-badge" :class="employee.status">{{ $t('status.' + employee.status) }}</span>
              </td>
              <td>
                <div class="action-btns">
                  <button @click="openEditModal(employee)" class="btn-icon" :title="$t('common.edit')"><font-awesome-icon icon="fa-solid fa-pen" /></button>
                  <button @click="openDocuments(employee)" class="btn-icon" :title="$t('documents.title')"><font-awesome-icon icon="fa-solid fa-folder-open" /></button>
                  <button @click="toggleActivation(employee)" class="btn-icon" :class="employee.status === 'active' ? 'warning' : 'success'" :title="employee.status === 'active' ? $t('documents.deactivate') : $t('documents.reactivate')">
                    <font-awesome-icon :icon="employee.status === 'active' ? 'fa-solid fa-user-slash' : 'fa-solid fa-user-check'" />
                  </button>
                  <button @click="deleteEmployee(employee.id)" class="btn-icon danger" :title="$t('common.delete')"><font-awesome-icon icon="fa-solid fa-trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <Pagination :current-page="page" :per-page="perPage" :total="filteredEmployees.length" @page-change="page = $event" />
      </div>
      <div v-else-if="!employeeStore.isLoading" key="empty" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-users" size="3x" />
        <h3>{{ $t('common.noDrivers') }}</h3>
        <p>{{ $t('employee.noDriversDesc') }}</p>
        <button class="btn-primary" @click="openCreateModal"><font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('employee.addDriver') }}</button>
      </div>
    </Transition>
    </template>

    <!-- Create/Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box large">
          <div class="modal-header">
            <h3>{{ isEditing ? $t('employee.editDriver') : $t('employee.addDriver') }}</h3>
            <button class="modal-close" @click="showModal = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>
          <form @submit.prevent="handleSave">
            <div v-if="errorMsg" class="form-error">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
              {{ errorMsg }}
            </div>
            <div v-if="createdPassword" class="form-success">
              <font-awesome-icon icon="fa-solid fa-check-circle" />
              <div>
                <strong>{{ $t('employee.createdWithPassword') }}</strong>
                <code class="password-display">{{ createdPassword }}</code>
                <button class="btn-copy" @click="copyPassword"><font-awesome-icon icon="fa-solid fa-copy" /></button>
              </div>
            </div>
            <div class="form-grid emp-grid">
              <div class="form-group">
                <label>{{ $t('employee.fullName') }} <span class="required">*</span></label>
                <input v-model="form.name" class="form-input" required :placeholder="$t('employee.fullName') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.phone') }} <span class="required">*</span></label>
                <input v-model="form.phone" class="form-input" required :placeholder="$t('employee.phone') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.email') }} <span class="required">*</span></label>
                <input v-model="form.email" type="email" class="form-input" required :placeholder="$t('employee.email') + '...'" />
              </div>
              <div v-if="!isEditing" class="form-group">
                <label>{{ $t('employee.password') }}</label>
                <input v-model="form.password" type="text" class="form-input" :placeholder="$t('employee.passwordPlaceholder')" />
                <small class="form-hint">{{ $t('employee.passwordHint') }}</small>
              </div>
              <div class="form-group">
                <label>{{ $t('employee.address') }}</label>
                <input v-model="form.address" class="form-input" :placeholder="$t('employee.address') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.nidaNumber') }}</label>
                <input v-model="form.nida_number" class="form-input" :placeholder="$t('employee.nidaNumber') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.licenseNumber') }}</label>
                <input v-model="form.license_number" class="form-input" :placeholder="$t('employee.licenseNumber') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.department') }}</label>
                <input v-model="form.department" class="form-input" :placeholder="$t('employee.department') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.position') }}</label>
                <input v-model="form.position" class="form-input" :placeholder="$t('employee.position') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.salary') }} (TZS)</label>
                <input v-model="form.salary" type="number" class="form-input" :placeholder="$t('employee.salary') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.shift') }}</label>
                <select v-model="form.shift" class="form-input">
                  <option value="day">{{ $t('employee.day') }}</option>
                  <option value="night">{{ $t('employee.night') }}</option>
                  <option value="flexible">{{ $t('employee.flexible') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('employee.vehicle') }}</label>
                <select v-model="form.vehicle_id" class="form-input">
                  <option value="">{{ $t('common.selectVehicle') }}...</option>
                  <option v-for="v in vehicleStore.availableVehicles" :key="v.id" :value="v.id">
                    {{ v.name }} ({{ v.registration_number || v.plate_number || v.type }})
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
              <template v-if="createdPassword">
                <button type="button" @click="showModal = false" class="btn-primary">{{ $t('common.close') }}</button>
              </template>
              <template v-else>
                <button type="submit" class="btn-primary" :disabled="saving">
                  <span v-if="saving"><span class="spinner-sm"></span> {{ $t('employee.saving') }}</span>
                  <span v-else>{{ isEditing ? $t('employee.edit') : $t('employee.create') }}</span>
                </button>
              </template>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Documents Panel -->
    <Transition name="slide-panel">
      <div v-if="showDocPanel" class="panel-overlay" @click.self="showDocPanel = false">
        <div class="doc-panel">
          <div class="panel-header">
            <div>
              <h3>{{ $t('documents.title') }} — {{ selectedEmployee?.name }}</h3>
              <p class="panel-sub">{{ $t('documents.subtitle') }}</p>
            </div>
            <button class="modal-close" @click="showDocPanel = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>

          <div class="upload-zone" @dragover.prevent @drop.prevent="handleDrop">
            <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" hidden />
            <div class="upload-content" @click="$refs.fileInput.click()">
              <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" size="2x" />
              <p>{{ $t('documents.dropOrClick') }}</p>
              <small>{{ $t('documents.fileTypes') }}</small>
            </div>
          </div>

          <div v-if="uploading" class="upload-progress">
            <span class="spinner-sm"></span> {{ $t('documents.uploading') }}
          </div>

          <div v-if="uploadForm.file" class="upload-form">
            <div class="upload-preview">
              <font-awesome-icon :icon="getFileIcon(uploadForm.file?.type)" />
              <span>{{ uploadForm.file?.name }}</span>
              <button class="btn-icon danger" @click="uploadForm.file = null"><font-awesome-icon icon="fa-solid fa-times" /></button>
            </div>
            <div class="form-grid doc-form-grid">
              <div class="form-group">
                <label>{{ $t('documents.type') }} *</label>
                <select v-model="uploadForm.document_type" class="form-input">
                  <option value="contract">{{ $t('documents.types.contract') }}</option>
                  <option value="license">{{ $t('documents.types.license') }}</option>
                  <option value="nida">{{ $t('documents.types.nida') }}</option>
                  <option value="insurance">{{ $t('documents.types.insurance') }}</option>
                  <option value="medical">{{ $t('documents.types.medical') }}</option>
                  <option value="background_check">{{ $t('documents.types.backgroundCheck') }}</option>
                  <option value="other">{{ $t('documents.types.other') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('documents.docTitle') }} *</label>
                <input v-model="uploadForm.title" class="form-input" :placeholder="$t('documents.titlePlaceholder')" />
              </div>
              <div class="form-group">
                <label>{{ $t('documents.expiresAt') }}</label>
                <input v-model="uploadForm.expires_at" type="date" class="form-input" />
              </div>
              <div class="form-group full-width">
                <label>{{ $t('documents.description') }}</label>
                <textarea v-model="uploadForm.description" class="form-input" rows="2" :placeholder="$t('documents.descPlaceholder')"></textarea>
              </div>
            </div>
            <div class="upload-actions">
              <button class="btn-outline" @click="uploadForm.file = null">{{ $t('common.cancel') }}</button>
              <button class="btn-primary" @click="uploadDocument" :disabled="!uploadForm.title">
                <font-awesome-icon icon="fa-solid fa-upload" /> {{ $t('documents.upload') }}
              </button>
            </div>
          </div>

          <div class="doc-list">
            <h4>{{ $t('documents.uploaded') }} ({{ documents.length }})</h4>
            <div v-if="documentsLoading" class="loading-sm">
              <span class="spinner-sm"></span>
            </div>
            <div v-else-if="documents.length === 0" class="empty-docs">
              <font-awesome-icon icon="fa-solid fa-folder-open" />
              <p>{{ $t('documents.noDocuments') }}</p>
            </div>
            <div v-else class="doc-grid">
              <div v-for="doc in documents" :key="doc.id" class="doc-card" :class="{ expired: doc.is_expired }">
                <div class="doc-icon">
                  <font-awesome-icon :icon="getFileIcon(doc.file_mime_type)" />
                </div>
                <div class="doc-info">
                  <div class="doc-title">{{ doc.title }}</div>
                  <div class="doc-meta">
                    <span class="doc-type-badge">{{ $t('documents.types.' + doc.document_type) }}</span>
                    <span>{{ doc.file_size_formatted }}</span>
                  </div>
                  <div v-if="doc.expires_at" class="doc-expiry" :class="{ 'expiry-warn': doc.days_until_expiry !== null && doc.days_until_expiry <= 30, 'expiry-danger': doc.is_expired }">
                    <font-awesome-icon icon="fa-solid fa-clock" />
                    {{ doc.is_expired ? $t('documents.expired') : $t('documents.expiresIn', { days: doc.days_until_expiry }) }}
                  </div>
                  <div v-if="doc.is_verified" class="doc-verified">
                    <font-awesome-icon icon="fa-solid fa-check-circle" /> {{ $t('documents.verified') }}
                  </div>
                </div>
                <div class="doc-actions">
                  <button @click="analyzeDocument(doc)" class="btn-icon" :class="{ 'analyzing': analyzingId === doc.id }" :title="$t('documents.aiAnalyze')" :disabled="analyzingId === doc.id">
                    <font-awesome-icon :icon="analyzingId === doc.id ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-robot'" />
                  </button>
                  <button @click="toggleVerify(doc)" class="btn-icon" :class="doc.is_verified ? 'success' : ''" :title="$t('documents.verify')">
                    <font-awesome-icon icon="fa-solid fa-shield-halved" />
                  </button>
                  <button @click="viewDocument(doc)" class="btn-icon" :title="$t('documents.view')"><font-awesome-icon icon="fa-solid fa-eye" /></button>
                  <button @click="deleteDocument(doc)" class="btn-icon danger" :title="$t('common.delete')"><font-awesome-icon icon="fa-solid fa-trash" /></button>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Analysis Result -->
          <Transition name="modal">
            <div v-if="showAnalysis" class="analysis-overlay" @click.self="showAnalysis = false">
              <div class="analysis-card">
                <div class="analysis-header">
                  <h3><font-awesome-icon icon="fa-solid fa-robot" /> {{ $t('documents.aiAnalysis') }}</h3>
                  <button class="modal-close" @click="showAnalysis = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
                </div>
                <div v-if="analysisResult" class="analysis-content">
                  <div v-if="analysisResult.contract_type" class="analysis-section">
                    <label>{{ $t('documents.analysis.contractType') }}</label>
                    <span class="analysis-value">{{ analysisResult.contract_type }}</span>
                  </div>
                  <div v-if="analysisResult.parties" class="analysis-section">
                    <label>{{ $t('documents.analysis.parties') }}</label>
                    <div class="analysis-detail">
                      <span><strong>{{ $t('documents.analysis.owner') }}:</strong> {{ analysisResult.parties.owner }}</span>
                      <span><strong>{{ $t('documents.analysis.driver') }}:</strong> {{ analysisResult.parties.driver }}</span>
                    </div>
                  </div>
                  <div v-if="analysisResult.vehicle" class="analysis-section">
                    <label>{{ $t('documents.analysis.vehicle') }}</label>
                    <div class="analysis-detail">
                      <span v-if="analysisResult.vehicle.type">{{ analysisResult.vehicle.type }}</span>
                      <span v-if="analysisResult.vehicle.make">{{ analysisResult.vehicle.make }}</span>
                      <span v-if="analysisResult.vehicle.plate_number">{{ analysisResult.vehicle.plate_number }}</span>
                    </div>
                  </div>
                  <div v-if="analysisResult.terms" class="analysis-section">
                    <label>{{ $t('documents.analysis.terms') }}</label>
                    <div class="analysis-terms">
                      <div v-for="(val, key) in analysisResult.terms" :key="key" class="term-item" v-show="val">
                        <span class="term-key">{{ key.replace(/_/g, ' ') }}</span>
                        <span class="term-val">{{ val }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="analysisResult.conditions?.length" class="analysis-section">
                    <label>{{ $t('documents.analysis.conditions') }}</label>
                    <ul class="analysis-list">
                      <li v-for="(c, i) in analysisResult.conditions" :key="i">{{ c }}</li>
                    </ul>
                  </div>
                  <div v-if="analysisResult.restrictions?.length" class="analysis-section">
                    <label>{{ $t('documents.analysis.restrictions') }}</label>
                    <ul class="analysis-list">
                      <li v-for="(r, i) in analysisResult.restrictions" :key="i">{{ r }}</li>
                    </ul>
                  </div>
                  <div v-if="analysisResult.insurance" class="analysis-section">
                    <label>{{ $t('documents.analysis.insurance') }}</label>
                    <div class="analysis-detail">
                      <span>{{ analysisResult.insurance.required ? $t('documents.analysis.required') : $t('documents.analysis.notRequired') }}</span>
                      <span v-if="analysisResult.insurance.provider">{{ analysisResult.insurance.provider }}</span>
                    </div>
                  </div>
                  <div v-if="analysisResult.special_notes?.length" class="analysis-section">
                    <label>{{ $t('documents.analysis.specialNotes') }}</label>
                    <ul class="analysis-list">
                      <li v-for="(n, i) in analysisResult.special_notes" :key="i">{{ n }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmployeeStore } from '@/stores/employees'
import { useVehicleStore } from '@/stores/vehicles'
import api from '@/composables/api'
import Pagination from '@/components/common/Pagination.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const employeeStore = useEmployeeStore()
const vehicleStore = useVehicleStore()
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const errorMsg = ref('')
const createdPassword = ref('')
const page = ref(1)
const perPage = 15

const showDocPanel = ref(false)
const selectedEmployee = ref(null)
const documents = ref([])
const documentsLoading = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const uploadForm = ref({ file: null, document_type: 'contract', title: '', description: '', expires_at: '' })

const analyzingId = ref(null)
const showAnalysis = ref(false)
const analysisResult = ref(null)

const defaultForm = () => ({
  name: '', phone: '', email: '', password: '', address: '', nida_number: '',
  license_number: '', department: '', position: '', salary: '', shift: 'day',
  vehicle_id: ''
})
const form = ref(defaultForm())

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employeeStore.employees
  const q = searchQuery.value.toLowerCase()
  return employeeStore.employees.filter(e =>
    e.name?.toLowerCase().includes(q) || e.phone?.includes(q) || e.email?.toLowerCase().includes(q)
  )
})

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredEmployees.value.slice(start, start + perPage)
})

watch(searchQuery, () => { page.value = 1 })

function openCreateModal() {
  isEditing.value = false; editingId.value = null
  form.value = defaultForm(); errorMsg.value = ''; createdPassword.value = ''; showModal.value = true
}

function openEditModal(emp) {
  isEditing.value = true; editingId.value = emp.id
  form.value = {
    name: emp.name, phone: emp.phone, email: emp.email, address: emp.address || '',
    nida_number: emp.nida_number || '', license_number: emp.license_number || '',
    department: emp.department || '', position: emp.position || '',
    salary: emp.salary || '', shift: emp.shift || 'day',
    vehicle_id: emp.vehicle_id || ''
  }
  errorMsg.value = ''; showModal.value = true
}

async function handleSave() {
  saving.value = true
  errorMsg.value = ''
  try {
    if (isEditing.value) {
      const res = await employeeStore.updateEmployee(editingId.value, form.value)
      if (!res.success) { errorMsg.value = res.message || t('common.error'); return }
      if (form.value.vehicle_id) {
        const assignRes = await employeeStore.assignVehicle(editingId.value, form.value.vehicle_id)
        if (!assignRes.success) { errorMsg.value = assignRes.message || t('common.error'); return }
      }
    } else {
      const res = await employeeStore.createEmployee(form.value)
      if (!res.success) { errorMsg.value = res.message || t('common.error'); return }
      createdPassword.value = res.data?.password || ''
      form.value.password = createdPassword.value
      return
    }
    showModal.value = false
    employeeStore.fetchEmployees()
  } catch (_) { errorMsg.value = t('common.unexpectedError') } finally { saving.value = false }
}

function copyPassword() {
  navigator.clipboard.writeText(createdPassword.value)
}

async function deleteEmployee(id) {
  if (confirm(t('employee.deleteConfirm'))) await employeeStore.deleteEmployee(id)
}

async function toggleActivation(employee) {
  const action = employee.status === 'active' ? 'deactivate' : 'reactivate'
  if (!confirm(t(`documents.confirm${action.charAt(0).toUpperCase() + action.slice(1)}`))) return
  try {
    await employeeStore.toggleEmployeeStatus(employee.id)
    employeeStore.fetchEmployees()
  } catch (_) {}
}

async function openDocuments(employee) {
  selectedEmployee.value = employee
  showDocPanel.value = true
  await loadDocuments(employee.id)
}

async function loadDocuments(employeeId) {
  documentsLoading.value = true
  try {
    const { data } = await api.get(`/owner/employees/${employeeId}/documents`)
    documents.value = data.data || []
  } catch { documents.value = [] }
  documentsLoading.value = false
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) setUploadFile(file)
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) setUploadFile(file)
}

function setUploadFile(file) {
  uploadForm.value.file = file
  if (!uploadForm.value.title) {
    uploadForm.value.title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
  }
}

async function uploadDocument() {
  if (!uploadForm.value.file || !uploadForm.value.title) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', uploadForm.value.file)
    fd.append('document_type', uploadForm.value.document_type)
    fd.append('title', uploadForm.value.title)
    if (uploadForm.value.description) fd.append('description', uploadForm.value.description)
    if (uploadForm.value.expires_at) fd.append('expires_at', uploadForm.value.expires_at)

    await api.post(`/owner/employees/${selectedEmployee.value.id}/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    uploadForm.value = { file: null, document_type: 'contract', title: '', description: '', expires_at: '' }
    await loadDocuments(selectedEmployee.value.id)
  } catch (err) {
    alert(err.response?.data?.message || t('documents.uploadFailed'))
  }
  uploading.value = false
}

async function deleteDocument(doc) {
  if (!confirm(t('documents.deleteConfirm'))) return
  try {
    await api.delete(`/owner/employees/${selectedEmployee.value.id}/documents/${doc.id}`)
    await loadDocuments(selectedEmployee.value.id)
  } catch (_) {}
}

async function toggleVerify(doc) {
  try {
    await api.patch(`/owner/employees/${selectedEmployee.value.id}/documents/${doc.id}/verify`)
    await loadDocuments(selectedEmployee.value.id)
  } catch (_) {}
}

async function viewDocument(doc) {
  try {
    const res = await api.get(`/owner/employees/${selectedEmployee.value.id}/documents/${doc.id}/download`, {
      responseType: 'blob'
    })
    if (res.data.type && res.data.type.includes('application/json')) {
      const text = await res.data.text()
      const json = JSON.parse(text)
      alert(json.message || t('documents.viewFailed'))
      return
    }
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
    URL.revokeObjectURL(url)
  } catch (err) {
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text()
      try { alert(JSON.parse(text).message) } catch { alert(t('documents.viewFailed')) }
    } else {
      alert(err.response?.data?.message || t('documents.viewFailed'))
    }
  }
}

async function analyzeDocument(doc) {
  analyzingId.value = doc.id
  try {
    const { data } = await api.post(`/owner/employees/${selectedEmployee.value.id}/documents/${doc.id}/analyze`)
    analysisResult.value = data.data?.analysis
    showAnalysis.value = true
    await loadDocuments(selectedEmployee.value.id)
  } catch (err) {
    alert(err.response?.data?.message || t('documents.analysisFailed'))
  }
  analyzingId.value = null
}

function getFileIcon(mimeType) {
  if (!mimeType) return 'fa-solid fa-file'
  if (mimeType.startsWith('image/')) return 'fa-solid fa-file-image'
  if (mimeType.includes('pdf')) return 'fa-solid fa-file-pdf'
  if (mimeType.includes('word') || mimeType.includes('doc')) return 'fa-solid fa-file-word'
  return 'fa-solid fa-file'
}

onMounted(() => {
  employeeStore.fetchEmployees()
  vehicleStore.fetchVehicles()
})
</script>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.employees-page { }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 20px; text-align: center; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #fff; }
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.stat-card.active .stat-value { color: #00E5FF; }
.stat-card.inactive .stat-value { color: #ff6b6b; }

.search-bar { position: relative; margin-bottom: 24px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); }
.search-input { width: 100%; padding: 10px 16px 10px 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s; font-family: 'Space Grotesk', sans-serif; }
.search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }

.table-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow-x: auto; }
.employees-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.employees-table th { text-align: left; padding: 14px 16px; color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.employees-table td { padding: 14px 16px; color: rgba(255,255,255,0.7); font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); animation: fadeIn 0.3s ease both; }
.employees-table tr:hover td { background: rgba(255,255,255,0.02); }
.employees-table tr:last-child td { border-bottom: none; }
.employees-table tr.row-inactive td { opacity: 0.5; }
.status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; }
.status-badge.active { background: rgba(0,229,255,0.15); color: #00E5FF; }
.status-badge.inactive { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.doc-count { margin-left: 6px; font-size: 0.7rem; color: rgba(0,229,255,0.5); }

.action-btns { display: flex; gap: 4px; }
.btn-icon { padding: 4px 8px; border: none; background: rgba(255,255,255,0.05); border-radius: 4px; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-icon.danger:hover { background: rgba(255,107,107,0.15); color: #ff6b6b; }
.btn-icon.warning:hover { background: rgba(255,217,61,0.15); color: #FFD93D; }
.btn-icon.success { color: #4ADE80; }
.btn-icon.success:hover { background: rgba(74,222,128,0.15); color: #4ADE80; }
.btn-icon.analyzing { color: #00E5FF; }

.empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.25s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(12px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-box { background: #13102a; border: 1px solid rgba(0,229,255,0.15); border-radius: 16px; padding: 30px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; }
.modal-box.large { max-width: 720px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.2rem; }
.modal-close { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.6); cursor: pointer; padding: 6px 10px; transition: all 0.2s; }
.modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.emp-grid { grid-template-columns: 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); }
.required { color: #ff6b6b; }
.form-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,0,0,0.08); border: 1px solid rgba(255,0,0,0.2); border-radius: 10px; font-size: 0.85rem; color: #ff6b6b; grid-column: 1 / -1; }
.form-success { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.2); border-radius: 10px; font-size: 0.85rem; color: #00E5FF; grid-column: 1 / -1; margin-bottom: 16px; }
.form-success code { display: inline-block; margin: 4px 0; padding: 4px 10px; background: rgba(0,0,0,0.3); border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; letter-spacing: 1px; color: #fff; }
.btn-copy { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid rgba(0,229,255,0.3); background: rgba(0,229,255,0.1); border-radius: 6px; color: #00E5FF; cursor: pointer; transition: all 0.2s; vertical-align: middle; }
.btn-copy:hover { background: rgba(0,229,255,0.2); }
.form-hint { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'Space Grotesk', sans-serif; }
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
.form-input::placeholder { color: rgba(255,255,255,0.25); }
select.form-input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; background: linear-gradient(135deg, #00C4D4, #00E5FF); color: #0a0818; font-weight: 700; font-size: 0.85rem; border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; }
.btn-outline { padding: 10px 20px; border-radius: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; }
.spinner-sm { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(10,8,24,0.2); border-top-color: #0a0818; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal-box { transform: scale(0.92) translateY(20px); }
.modal-leave-to { opacity: 0; }

/* Document Panel */
.panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 250; display: flex; justify-content: flex-end; }
.doc-panel { background: #0f0d24; width: 600px; max-width: 100%; height: 100vh; overflow-y: auto; padding: 28px; border-left: 1px solid rgba(0,229,255,0.1); }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.panel-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.1rem; }
.panel-sub { color: rgba(255,255,255,0.35); font-size: 0.85rem; margin-top: 4px; }

.upload-zone { border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 20px; cursor: pointer; transition: border-color 0.2s; }
.upload-zone:hover { border-color: rgba(0,229,255,0.3); }
.upload-content svg { color: rgba(255,255,255,0.2); margin-bottom: 10px; }
.upload-content p { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 4px; }
.upload-content small { color: rgba(255,255,255,0.25); font-size: 0.75rem; }
.upload-progress { display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(0,229,255,0.05); border-radius: 8px; color: #00E5FF; font-size: 0.85rem; margin-bottom: 16px; }

.upload-form { margin-bottom: 24px; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; }
.upload-preview { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 14px; color: rgba(255,255,255,0.6); font-size: 0.85rem; }
.upload-preview span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-form-grid { grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.upload-actions { display: flex; gap: 10px; justify-content: flex-end; }

.doc-list h4 { color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
.empty-docs { text-align: center; padding: 30px; color: rgba(255,255,255,0.2); }
.empty-docs svg { margin-bottom: 8px; opacity: 0.3; }
.loading-sm { text-align: center; padding: 20px; }
.doc-grid { display: flex; flex-direction: column; gap: 10px; }
.doc-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; transition: border-color 0.2s; }
.doc-card:hover { border-color: rgba(255,255,255,0.1); }
.doc-card.expired { border-color: rgba(255,107,107,0.3); }
.doc-icon { width: 40px; height: 40px; border-radius: 8px; background: rgba(0,229,255,0.08); display: flex; align-items: center; justify-content: center; color: #00E5FF; font-size: 1rem; flex-shrink: 0; }
.doc-info { flex: 1; min-width: 0; }
.doc-title { color: #fff; font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
.doc-meta { display: flex; gap: 8px; font-size: 0.75rem; color: rgba(255,255,255,0.35); }
.doc-type-badge { padding: 1px 6px; background: rgba(0,229,255,0.1); border-radius: 4px; color: #00E5FF; font-size: 0.7rem; font-weight: 600; }
.doc-expiry { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.doc-expiry.expiry-warn { color: #FFD93D; }
.doc-expiry.expiry-danger { color: #ff6b6b; }
.doc-verified { font-size: 0.75rem; color: #4ADE80; margin-top: 2px; }
.doc-actions { display: flex; gap: 4px; flex-shrink: 0; }

.slide-panel-enter-active { transition: all 0.3s ease; }
.slide-panel-leave-active { transition: all 0.2s ease; }
.slide-panel-enter-from .doc-panel { transform: translateX(100%); }
.slide-panel-leave-to .doc-panel { transform: translateX(100%); }

/* AI Analysis */
.analysis-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 24px; }
.analysis-card { background: #13102a; border: 1px solid rgba(0,229,255,0.2); border-radius: 16px; width: 100%; max-width: 600px; max-height: 80vh; overflow-y: auto; }
.analysis-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.analysis-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1rem; display: flex; align-items: center; gap: 8px; }
.analysis-header h3 svg { color: #00E5FF; }
.analysis-content { padding: 24px; }
.analysis-section { margin-bottom: 18px; }
.analysis-section label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.35); margin-bottom: 6px; font-weight: 600; }
.analysis-value { color: #00E5FF; font-weight: 700; font-size: 1rem; text-transform: capitalize; }
.analysis-detail { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
.analysis-terms { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.term-item { display: flex; flex-direction: column; padding: 8px; background: rgba(255,255,255,0.02); border-radius: 6px; }
.term-key { font-size: 0.75rem; color: rgba(255,255,255,0.35); text-transform: capitalize; }
.term-val { font-size: 0.85rem; color: rgba(255,255,255,0.7); font-weight: 600; }
.analysis-list { list-style: none; padding: 0; margin: 0; }
.analysis-list li { padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.85rem; color: rgba(255,255,255,0.6); }
.analysis-list li:last-child { border-bottom: none; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .emp-grid { grid-template-columns: 1fr; }
  .doc-panel { width: 100%; }
  .doc-form-grid { grid-template-columns: 1fr; }
  .analysis-terms { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
