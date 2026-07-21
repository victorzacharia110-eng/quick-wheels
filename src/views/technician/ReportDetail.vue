<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMaintenanceStore } from '@/stores/maintenance'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const maintenanceStore = useMaintenanceStore()

const report = computed(() => maintenanceStore.currentReport)
const showCompleteModal = ref(false)
const completeForm = ref({ actual_cost: '', notes: '' })
const isCompleting = ref(false)
const showAddItem = ref(false)
const newItem = ref({ type: 'part', name: '', description: '', category: 'other', cost: '', quantity: 1, is_required: false })
const categories = ['engine', 'brake', 'tire', 'electrical', 'body', 'fluid', 'transmission', 'suspension', 'exhaust', 'other']

const parts = computed(() => report.value?.items?.filter(i => i.type === 'part') || [])
const services = computed(() => report.value?.items?.filter(i => i.type === 'service') || [])
const requiredParts = computed(() => parts.value.filter(p => p.is_required))

function getPriorityIcon(priority) {
  const icons = { low: 'fa-solid fa-arrow-down', medium: 'fa-solid fa-minus', high: 'fa-solid fa-arrow-up', critical: 'fa-solid fa-exclamation-triangle' }
  return icons[priority] || 'fa-solid fa-circle'
}

function getVehicleIcon(type) {
  const icons = { 'Motorcycle': 'fa-solid fa-motorcycle', 'Bajaji': 'fa-solid fa-truck-front', 'Car': 'fa-solid fa-car', 'SUV': 'fa-solid fa-truck' }
  return icons[type] || 'fa-solid fa-car'
}

async function updateItemStatus(itemId, status) {
  await maintenanceStore.updateItem(report.value.id, itemId, { status })
}

async function addNewItem() {
  if (!newItem.value.name || !newItem.value.cost) return
  await maintenanceStore.addItem(report.value.id, { ...newItem.value })
  newItem.value = { type: 'part', name: '', description: '', category: 'other', cost: '', quantity: 1, is_required: false }
  showAddItem.value = false
}

async function completeReport() {
  isCompleting.value = true
  try {
    const payload = {}
    if (completeForm.value.actual_cost) payload.actual_cost = completeForm.value.actual_cost
    if (completeForm.value.notes) payload.notes = completeForm.value.notes
    await maintenanceStore.completeReport(report.value.id, payload)
    showCompleteModal.value = false
  } catch (err) {
    // error handled by store
  } finally {
    isCompleting.value = false
  }
}

onMounted(() => {
  maintenanceStore.fetchReport(route.params.id)
})
</script>

