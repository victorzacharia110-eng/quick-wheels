<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const router = useRouter()
const { t } = useI18n()
const maintenanceStore = useMaintenanceStore()
const authStore = useAuthStore()

const vehicles = ref([])
const contracts = ref([])
const isSubmitting = ref(false)
const errorMsg = ref('')

const form = ref({
  vehicle_id: '',
  contract_id: '',
  title: '',
  description: '',
  diagnosed_issues: '',
  priority: 'medium',
  vehicle_mileage: '',
  estimated_cost: '',
  next_service_date: '',
  next_service_mileage: '',
  notes: '',
  items: [],
})

const newItem = ref({
  type: 'part',
  name: '',
  description: '',
  category: 'other',
  cost: '',
  quantity: 1,
  is_required: false,
})

const categories = [
  'engine', 'brake', 'tire', 'electrical', 'body', 'fluid', 'transmission', 'suspension', 'exhaust', 'other'
]

const estimatedTotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (Number(item.cost) * Number(item.quantity)), 0)
})

function addItem() {
  if (!newItem.value.name || !newItem.value.cost) return
  form.value.items.push({ ...newItem.value })
  newItem.value = { type: 'part', name: '', description: '', category: 'other', cost: '', quantity: 1, is_required: false }
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

async function submitReport() {
  if (!form.value.vehicle_id || !form.value.title || !form.value.priority) {
    errorMsg.value = 'Please fill in all required fields'
    return
  }

  isSubmitting.value = true
  errorMsg.value = ''

  try {
    const payload = { ...form.value }
    if (!payload.contract_id) delete payload.contract_id
    if (!payload.vehicle_mileage) delete payload.vehicle_mileage
    if (!payload.estimated_cost) delete payload.estimated_cost
    if (!payload.next_service_date) delete payload.next_service_date
    if (!payload.next_service_mileage) delete payload.next_service_mileage

    const result = await maintenanceStore.createReport(payload)
    if (result.success) {
      router.push(`/technician/reports/${result.data.id}`)
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || err.message || 'Failed to create report'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/employee/vehicles')
    vehicles.value = data.data?.data || data.data || []
  } catch {
    vehicles.value = []
  }
  try {
    const { data } = await api.get('/contracts/')
    contracts.value = (data.data?.data || data.data || []).filter(c => c.status === 'active')
  } catch {
    contracts.value = []
  }
})
</script>

<template>
  <div class="create-report">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('maintenance.createReport') }}</h1>
        <p class="page-sub">{{ $t('maintenance.createReportDesc') }}</p>
      </div>
      <button @click="$router.back()" class="btn-outline">
        <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.close') }}
      </button>
    </div>

    <div v-if="errorMsg" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-exclamation-circle" />
      {{ errorMsg }}
    </div>

    <form @submit.prevent="submitReport" class="report-form">
      <!-- Vehicle & Contract -->
      <div class="form-section">
        <h3 class="section-label">{{ $t('maintenance.vehicleInfo') }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('contract.vehicle') }} *</label>
            <select v-model="form.vehicle_id" required>
              <option value="">{{ $t('common.selectVehicle') }}</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.name }} ({{ v.type }}) - {{ v.registration_number || 'N/A' }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ $t('contract.title') }} ({{ $t('common.optional') }})</label>
            <select v-model="form.contract_id">
              <option value="">{{ $t('common.none') }}</option>
              <option v-for="c in contracts" :key="c.id" :value="c.id">{{ c.contract_number }} - {{ c.driver_name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ $t('maintenance.mileage') }}</label>
            <input type="number" v-model="form.vehicle_mileage" :placeholder="$t('maintenance.mileagePlaceholder')" min="0" step="0.1" />
          </div>
        </div>
      </div>

      <!-- Report Details -->
      <div class="form-section">
        <h3 class="section-label">{{ $t('maintenance.reportDetails') }}</h3>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>{{ $t('maintenance.reportTitle') }} *</label>
            <input type="text" v-model="form.title" :placeholder="$t('maintenance.titlePlaceholder')" required />
          </div>
          <div class="form-group">
            <label>{{ $t('maintenance.priority') }} *</label>
            <select v-model="form.priority" required>
              <option value="low">{{ $t('maintenance.low') }}</option>
              <option value="medium">{{ $t('maintenance.medium') }}</option>
              <option value="high">{{ $t('maintenance.high') }}</option>
              <option value="critical">{{ $t('maintenance.critical') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ $t('maintenance.estimatedCost') }} (TZS)</label>
            <input type="number" v-model="form.estimated_cost" placeholder="0" min="0" />
          </div>
          <div class="form-group full-width">
            <label>{{ $t('maintenance.description') }}</label>
            <textarea v-model="form.description" :placeholder="$t('maintenance.descriptionPlaceholder')" rows="3"></textarea>
          </div>
          <div class="form-group full-width">
            <label>{{ $t('maintenance.diagnosedIssues') }}</label>
            <textarea v-model="form.diagnosed_issues" :placeholder="$t('maintenance.diagnosedIssuesPlaceholder')" rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Items (Parts & Services) -->
      <div class="form-section">
        <h3 class="section-label">{{ $t('maintenance.partsAndServices') }}</h3>

        <!-- Existing Items -->
        <div v-if="form.items.length" class="items-list">
          <div v-for="(item, index) in form.items" :key="index" class="item-row">
            <div class="item-type-badge" :class="item.type">
              <font-awesome-icon :icon="item.type === 'part' ? 'fa-solid fa-cog' : 'fa-solid fa-wrench'" />
              {{ item.type === 'part' ? $t('maintenance.part') : $t('maintenance.service') }}
            </div>
            <div class="item-details">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-category">{{ item.category }}</span>
              <span v-if="item.is_required" class="required-tag">{{ $t('maintenance.required') }}</span>
            </div>
            <div class="item-cost">TZS {{ Number(item.cost).toLocaleString() }} x {{ item.quantity }}</div>
            <button type="button" @click="removeItem(index)" class="remove-btn">
              <font-awesome-icon icon="fa-solid fa-times" />
            </button>
          </div>
        </div>

        <!-- Add New Item -->
        <div class="add-item-form">
          <div class="item-form-row">
            <select v-model="newItem.type" class="item-input small">
              <option value="part">{{ $t('maintenance.part') }}</option>
              <option value="service">{{ $t('maintenance.service') }}</option>
            </select>
            <input v-model="newItem.name" :placeholder="$t('maintenance.itemName')" class="item-input" />
            <select v-model="newItem.category" class="item-input medium">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input v-model="newItem.cost" type="number" :placeholder="$t('maintenance.cost')" class="item-input small" min="0" />
            <input v-model="newItem.quantity" type="number" :placeholder="$t('maintenance.qty')" class="item-input tiny" min="1" />
            <label class="checkbox-label">
              <input type="checkbox" v-model="newItem.is_required" />
              {{ $t('maintenance.required') }}
            </label>
            <button type="button" @click="addItem" class="add-item-btn">
              <font-awesome-icon icon="fa-solid fa-plus" />
            </button>
          </div>
        </div>

        <div v-if="form.items.length" class="estimated-total">
          {{ $t('maintenance.estimatedTotal') }}: TZS {{ estimatedTotal.toLocaleString() }}
        </div>
      </div>

      <!-- Next Service -->
      <div class="form-section">
        <h3 class="section-label">{{ $t('maintenance.nextService') }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('maintenance.nextServiceDate') }}</label>
            <input type="date" v-model="form.next_service_date" />
          </div>
          <div class="form-group">
            <label>{{ $t('maintenance.nextServiceMileage') }}</label>
            <input type="number" v-model="form.next_service_mileage" placeholder="0" min="0" />
          </div>
          <div class="form-group full-width">
            <label>{{ $t('common.notes') }}</label>
            <textarea v-model="form.notes" :placeholder="$t('common.optionalNotes')" rows="2"></textarea>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="form-actions">
        <button type="button" @click="$router.back()" class="btn-outline">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" spin />
          <font-awesome-icon v-else icon="fa-solid fa-save" />
          {{ isSubmitting ? $t('common.creating') : $t('maintenance.submitReport') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-report { padding: 0; }

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
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0, 229, 255, 0.3); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.2); color: #fff; }

