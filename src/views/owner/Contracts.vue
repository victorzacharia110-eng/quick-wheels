
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContractStore } from '@/stores/contracts'
import Pagination from '@/components/common/Pagination.vue'
import { useVehicleStore } from '@/stores/vehicles'
import { useEmployeeStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import api from '@/composables/api'

const { t } = useI18n()
const contractStore = useContractStore()
const vehicleStore = useVehicleStore()
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const filterType = ref('all')
const filterStatus = ref('all')
const showCreateModal = ref(false)
const showViewModal = ref(false)
const viewingContract = ref(null)
const isEditing = ref(false)
const editingContractId = ref(null)
const isSaving = ref(false)
const page = ref(1)
const perPage = 15

const showDocPanel = ref(false)
const selectedContract = ref(null)
const documents = ref([])
const documentsLoading = ref(false)
const uploading = ref(false)
const uploadForm = ref({ file: null, document_type: 'signed_contract', title: '', description: '' })
const analyzingId = ref(null)
const showAnalysis = ref(false)
const analysisResult = ref(null)

const form = ref({
  employee_id: '',
  vehicle_id: '',
  contract_type: 'hire_purchase',
  payment_frequency: 'weekly',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  amount: '',
  deposit: '',
  notes: ''
})

const filteredContracts = computed(() => {
  let filtered = contractStore.contracts
  if (filterType.value !== 'all') {
    filtered = filtered.filter(c => c.contract_type === filterType.value)
  }
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(c => c.status === filterStatus.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.driver_name?.toLowerCase().includes(q) ||
      c.vehicle_name?.toLowerCase().includes(q) ||
      c.contract_number?.toLowerCase().includes(q)
    )
  }
  return filtered
})

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredContracts.value.slice(start, start + perPage)
})

watch(searchQuery, () => { page.value = 1 })

function getTypeIcon(type) {
  const icons = {
    Motorcycle: 'fa-solid fa-motorcycle',
    Bajaji: 'fa-solid fa-truck-front',
    Car: 'fa-solid fa-car',
    SUV: 'fa-solid fa-truck'
  }
  return icons[type] || 'fa-solid fa-car'
}

function openCreateModal() {
  isEditing.value = false; editingContractId.value = null
  form.value = {
    employee_id: '', vehicle_id: '', contract_type: 'hire_purchase',
    payment_frequency: 'weekly', start_date: new Date().toISOString().split('T')[0],
    end_date: '', amount: '', deposit: '', notes: ''
  }
  showCreateModal.value = true
}
function viewContract(contract) {
  viewingContract.value = contract
  showViewModal.value = true
}
function editContract(contract) {
  isEditing.value = true; editingContractId.value = contract.id
  form.value = {
    employee_id: contract.employee_id || contract.driver_id || '',
    vehicle_id: contract.vehicle_id || '',
    contract_type: contract.contract_type || 'hire_purchase',
    payment_frequency: contract.payment_frequency || 'weekly',
    start_date: contract.start_date || new Date().toISOString().split('T')[0],
    end_date: contract.end_date || '',
    amount: contract.total_amount || '',
    deposit: contract.deposit || 0,
    notes: contract.notes || ''
  }
  showCreateModal.value = true
}