<template>
  <div class="report-detail" v-if="report">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="back-btn">
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.close') }}
        </button>
        <h1 class="page-title">{{ report.report_number }}</h1>
        <p class="page-sub">{{ report.title }}</p>
      </div>
      <div class="header-actions">
        <span class="priority-badge" :style="{ background: maintenanceStore.getPriorityColor(report.priority) + '22', color: maintenanceStore.getPriorityColor(report.priority) }">
          <font-awesome-icon :icon="getPriorityIcon(report.priority)" />
          {{ report.priority_label }}
        </span>
        <span class="status-badge" :style="{ background: maintenanceStore.getStatusColor(report.status) + '22', color: maintenanceStore.getStatusColor(report.status) }">
          {{ report.status_label }}
        </span>
        <button v-if="report.status !== 'completed' && report.status !== 'cancelled'" @click="showCompleteModal = true" class="btn-primary">
          <font-awesome-icon icon="fa-solid fa-check-circle" /> {{ $t('maintenance.markComplete') }}
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section" v-if="report.items?.length">
      <div class="progress-header">
        <span>{{ $t('maintenance.progress') }}</span>
        <span class="progress-pct">{{ report.progress }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: report.progress + '%' }"></div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-icon" style="background: rgba(0, 229, 255, 0.12); color: #00e5ff;">
          <font-awesome-icon :icon="getVehicleIcon(report.vehicle_type)" />
        </div>
        <div>
          <div class="info-label">{{ $t('contract.vehicle') }}</div>
          <div class="info-value">{{ report.vehicle_name }}</div>
          <div class="info-sub">{{ report.vehicle_type }} · {{ report.vehicle_registration || 'N/A' }}</div>
        </div>
      </div>
      <div class="info-card" v-if="report.contract_number">
        <div class="info-icon" style="background: rgba(108, 99, 255, 0.12); color: #6C63FF;">
          <font-awesome-icon icon="fa-solid fa-file-contract" />
        </div>
        <div>
          <div class="info-label">{{ $t('contract.title') }}</div>
          <div class="info-value">{{ report.contract_number }}</div>
        </div>
      </div>
      <div class="info-card" v-if="report.vehicle_mileage">
        <div class="info-icon" style="background: rgba(255, 217, 61, 0.12); color: #FFD93D;">
          <font-awesome-icon icon="fa-solid fa-road" />
        </div>
        <div>
          <div class="info-label">{{ $t('maintenance.mileage') }}</div>
          <div class="info-value">{{ Number(report.vehicle_mileage).toLocaleString() }} km</div>
        </div>
      </div>
      <div class="info-card">
        <div class="info-icon" style="background: rgba(74, 222, 128, 0.12); color: #4ADE80;">
          <font-awesome-icon icon="fa-solid fa-calendar" />
        </div>
        <div>
          <div class="info-label">{{ $t('common.date') }}</div>
          <div class="info-value">{{ maintenanceStore.formatDate(report.created_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Description & Issues -->
    <div class="detail-sections">
      <div class="detail-card" v-if="report.description">
        <h3 class="detail-title">{{ $t('maintenance.description') }}</h3>
        <p class="detail-text">{{ report.description }}</p>
      </div>
      <div class="detail-card" v-if="report.diagnosed_issues">
        <h3 class="detail-title">{{ $t('maintenance.diagnosedIssues') }}</h3>
        <p class="detail-text">{{ report.diagnosed_issues }}</p>
      </div>
    </div>

    <!-- Parts -->
    <div class="items-section">
      <div class="section-header">
        <h3 class="section-title">
          <font-awesome-icon icon="fa-solid fa-cog" />
          {{ $t('maintenance.parts') }} ({{ parts.length }})
        </h3>
        <button v-if="report.status !== 'completed'" @click="showAddItem = true; newItem.type = 'part'" class="add-btn">
          <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('maintenance.addPart') }}
        </button>
      </div>
      <div v-if="parts.length === 0" class="empty-items">{{ $t('maintenance.noParts') }}</div>
      <div v-else class="items-grid">
        <div v-for="item in parts" :key="item.id" class="item-card">
          <div class="item-header">
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.is_required" class="required-tag">{{ $t('maintenance.required') }}</span>
          </div>
          <div class="item-meta">
            <span class="item-category">{{ item.category }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
            <span class="item-cost">TZS {{ Number(item.cost * item.quantity).toLocaleString() }}</span>
          </div>
          <div class="item-actions" v-if="report.status !== 'completed'">
            <button v-for="status in ['pending', 'in_progress', 'completed', 'replaced']" :key="status"
              :class="['status-btn', status, { active: item.status === status }]"
              @click="updateItemStatus(item.id, status)">
              {{ $t('maintenance.' + status) }}
            </button>
          </div>
          <div v-else class="item-final-status">
            <span class="status-badge" :style="{ background: maintenanceStore.getStatusColor(item.status === 'replaced' ? 'in_progress' : item.status) + '22', color: maintenanceStore.getStatusColor(item.status === 'replaced' ? 'in_progress' : item.status) }">
              {{ item.status_label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Services -->
    <div class="items-section">
      <div class="section-header">
        <h3 class="section-title">
          <font-awesome-icon icon="fa-solid fa-wrench" />
          {{ $t('maintenance.services') }} ({{ services.length }})
        </h3>
        <button v-if="report.status !== 'completed'" @click="showAddItem = true; newItem.type = 'service'" class="add-btn">
          <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('maintenance.addService') }}
        </button>
      </div>
      <div v-if="services.length === 0" class="empty-items">{{ $t('maintenance.noServices') }}</div>
      <div v-else class="items-grid">
        <div v-for="item in services" :key="item.id" class="item-card">
          <div class="item-header">
            <span class="item-name">{{ item.name }}</span>
          </div>
          <div class="item-meta">
            <span class="item-category">{{ item.category }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
            <span class="item-cost">TZS {{ Number(item.cost * item.quantity).toLocaleString() }}</span>
          </div>
          <div class="item-actions" v-if="report.status !== 'completed'">
            <button v-for="status in ['pending', 'in_progress', 'completed']" :key="status"
              :class="['status-btn', status, { active: item.status === status }]"
              @click="updateItemStatus(item.id, status)">
              {{ $t('maintenance.' + status) }}
            </button>
          </div>
          <div v-else class="item-final-status">
            <span class="status-badge" :style="{ background: maintenanceStore.getStatusColor(item.status) + '22', color: maintenanceStore.getStatusColor(item.status) }">
              {{ item.status_label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Required Parts Summary -->
    <div class="required-summary" v-if="requiredParts.length">
      <h3 class="section-title">
        <font-awesome-icon icon="fa-solid fa-exclamation-circle" />
        {{ $t('maintenance.requiredForContract') }}
      </h3>
      <p class="required-desc">{{ $t('maintenance.requiredPartsDesc') }}</p>
      <div class="required-list">
        <div v-for="part in requiredParts" :key="part.id" class="required-item">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" />
          <span>{{ part.name }} ({{ part.category }})</span>
          <span class="required-cost">TZS {{ Number(part.cost * part.quantity).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Cost Summary -->
    <div class="cost-summary">
      <div class="cost-row">
        <span>{{ $t('maintenance.estimatedCost') }}</span>
        <span>TZS {{ Number(report.estimated_cost || 0).toLocaleString() }}</span>
      </div>
      <div class="cost-row" v-if="report.actual_cost">
        <span>{{ $t('maintenance.actualCost') }}</span>
        <span class="actual-cost">TZS {{ Number(report.actual_cost).toLocaleString() }}</span>
      </div>
      <div class="cost-row" v-if="report.next_service_date">
        <span>{{ $t('maintenance.nextServiceDate') }}</span>
        <span>{{ maintenanceStore.formatDate(report.next_service_date) }}</span>
      </div>
    </div>

    <!-- Notes -->
    <div class="notes-section" v-if="report.notes">
      <h3 class="detail-title">{{ $t('common.notes') }}</h3>
      <p class="detail-text">{{ report.notes }}</p>
    </div>

    <!-- Add Item Modal -->
    <Teleport to="body">
      <div v-if="showAddItem" class="modal-overlay" @click.self="showAddItem = false">
        <div class="modal">
          <h3>{{ newItem.type === 'part' ? $t('maintenance.addPart') : $t('maintenance.addService') }}</h3>
          <div class="modal-form">
            <input v-model="newItem.name" :placeholder="$t('maintenance.itemName')" />
            <input v-model="newItem.description" :placeholder="$t('maintenance.description')" />
            <select v-model="newItem.category">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input v-model="newItem.cost" type="number" :placeholder="$t('maintenance.cost')" min="0" />
            <input v-model="newItem.quantity" type="number" :placeholder="$t('maintenance.qty')" min="1" />
            <label class="checkbox-label">
              <input type="checkbox" v-model="newItem.is_required" />
              {{ $t('maintenance.requiredForContract') }}
            </label>
          </div>
          <div class="modal-actions">
            <button @click="showAddItem = false" class="btn-outline">{{ $t('common.cancel') }}</button>
            <button @click="addNewItem" class="btn-primary">{{ $t('common.add') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Complete Modal -->
    <Teleport to="body">
      <div v-if="showCompleteModal" class="modal-overlay" @click.self="showCompleteModal = false">
        <div class="modal">
          <h3>{{ $t('maintenance.markComplete') }}</h3>
          <p class="modal-desc">{{ $t('maintenance.completeDesc') }}</p>
          <div class="modal-form">
            <input v-model="completeForm.actual_cost" type="number" :placeholder="$t('maintenance.actualCost') + ' (TZS)'" min="0" />
            <textarea v-model="completeForm.notes" :placeholder="$t('common.notes')" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button @click="showCompleteModal = false" class="btn-outline">{{ $t('common.cancel') }}</button>
            <button @click="completeReport" class="btn-primary" :disabled="isCompleting">
              {{ isCompleting ? $t('common.processing') : $t('maintenance.confirmComplete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <div v-else class="loading-state">
    <font-awesome-icon icon="fa-solid fa-spinner" spin size="2x" />
    <p>{{ $t('common.loading') }}</p>
  </div>
</template>

<style scoped>
.report-detail { padding: 0; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.back-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  font-size: 0.82rem;
  font-family: 'Space Grotesk', sans-serif;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.back-btn:hover { color: #fff; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.priority-badge, .status-badge {
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

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
.btn-primary:hover { transform: translateY(-1px); }
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
}

.progress-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.4);
}
.progress-pct { font-weight: 700; color: #00E5FF; }
.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}
.info-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.info-icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.info-label { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
.info-value { font-weight: 700; color: #fff; font-size: 0.95rem; }
.info-sub { font-size: 0.75rem; color: rgba(255,255,255,0.3); }

.detail-sections {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.detail-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
}
.detail-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
}
.detail-text {
  color: rgba(255,255,255,0.6);
  font-size: 0.88rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.items-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.add-btn {
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(0, 229, 255, 0.08);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: #00E5FF;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
}
.add-btn:hover { background: rgba(0, 229, 255, 0.15); }

.empty-items { text-align: center; padding: 20px; color: rgba(255,255,255,0.25); font-size: 0.85rem; }

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-card {
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 8px;
}
.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.item-name { font-weight: 600; color: #fff; font-size: 0.9rem; }
.required-tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  font-size: 0.65rem;
  font-weight: 600;
}
.item-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin-bottom: 8px;
}
.item-cost { color: #00C4D4; font-weight: 600; }
.item-actions { display: flex; gap: 6px; }
.status-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.4);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.status-btn.active { background: rgba(0, 229, 255, 0.15); color: #00E5FF; border-color: rgba(0, 229, 255, 0.3); }
.status-btn.completed.active { background: rgba(74, 222, 128, 0.15); color: #4ADE80; border-color: rgba(74, 222, 128, 0.3); }
.status-btn.replaced.active { background: rgba(108, 99, 255, 0.15); color: #6C63FF; border-color: rgba(108, 99, 255, 0.3); }

.required-summary {
  background: rgba(255, 107, 107, 0.04);
  border: 1px solid rgba(255, 107, 107, 0.12);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
}
.required-desc {
  color: rgba(255,255,255,0.4);
  font-size: 0.82rem;
  margin-bottom: 12px;
}
.required-list { display: flex; flex-direction: column; gap: 6px; }
.required-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 107, 107, 0.06);
  border-radius: 6px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
}
.required-item svg { color: #ff6b6b; }
.required-cost { margin-left: auto; color: #ff6b6b; font-weight: 600; }

.cost-summary {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
}
.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.5);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.cost-row:last-child { border-bottom: none; }
.actual-cost { font-weight: 700; color: #00E5FF; }

.notes-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: rgba(255,255,255,0.3);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
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
.modal-form input, .modal-form select, .modal-form textarea {
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.modal-form input:focus, .modal-form select:focus, .modal-form textarea:focus {
  border-color: rgba(0, 229, 255, 0.3);
}
.modal-form select option { background: #0a0818; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
}
.checkbox-label input { accent-color: #00C4D4; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .header-actions { flex-wrap: wrap; }
  .detail-sections { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
