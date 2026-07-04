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

    <div v-if="employeeStore.isLoading" class="loading-state"><div class="spinner"></div><p>{{ $t('employee.loading') }}</p></div>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="!employeeStore.isLoading && filteredEmployees.length > 0" key="table" class="table-container">
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
            <tr v-for="employee in paginatedData" :key="employee.id" class="table-row-fade">
              <td><strong>{{ employee.name }}</strong></td>
              <td>{{ employee.phone }}</td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.license_number }}</td>
              <td>{{ employee.vehicle_name || '—' }}</td>
              <td>
                <span class="status-badge" :class="employee.status">{{ $t('status.' + employee.status) }}</span>
              </td>
              <td>
                <button @click="openEditModal(employee)" class="btn-icon" :title="$t('common.edit')"><font-awesome-icon icon="fa-solid fa-pen" /></button>
                <button @click="deleteEmployee(employee.id)" class="btn-icon danger" :title="$t('common.delete')"><font-awesome-icon icon="fa-solid fa-trash" /></button>
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
              <div class="form-group">
                <label>{{ $t('employee.address') }}</label>
                <input v-model="form.address" class="form-input" :placeholder="$t('employee.address') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.nidaNumber') }} <span class="required">*</span></label>
                <input v-model="form.nida_number" class="form-input" required :placeholder="$t('employee.nidaNumber') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('employee.licenseNumber') }} <span class="required">*</span></label>
                <input v-model="form.license_number" class="form-input" required :placeholder="$t('employee.licenseNumber') + '...'" />
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
              <button type="submit" class="btn-primary" :disabled="saving">
                <span v-if="saving"><span class="spinner-sm"></span> {{ $t('employee.saving') }}</span>
                <span v-else>{{ isEditing ? $t('employee.edit') : $t('employee.create') }}</span>
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
import { useEmployeeStore } from '@/stores/employees'
import { useVehicleStore } from '@/stores/vehicles'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()
const employeeStore = useEmployeeStore()
const vehicleStore = useVehicleStore()
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const errorMsg = ref('')
const page = ref(1)
const perPage = 15

const defaultForm = () => ({
  name: '', phone: '', email: '', address: '', nida_number: '',
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
  form.value = defaultForm(); errorMsg.value = ''; showModal.value = true
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
        await employeeStore.assignVehicle(editingId.value, form.value.vehicle_id)
      }
    } else {
      const res = await employeeStore.createEmployee(form.value)
      if (!res.success) { errorMsg.value = res.message || t('common.error'); return }
      if (form.value.vehicle_id) {
        await employeeStore.assignVehicle(res.data.id, form.value.vehicle_id)
      }
    }
    showModal.value = false
    employeeStore.fetchEmployees()
  } catch (_) { errorMsg.value = t('common.unexpectedError') } finally { saving.value = false }
}

async function deleteEmployee(id) {
  if (confirm(t('employee.deleteConfirm'))) await employeeStore.deleteEmployee(id)
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
.employees-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.employees-table th { text-align: left; padding: 14px 16px; color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.employees-table td { padding: 14px 16px; color: rgba(255,255,255,0.7); font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); animation: fadeIn 0.3s ease both; }
.employees-table tr:hover td { background: rgba(255,255,255,0.02); }
.employees-table tr:last-child td { border-bottom: none; }
.status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; }
.status-badge.active { background: rgba(0,229,255,0.15); color: #00E5FF; }
.status-badge.inactive { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.btn-icon { padding: 4px 8px; border: none; background: rgba(255,255,255,0.05); border-radius: 4px; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-icon.danger:hover { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.loading-state { display: flex; flex-direction: column; align-items: center; min-height: 200px; gap: 16px; color: rgba(255,255,255,0.3); padding-top: 60px; }
.spinner { width: 44px; height: 44px; border: 3px solid rgba(0,196,212,0.1); border-top-color: #00C4D4; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.25s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(12px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

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
.form-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); }
.required { color: #ff6b6b; }
.form-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,0,0,0.08); border: 1px solid rgba(255,0,0,0.2); border-radius: 10px; font-size: 0.85rem; color: #ff6b6b; grid-column: 1 / -1; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; font-family: 'Space Grotesk', sans-serif; }
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); transform: translateY(-1px); }
.form-input::placeholder { color: rgba(255,255,255,0.25); }
select.form-input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.spinner-sm { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(10,8,24,0.2); border-top-color: #0a0818; border-radius: 50%; animation: spin 0.7s linear infinite; }

.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal-box { transform: scale(0.92) translateY(20px); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal-box { transform: scale(0.95); }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .emp-grid { grid-template-columns: 1fr; }
  .modal-box { padding: 24px; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