.error-banner {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px 24px;
}
.section-label {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group.full-width { grid-column: 1 / -1; }
.form-group label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.form-group input, .form-group select, .form-group textarea {
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: rgba(0, 229, 255, 0.3);
}
.form-group input::placeholder, .form-group textarea::placeholder {
  color: rgba(255,255,255,0.2);
}
.form-group select option { background: #0a0818; color: #fff; }

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 8px;
}
.item-type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.item-type-badge.part { background: rgba(108, 99, 255, 0.15); color: #6C63FF; }
.item-type-badge.service { background: rgba(0, 229, 255, 0.15); color: #00E5FF; }
.item-details { flex: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.item-name { font-weight: 600; font-size: 0.85rem; color: #fff; }
.item-category { font-size: 0.72rem; color: rgba(255,255,255,0.3); text-transform: capitalize; }
.required-tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  font-size: 0.65rem;
  font-weight: 600;
}
.item-cost { font-size: 0.82rem; color: #00C4D4; font-weight: 600; white-space: nowrap; }
.remove-btn {
  background: none;
  border: none;
  color: rgba(255, 107, 107, 0.5);
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}
.remove-btn:hover { color: #ff6b6b; }

.add-item-form {
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 12px;
}
.item-form-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.item-input {
  padding: 8px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  color: #fff;
  font-size: 0.82rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.item-input:focus { border-color: rgba(0, 229, 255, 0.3); }
.item-input::placeholder { color: rgba(255,255,255,0.2); }
.item-input.small { width: 100px; }
.item-input.medium { width: 120px; }
.item-input.tiny { width: 60px; }
.item-input option { background: #0a0818; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  white-space: nowrap;
}
.checkbox-label input[type="checkbox"] {
  accent-color: #00C4D4;
}

.add-item-btn {
  padding: 8px 14px;
  border-radius: 6px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: #00E5FF;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.add-item-btn:hover { background: rgba(0, 229, 255, 0.2); }

.estimated-total {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(0, 196, 212, 0.06);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #00C4D4;
  text-align: right;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .form-grid { grid-template-columns: 1fr; }
  .item-form-row { flex-direction: column; }
  .item-input, .item-input.small, .item-input.medium, .item-input.tiny { width: 100%; }
}
</style>
