<template>
  <div class="vehicles-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('vehicle.title') }}</h1>
        <p class="page-sub">{{ $t('vehicle.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <font-awesome-icon icon="fa-solid fa-plus" />
        {{ $t('vehicle.addNew') }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-value">{{ store.totalVehicles }}</div><div class="stat-label">{{ $t('vehicle.total') }}</div></div>
      <div class="stat-card active"><div class="stat-value">{{ store.availableVehicles.length }}</div><div class="stat-label">{{ $t('vehicle.available') }}</div></div>
      <div class="stat-card contract"><div class="stat-value">{{ store.onContractVehicles.length }}</div><div class="stat-label">{{ $t('vehicle.onContract') }}</div></div>
      <div class="stat-card maintenance"><div class="stat-value">{{ store.maintenanceVehicles.length }}</div><div class="stat-label">{{ $t('vehicle.maintenance') }}</div></div>
    </div>

    <div class="search-bar">
      <font-awesome-icon icon="fa-solid fa-search" class="search-icon" />
      <input v-model="searchQuery" type="text" :placeholder="$t('vehicle.searchPlaceholder')" class="search-input" />
    </div>

    <div v-if="isLoading" class="loading-state"><div class="spinner"></div><p>{{ $t('vehicle.loading') }}</p></div>

    <Transition name="fade-slide">
      <div v-if="!isLoading && filtered.length > 0" key="table" class="table-container">
        <table class="vehicles-table">
          <thead>
            <tr>
              <th>{{ $t('vehicle.name') }}</th>
              <th>{{ $t('common.type') }}</th>
              <th>{{ $t('vehicle.registration') }}</th>
              <th>{{ $t('vehicle.year') }}</th>
              <th>{{ $t('vehicle.price') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in paginatedData" :key="v.id" class="table-row-fade">
              <td><strong>{{ v.name }}</strong></td>
              <td><font-awesome-icon :icon="store.getTypeIcon(v.type)" size="xs" /> {{ v.type }}</td>
              <td>{{ v.registration }}</td>
              <td>{{ v.year }}</td>
              <td>{{ Number(v.price).toLocaleString() }} TZS</td>
              <td>
                <span class="status-badge" :style="{ background: store.getStatusColor(v.status) }">
                  {{ $t('status.' + v.status) }}
                </span>
              </td>
              <td>
                <button @click="openEditModal(v)" class="btn-icon" :title="$t('common.edit')"><font-awesome-icon icon="fa-solid fa-pen" /></button>
                <button @click="handleDelete(v.id)" class="btn-icon danger" :title="$t('common.delete')"><font-awesome-icon icon="fa-solid fa-trash" /></button>
              </td>
            </tr>
          </tbody>
        </table>
        <Pagination :current-page="page" :per-page="perPage" :total="filtered.length" @page-change="page = $event" />
      </div>
      <div v-else-if="!isLoading" key="empty" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-car" size="3x" />
        <h3>{{ $t('common.noVehicles') }}</h3>
        <p>{{ $t('vehicle.noVehiclesDesc') }}</p>
        <button class="btn-primary" @click="openCreateModal"><font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('vehicle.addNew') }}</button>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ isEditing ? $t('vehicle.editVehicle') : $t('vehicle.addNew') }}</h3>
            <button class="modal-close" @click="showModal = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
          </div>
          <form @submit.prevent="handleSave">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>{{ $t('vehicle.vehicleName') }} <span class="required">*</span></label>
                <input v-model="form.name" class="form-input" :placeholder="$t('vehicle.vehicleName') + '...'" required />
              </div>
              <div class="form-group">
                <label>{{ $t('common.type') }} <span class="required">*</span></label>
                <select v-model="form.type" class="form-input" required>
                  <option value="">{{ $t('vehicle.selectType') }}</option>
                  <option value="Car">{{ $t('status.car') }}</option>
                  <option value="Motorcycle">{{ $t('status.motorcycle') }}</option>
                  <option value="Bajaji">{{ $t('status.bajaji') }}</option>
                  <option value="SUV">{{ $t('status.suv') }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ $t('vehicle.registration') }} <span class="required">*</span></label>
                <input v-model="form.registration" class="form-input" :placeholder="$t('vehicle.registration') + '...'" required />
              </div>
              <div class="form-group">
                <label>{{ $t('vehicle.year') }}</label>
                <input v-model="form.year" type="number" class="form-input" :placeholder="$t('vehicle.year') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('vehicle.priceDay') }}</label>
                <input v-model="form.price" type="number" class="form-input" :placeholder="$t('vehicle.priceDay') + '...'" />
              </div>
              <div class="form-group">
                <label>{{ $t('common.status') }}</label>
                <select v-model="form.status" class="form-input">
                  <option value="available">{{ $t('status.available') }}</option>
                  <option value="on_contract">{{ $t('status.on_contract') }}</option>
                  <option value="maintenance">{{ $t('status.maintenance') }}</option>
                  <option value="rented">{{ $t('status.rented') }}</option>
                  <option value="assigned">{{ $t('status.assigned') }}</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label>{{ $t('vehicle.description') }}</label>
                <textarea v-model="form.description" class="form-input" rows="2" :placeholder="$t('common.vehicleDescription')"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" @click="showModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                <span v-if="saving"><span class="spinner-sm"></span> {{ $t('vehicle.saving') }}</span>
                <span v-else>{{ isEditing ? $t('vehicle.update') : $t('vehicle.create') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehicleStore } from '@/stores/vehicles'
import Pagination from '@/components/common/Pagination.vue'

const { t } = useI18n()
const store = useVehicleStore()
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)
const isLoading = ref(true)
const page = ref(1)
const perPage = 15

const form = ref({ name: '', type: '', registration: '', year: '', price: '', status: 'available', description: '' })

const filtered = computed(() => {
  if (!searchQuery.value) return store.vehicles
  const q = searchQuery.value.toLowerCase()
  return store.vehicles.filter(v =>
    v.name?.toLowerCase().includes(q) ||
    v.registration?.toLowerCase().includes(q) ||
    v.type?.toLowerCase().includes(q)
  )
})

const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  form.value = { name: '', type: '', registration: '', year: '', price: '', status: 'available', description: '' }
  showModal.value = true
}