async function downloadPdf(contract) {
  try {
    const lang = localStorage.getItem('locale') || 'en'
    const res = await api.get(`/contracts/${contract.id}/pdf`, {
      params: { lang },
      responseType: 'blob'
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract_${contract.contract_number}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    alert(t('contract.downloadPdf') + ': ' + (err.response?.data?.message || err.message))
  }
}

async function saveContract() {
  isSaving.value = true
  try {
    const payload = {
      employee_id: form.value.employee_id,
      vehicle_id: form.value.vehicle_id,
      contract_type: form.value.contract_type,
      payment_frequency: form.value.payment_frequency,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      total_amount: form.value.amount,
      deposit: form.value.deposit || 0,
      notes: form.value.notes,
    }
    if (isEditing.value) {
      await contractStore.updateContract(editingContractId.value, payload)
    } else {
      await contractStore.createContract(payload)
    }
    showCreateModal.value = false
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to save contract')
  } finally { isSaving.value = false }
}

onMounted(async () => {
  await Promise.all([
    contractStore.fetchContracts(),
    vehicleStore.fetchVehicles(),
    employeeStore.fetchEmployees()
  ])
})

async function openDocuments(contract) {
  selectedContract.value = contract
  showDocPanel.value = true
  await loadDocuments(contract.id)
}

async function loadDocuments(contractId) {
  documentsLoading.value = true
  try {
    const { data } = await api.get(`/owner/contracts/${contractId}/documents`)
    documents.value = data.data || []
  } catch { documents.value = [] }
  documentsLoading.value = false
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    uploadForm.value.file = file
    if (!uploadForm.value.title) uploadForm.value.title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
  }
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file) {
    uploadForm.value.file = file
    if (!uploadForm.value.title) uploadForm.value.title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
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
    await api.post(`/owner/contracts/${selectedContract.value.id}/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    uploadForm.value = { file: null, document_type: 'signed_contract', title: '', description: '' }
    await loadDocuments(selectedContract.value.id)
  } catch (err) {
    alert(err.response?.data?.message || t('documents.uploadFailed'))
  }
  uploading.value = false
}

async function deleteDocument(doc) {
  if (!confirm(t('documents.deleteConfirm'))) return
  try {
    await api.delete(`/owner/contracts/${selectedContract.value.id}/documents/${doc.id}`)
    await loadDocuments(selectedContract.value.id)
  } catch (_) {}
}

async function toggleVerify(doc) {
  try {
    await api.patch(`/owner/contracts/${selectedContract.value.id}/documents/${doc.id}/verify`)
    await loadDocuments(selectedContract.value.id)
  } catch (_) {}
}

async function analyzeDocument(doc) {
  analyzingId.value = doc.id
  try {
    const { data } = await api.post(`/owner/contracts/${selectedContract.value.id}/documents/${doc.id}/analyze`)
    analysisResult.value = data.data?.analysis
    showAnalysis.value = true
    await loadDocuments(selectedContract.value.id)
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
</script>

<template>
  <div class="contracts-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('contract.title') }}</h1>
        <p class="page-sub">{{ $t('contract.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <font-awesome-icon icon="fa-solid fa-plus" />
        {{ $t('contract.newContract') }}
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ contractStore.totalContracts }}</div>
        <div class="stat-label">{{ $t('contract.totalContracts') }}</div>
      </div>
      <div class="stat-card active">
        <div class="stat-value">{{ contractStore.activeContracts.length }}</div>
        <div class="stat-label">{{ $t('contract.active') }}</div>
      </div>
      <div class="stat-card completed">
        <div class="stat-value">{{ contractStore.completedContracts.length }}</div>
        <div class="stat-label">{{ $t('contract.completed') }}</div>
      </div>
      <div class="stat-card purchase">
        <div class="stat-value">{{ contractStore.hirePurchaseContracts.length }}</div>
        <div class="stat-label">{{ $t('contract.hirePurchase') }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-bar">
        <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
        <input v-model="searchQuery" type="text" :placeholder="$t('contract.searchPlaceholder')" class="search-input" />
      </div>
      <div class="filter-group">
        <select v-model="filterType" class="filter-select">
          <option value="all">{{ $t('contract.allTypes') }}</option>
          <option value="hire_purchase">{{ $t('contract.hirePurchase') }}</option>
          <option value="rental">{{ $t('contract.rental') }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">{{ $t('contract.allStatus') }}</option>
          <option value="active">{{ $t('contract.active') }}</option>
          <option value="completed">{{ $t('contract.completed') }}</option>
          <option value="pending">{{ $t('contract.pending') }}</option>
        </select>
      </div>
    </div>

    <div v-if="contractStore.isLoading" class="loading-skeleton-group">
      <SkeletonLoader variant="stats" :rows="4" />
      <SkeletonLoader variant="table" :rows="8" :cols="7" />
    </div>
    <template v-else>
    <Transition name="fade-slide" mode="out-in">
      <div key="content">
        <div v-if="filteredContracts.length > 0" class="table-container">
          <table class="contracts-table">
            <thead>
              <tr>
                <th>{{ $t('contract.number') }}</th>
                <th>{{ $t('contract.driver') }}</th>
                <th>{{ $t('contract.vehicle') }}</th>
                <th>{{ $t('contract.type') }}</th>
                <th>{{ $t('contract.progress') }}</th>
                <th>{{ $t('contract.status') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contract in paginatedData" :key="contract.id">
                <td><strong>{{ contract.contract_number }}</strong></td>
                <td>{{ contract.driver_name }}</td>
                <td>
                  <font-awesome-icon :icon="getTypeIcon(contract.vehicle_type)" size="xs" />
                  {{ contract.vehicle_name }}
                </td>
                <td>
                  <span class="type-badge" :class="contract.contract_type">
                    {{ $t('status.' + contract.contract_type) }}
                  </span>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: contractStore.getProgress(contract) + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ contractStore.getProgress(contract) }}%</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :style="{ background: contractStore.getStatusColor(contract.status) }">
                    {{ $t('status.' + contract.status) }}
                  </span>
                </td>
                <td>
                  <button @click="viewContract(contract)" class="btn-icon" :title="$t('common.view')">
                    <font-awesome-icon icon="fa-regular fa-eye" />
                  </button>
                  <button @click="editContract(contract)" class="btn-icon" :title="$t('common.edit')">
                    <font-awesome-icon icon="fa-solid fa-pen" />
                  </button>
                  <button @click="openDocuments(contract)" class="btn-icon" :title="$t('documents.title')">
                    <font-awesome-icon icon="fa-solid fa-folder-open" />
                  </button>
                  <button @click="downloadPdf(contract)" class="btn-icon pdf" :title="$t('contract.downloadPdf')">
                    <font-awesome-icon icon="fa-solid fa-file-pdf" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <Pagination :current-page="page" :per-page="perPage" :total="filteredContracts.length" @page-change="page = $event" />
        </div>
        <div v-else class="empty-state">
          <font-awesome-icon icon="fa-solid fa-file-contract" size="3x" />
          <h3>{{ $t('common.noContracts') }}</h3>
          <p>{{ $t('contract.noContractsDesc') }}</p>
          <button class="btn-primary" @click="openCreateModal">
            <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('contract.createContract') }}
          </button>
        </div>
      </div>
    </Transition>
    </template>

    <!-- Create / Edit Modal -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-box large">
          <div class="modal-header">
            <h3>{{ isEditing ? $t('contract.editContract') : $t('contract.newContract') }}</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <form @submit.prevent="saveContract">
            <div class="form-grid">
              <div class="form-group">
                <label>{{ $t('contract.driver') }} <span class="required">*</span></label>
                <select v-model="form.employee_id" class="form-input" required>
                  <option value="">{{ $t('contract.selectDriver') }}</option>
                  <option v-for="driver in employeeStore.activeEmployees" :key="driver.id" :value="driver.id">
                    {{ driver.name }} - {{ driver.phone }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('contract.vehicle') }} <span class="required">*</span></label>
                <select v-model="form.vehicle_id" class="form-input" required>
                  <option value="">{{ $t('contract.selectVehicle') }}</option>
                  <option v-for="vehicle in vehicleStore.vehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ vehicle.name }} ({{ vehicle.registration_number || vehicle.plate_number || vehicle.type }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('contract.type') }} <span class="required">*</span></label>
                <select v-model="form.contract_type" class="form-input" required>
                  <option value="hire_purchase">{{ $t('contract.hirePurchaseOwnership') }}</option>
                  <option value="rental">{{ $t('contract.rental') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('contract.paymentFreq') }} <span class="required">*</span></label>
                <select v-model="form.payment_frequency" class="form-input" required>
                  <option value="weekly">{{ $t('contract.weekly') }}</option>
                  <option value="daily">{{ $t('contract.daily') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('contract.startDate') }} <span class="required">*</span></label>
                <input v-model="form.start_date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label>{{ $t('contract.endDate') }} <span class="required">*</span></label>
                <input v-model="form.end_date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label>{{ $t('contract.amount') }} <span class="required">*</span></label>
                <input v-model="form.amount" type="number" class="form-input" placeholder="TZS" required />
              </div>
              <div class="form-group">
                <label>{{ $t('contract.deposit') }}</label>
                <input v-model="form.deposit" type="number" class="form-input" placeholder="TZS" />
              </div>
              <div class="form-group full-width">
                <label>{{ $t('contract.notes') }}</label>
                <textarea v-model="form.notes" class="form-input" rows="2" :placeholder="$t('common.additionalNotes')"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="isSaving">
                <span v-if="isSaving"><span class="spinner-sm"></span> {{ isEditing ? $t('common.saving') : $t('contract.creating') }}</span>
                <span v-else>{{ isEditing ? $t('common.save') : $t('contract.createContract') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- View Modal -->
    <Transition name="modal">
      <div v-if="showViewModal && viewingContract" class="modal-overlay" @click.self="showViewModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('contract.contractDetails') }} — {{ viewingContract.contract_number }}</h3>
            <button class="modal-close" @click="showViewModal = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <div class="view-grid">
            <div class="view-field">
              <label>{{ $t('contract.driver') }}</label>
              <span>{{ viewingContract.driver_name }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.vehicle') }}</label>
              <span>{{ viewingContract.vehicle_name }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.type') }}</label>
              <span>{{ $t('status.' + viewingContract.contract_type) }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.paymentFreq') }}</label>
              <span>{{ $t('status.' + viewingContract.payment_frequency) }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.startDate') }}</label>
              <span>{{ viewingContract.start_date }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.endDate') }}</label>
              <span>{{ viewingContract.end_date }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.amount') }}</label>
              <span>{{ viewingContract.total_amount_formatted || viewingContract.total_amount }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.deposit') }}</label>
              <span>{{ viewingContract.deposit_formatted || viewingContract.deposit }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.paid') }}</label>
              <span class="text-success">{{ viewingContract.paid_amount_formatted || viewingContract.paid_amount }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.remaining') }}</label>
              <span class="text-warning">{{ viewingContract.remaining_amount_formatted || viewingContract.remaining_amount }}</span>
            </div>
            <div class="view-field">
              <label>{{ $t('common.status') }}</label>
              <span class="status-badge" :style="{ background: viewingContract.status_color || contractStore.getStatusColor(viewingContract.status) }">
                {{ $t('status.' + viewingContract.status) }}
              </span>
            </div>
            <div class="view-field">
              <label>{{ $t('contract.progress') }}</label>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: (viewingContract.progress || contractStore.getProgress(viewingContract)) + '%' }"></div>
                </div>
                <span class="progress-text">{{ viewingContract.progress || contractStore.getProgress(viewingContract) }}%</span>
              </div>
            </div>
            <div v-if="viewingContract.notes" class="view-field full-width">
              <label>{{ $t('contract.notes') }}</label>
              <span>{{ viewingContract.notes }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="downloadPdf(viewingContract)" class="btn-primary">
              <font-awesome-icon icon="fa-solid fa-file-pdf" /> {{ $t('contract.downloadPdf') }}
            </button>
            <button type="button" @click="showViewModal = false" class="btn-outline">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Documents Slide Panel -->
    <Transition name="slide-right">
      <div v-if="showDocPanel" class="slide-panel-overlay" @click.self="showDocPanel = false">
        <div class="doc-panel">
          <div class="panel-header">
            <h3>
              <font-awesome-icon icon="fa-solid fa-folder-open" />
              {{ $t('documents.title') }} — {{ selectedContract?.contract_number }}
            </h3>
            <button class="modal-close" @click="showDocPanel = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>

          <div class="panel-body">
            <div class="upload-zone" @dragover.prevent @drop.prevent="handleDrop">
              <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style="display:none" />
              <div class="upload-content" @click="$refs.fileInput?.click()">
                <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" size="2x" />
                <p v-if="!uploadForm.file">{{ $t('documents.dragOrClick') }}</p>
                <p v-else class="file-selected">{{ uploadForm.file.name }}</p>
              </div>
            </div>

            <div v-if="uploadForm.file" class="upload-form">
              <div class="form-group">
                <label>{{ $t('documents.type') }}</label>
                <select v-model="uploadForm.document_type" class="form-input">
                  <option value="signed_contract">{{ $t('documents.signedContract') }}</option>
                  <option value="id_copy">{{ $t('documents.idCopy') }}</option>
                  <option value="insurance">{{ $t('documents.insurance') }}</option>
                  <option value="other">{{ $t('documents.other') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('documents.titleLabel') }}</label>
                <input v-model="uploadForm.title" class="form-input" :placeholder="$t('documents.titlePlaceholder')" />
              </div>
              <div class="form-group">
                <label>{{ $t('documents.descriptionLabel') }}</label>
                <input v-model="uploadForm.description" class="form-input" :placeholder="$t('documents.descriptionPlaceholder')" />
              </div>
              <button class="btn-primary full" @click="uploadDocument" :disabled="uploading">
                <font-awesome-icon :icon="uploading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-cloud-arrow-up'" />
                {{ uploading ? $t('common.uploading') : $t('documents.upload') }}
              </button>
            </div>

            <div v-if="documentsLoading" class="loading-text">
              <font-awesome-icon icon="fa-solid fa-spinner fa-spin" /> {{ $t('common.loading') }}
            </div>

            <div v-else-if="documents.length === 0" class="empty-state small">
              <font-awesome-icon icon="fa-regular fa-file" size="2x" />
              <p>{{ $t('documents.noDocuments') }}</p>
            </div>

            <div v-else class="doc-list">
              <div v-for="doc in documents" :key="doc.id" class="doc-card">
                <div class="doc-info">
                  <font-awesome-icon :icon="getFileIcon(doc.mime_type)" class="doc-icon" />
                  <div>
                    <div class="doc-title">{{ doc.title }}</div>
                    <div class="doc-meta">
                      {{ $t('documents.' + doc.document_type) }} · {{ doc.human_readable_size || doc.file_size }}
                      <span v-if="doc.verified_at" class="verified-badge">
                        <font-awesome-icon icon="fa-solid fa-circle-check" /> {{ $t('documents.verified') }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="doc-actions">
                  <button v-if="!doc.verified_at" @click="toggleVerify(doc)" class="btn-icon" :title="$t('documents.verify')">
                    <font-awesome-icon icon="fa-solid fa-circle-check" />
                  </button>
                  <button v-if="authStore.aiEnabled" @click="analyzeDocument(doc)" class="btn-icon ai" :disabled="analyzingId === doc.id" :title="$t('documents.aiAnalyze')">
                    <font-awesome-icon :icon="analyzingId === doc.id ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'" />
                  </button>
                  <button @click="deleteDocument(doc)" class="btn-icon danger" :title="$t('common.delete')">
                    <font-awesome-icon icon="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Analysis Result Modal -->
    <Transition name="modal">
      <div v-if="showAnalysis && analysisResult" class="modal-overlay" @click.self="showAnalysis = false">
        <div class="modal-box large analysis-modal">
          <div class="modal-header">
            <h3>
              <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" class="ai-icon" />
              {{ $t('documents.analysisTitle') }}
            </h3>
            <button class="modal-close" @click="showAnalysis = false">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
          <div class="analysis-content">
            <div v-if="analysisResult.parties" class="analysis-section">
              <h4>{{ $t('documents.parties') }}</h4>
              <div class="analysis-grid">
                <div v-for="(value, key) in analysisResult.parties" :key="key" class="analysis-item">
                  <span class="analysis-key">{{ key }}</span>
                  <span class="analysis-value">{{ value }}</span>
                </div>
              </div>
            </div>
            <div v-if="analysisResult.vehicle" class="analysis-section">
              <h4>{{ $t('documents.vehicleInfo') }}</h4>
              <div class="analysis-grid">
                <div v-for="(value, key) in analysisResult.vehicle" :key="key" class="analysis-item">
                  <span class="analysis-key">{{ key }}</span>
                  <span class="analysis-value">{{ value }}</span>
                </div>
              </div>
            </div>
            <div v-if="analysisResult.terms" class="analysis-section">
              <h4>{{ $t('documents.terms') }}</h4>
              <div class="analysis-grid">
                <div v-for="(value, key) in analysisResult.terms" :key="key" class="analysis-item">
                  <span class="analysis-key">{{ key }}</span>
                  <span class="analysis-value">{{ value }}</span>
                </div>
              </div>
            </div>
            <div v-if="analysisResult.conditions" class="analysis-section">
              <h4>{{ $t('documents.conditions') }}</h4>
              <ul>
                <li v-for="(item, i) in (Array.isArray(analysisResult.conditions) ? analysisResult.conditions : [analysisResult.conditions])" :key="i">{{ item }}</li>
              </ul>
            </div>
            <div v-if="analysisResult.restrictions" class="analysis-section">
              <h4>{{ $t('documents.restrictions') }}</h4>
              <ul>
                <li v-for="(item, i) in (Array.isArray(analysisResult.restrictions) ? analysisResult.restrictions : [analysisResult.restrictions])" :key="i">{{ item }}</li>
              </ul>
            </div>
            <div v-if="analysisResult.insurance" class="analysis-section">
              <h4>{{ $t('documents.insurance') }}</h4>
              <div class="analysis-grid">
                <div v-for="(value, key) in analysisResult.insurance" :key="key" class="analysis-item">
                  <span class="analysis-key">{{ key }}</span>
                  <span class="analysis-value">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAnalysis = false" class="btn-outline">{{ $t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>


<style scoped>
.contracts-page { padding: 0; }
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
}
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.stat-card.active .stat-value { color: #00E5FF; }
.stat-card.completed .stat-value { color: #4ADE80; }
.stat-card.purchase .stat-value { color: #FFD93D; }

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
.contracts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}
.contracts-table th {
  text-align: left;
  padding: 14px 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.contracts-table td {
  padding: 14px 16px;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.contracts-table tr:hover td { background: rgba(255,255,255,0.02); }
.contracts-table tr:last-child td { border-bottom: none; }

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}
.type-badge.hire_purchase { background: rgba(0,196,212,0.15); color: #00C4D4; }
.type-badge.rental { background: rgba(37,99,196,0.15); color: #2563C4; }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #0a0818;
}
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.progress-text { font-size: 0.7rem; color: rgba(255,255,255,0.3); }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.btn-icon.pdf:hover { background: rgba(255,77,77,0.15); color: #ff4d4d; }

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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal-box { transform: scale(0.92) translateY(20px); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal-box { transform: scale(0.95); }

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
.modal-box.large { max-width: 720px; }
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); }
.required { color: #ff6b6b; }
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
.form-input::placeholder { color: rgba(255,255,255,0.25); }
select.form-input {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
textarea.form-input { resize: vertical; min-height: 60px; }

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.spinner-sm {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(10,8,24,0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .filters-bar { flex-direction: column; }
  .filter-group { flex-wrap: wrap; }
  .form-grid { grid-template-columns: 1fr; }
  .modal-box { padding: 24px; }
  .page-header { flex-direction: column; align-items: stretch; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .modal-box { padding: 20px; }
  .modal-actions { flex-direction: column; }
  .modal-actions .btn-primary,
  .modal-actions .btn-outline { width: 100%; justify-content: center; }
}

.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.view-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.view-field.full-width {
  grid-column: 1 / -1;
}
.view-field label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}
.view-field span {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.85);
}
.text-success { color: #4ADE80; }
.text-warning { color: #FFD93D; }

/* Document Panel */
.slide-panel-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
  display: flex; justify-content: flex-end; backdrop-filter: blur(4px);
}
.doc-panel {
  width: 480px; max-width: 95vw; height: 100vh;
  background: rgba(20,20,35,0.98); border-left: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column; overflow: hidden;
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.panel-header h3 { font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }
.panel-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.upload-zone {
  border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px;
  padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;
}
.upload-zone:hover { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.05); }
.upload-content { display: flex; flex-direction: column; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); }
.file-selected { color: #4ADE80; font-weight: 500; }
.upload-form { display: flex; flex-direction: column; gap: 12px; }
.upload-form .btn-primary.full { width: 100%; }
.loading-text { text-align: center; color: rgba(255,255,255,0.4); padding: 20px; }
.doc-list { display: flex; flex-direction: column; gap: 10px; }
.doc-card {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 14px 16px; transition: background 0.2s;
}
.doc-card:hover { background: rgba(255,255,255,0.06); }
.doc-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.doc-icon { font-size: 1.4rem; color: rgba(255,255,255,0.4); flex-shrink: 0; }
.doc-title { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.doc-meta { font-size: 0.75rem; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 6px; }
.verified-badge { color: #4ADE80; }
.doc-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: 10px; }
.btn-icon.ai { color: #A78BFA; }
.btn-icon.ai:hover { background: rgba(139,92,246,0.2); }
.empty-state.small { padding: 24px; text-align: center; color: rgba(255,255,255,0.3); }
.empty-state.small p { margin-top: 8px; }

/* Analysis Modal */
.analysis-modal { max-width: 680px; }
.ai-icon { color: #A78BFA; margin-right: 8px; }
.analysis-content { padding: 0; display: flex; flex-direction: column; gap: 20px; }
.analysis-section h4 {
  font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;
  color: rgba(255,255,255,0.4); margin-bottom: 8px; font-weight: 600;
}
.analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.analysis-item {
  background: rgba(255,255,255,0.03); border-radius: 8px; padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.05);
}
.analysis-key { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 2px; }
.analysis-value { font-size: 0.9rem; color: rgba(255,255,255,0.85); }
.analysis-section ul { list-style: none; padding: 0; }
.analysis-section li {
  background: rgba(255,255,255,0.03); border-radius: 6px; padding: 8px 12px;
  font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 4px;
  border-left: 3px solid rgba(139,92,246,0.4);
}
</style>