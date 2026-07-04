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

    <Transition name="fade-slide" mode="out-in">
      <div v-if="contractStore.isLoading" key="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('contract.loading') }}</p>
      </div>
      <div v-else key="content">
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

    <!-- Create Modal -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-box large">
          <div class="modal-header">
            <h3>{{ $t('contract.newContract') }}</h3>
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
                  <option v-for="vehicle in vehicleStore.availableVehicles" :key="vehicle.id" :value="vehicle.id">
                    {{ vehicle.name }} ({{ vehicle.type }})
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
                <span v-if="isSaving"><span class="spinner-sm"></span> {{ $t('contract.creating') }}</span>
                <span v-else>{{ $t('contract.createContract') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useContractStore } from '@/stores/contracts'
import Pagination from '@/components/common/Pagination.vue'
import { useVehicleStore } from '@/stores/vehicles'
import { useEmployeeStore } from '@/stores/employees'
import { useAuthStore } from '@/stores/auth'
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
const isSaving = ref(false)
const page = ref(1)
const perPage = 15

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

function openCreateModal() { showCreateModal.value = true }
function viewContract(contract) { /* view logic */ }
function editContract(contract) { /* edit logic */ }

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
    await contractStore.createContract(payload)
    showCreateModal.value = false
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to create contract')
  } finally { isSaving.value = false }
}

onMounted(async () => {
  await Promise.all([
    contractStore.fetchContracts(),
    vehicleStore.fetchVehicles(),
    employeeStore.fetchEmployees()
  ])
})
</script>

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
</style>