function openEditModal(v) {
  isEditing.value = true
  editingId.value = v.id
  form.value = { name: v.name, type: v.type, registration: v.registration, year: v.year, price: v.price, status: v.status, description: v.description || '' }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value) await store.updateVehicle(editingId.value, form.value)
    else await store.createVehicle(form.value)
    showModal.value = false
  } catch (_) {} finally { saving.value = false }
}

watch(searchQuery, () => { page.value = 1 })

async function handleDelete(id) {
  if (confirm(t('vehicle.deleteConfirm'))) await store.deleteVehicle(id)
}

onMounted(async () => {
  await store.fetchVehicles()
  isLoading.value = false
})
</script>

<style scoped>
.vehicles-page { }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 20px; text-align: center; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #fff; }
.stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.stat-card.active .stat-value { color: #00E5FF; }
.stat-card.contract .stat-value { color: #FFD93D; }
.stat-card.maintenance .stat-value { color: #ff6b6b; }

.search-bar { position: relative; margin-bottom: 24px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.25); }
.search-input { width: 100%; padding: 10px 16px 10px 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s; font-family: 'Space Grotesk', sans-serif; }
.search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }

.table-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow-x: auto; }
.vehicles-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.vehicles-table th { text-align: left; padding: 14px 16px; color: rgba(255,255,255,0.4); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.vehicles-table td { padding: 14px 16px; color: rgba(255,255,255,0.7); font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); animation: fadeIn 0.3s ease both; }
.vehicles-table tr:hover td { background: rgba(255,255,255,0.02); }
.vehicles-table tr:last-child td { border-bottom: none; }

.status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; color: #0a0818; }
.btn-icon { padding: 4px 8px; border: none; background: rgba(255,255,255,0.05); border-radius: 4px; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.2s; }
.btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-icon.danger:hover { background: rgba(255,107,107,0.15); color: #ff6b6b; }

.loading-state { display: flex; flex-direction: column; align-items: center; min-height: 200px; gap: 16px; color: rgba(255,255,255,0.3); padding-top: 60px; }
.spinner { width: 44px; height: 44px; border: 3px solid rgba(0,196,212,0.1); border-top-color: #00C4D4; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

/* Modal + Transitions */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-box { background: #13102a; border: 1px solid rgba(0,229,255,0.15); border-radius: 16px; padding: 30px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.2rem; }
.modal-close { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.6); cursor: pointer; padding: 6px 10px; transition: all 0.2s; }
.modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.65); }
.required { color: #ff6b6b; }
.form-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'Space Grotesk', sans-serif; }
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
.form-input::placeholder { color: rgba(255,255,255,0.25); }
select.form-input { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
textarea.form-input { resize: vertical; min-height: 60px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
.spinner-sm { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(10,8,24,0.2); border-top-color: #0a0818; border-radius: 50%; animation: spin 0.7s linear infinite; }

.fade-slide-enter-active { transition: all 0.25s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(12px); }

.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal-box { transform: scale(0.92) translateY(20px); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal-box { transform: scale(0.95); }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .form-grid { grid-template-columns: 1fr; }
  .modal-box { padding: 24px; }
  .page-header { flex-direction: column; align-items: stretch; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
