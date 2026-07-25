<template>
  <div class="owner-report-detail">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('ownerReports.reportDetail') }} #{{ report?.id }}</h1>
        <p class="page-sub">{{ report?.title }}</p>
      </div>
      <div class="header-actions">
        <RouterLink to="/owner/owner-reports" class="btn-outline">
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.back') }}
        </RouterLink>
        <RouterLink v-if="report?.status === 'draft'" :to="`/owner/owner-reports/${report.id}/edit`" class="btn-outline">
          <font-awesome-icon icon="fa-solid fa-edit" /> {{ $t('common.edit') }}
        </RouterLink>
      </div>
    </div>

    <SkeletonLoader v-if="loading" variant="detail" />

    <template v-else-if="report">
      <!-- Status Bar -->
      <div class="workflow-bar">
        <div v-for="(step, i) in workflowSteps" :key="step.key"
          class="workflow-step"
          :class="{ active: step.key === report.status, completed: isStepCompleted(step.key) }">
          <div class="step-dot">
            <font-awesome-icon v-if="isStepCompleted(step.key)" icon="fa-solid fa-check" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="step-label">{{ $t(step.label) }}</span>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">{{ $t('common.status') }}</div>
          <span class="status-badge" :style="{ background: getStatusColor(report.status) + '18', color: getStatusColor(report.status) }">
            {{ getStatusLabel(report.status) }}
          </span>
        </div>
        <div class="info-card">
          <div class="info-label">{{ $t('common.date') }}</div>
          <div class="info-value">{{ formatDate(report.created_at) }}</div>
        </div>
        <div class="info-card" v-if="report.vehicle">
          <div class="info-label">{{ $t('ownerReports.vehicle') }}</div>
          <div class="info-value">{{ report.vehicle.name }} ({{ report.vehicle.registration || 'N/A' }})</div>
        </div>
        <div class="info-card" v-if="report.technician">
          <div class="info-label">{{ $t('ownerReports.technician') }}</div>
          <div class="info-value">{{ report.technician.name }}</div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="report.description" class="section-card">
        <h3>{{ $t('ownerReports.description') }}</h3>
        <p class="section-text">{{ report.description }}</p>
      </div>

      <!-- Export Buttons -->
      <div class="export-bar">
        <h3>{{ $t('ownerReports.exportReport') }}</h3>
        <div class="export-btns">
          <button @click="exportPdf" class="btn-export" :disabled="exporting">
            <font-awesome-icon icon="fa-solid fa-file-pdf" /> PDF
          </button>
          <button @click="exportDocx" class="btn-export" :disabled="exporting">
            <font-awesome-icon icon="fa-solid fa-file-word" /> DOCX
          </button>
          <button @click="exportXlsx" class="btn-export" :disabled="exporting">
            <font-awesome-icon icon="fa-solid fa-file-excel" /> XLSX
          </button>
        </div>
      </div>

      <!-- Questions & Answers -->
      <div class="section-card">
        <h3>{{ $t('ownerReports.questions') }}</h3>
        <div v-if="isEditing" class="answer-mode-notice">
          <font-awesome-icon icon="fa-solid fa-pen" />
          {{ $t('ownerReports.fillAnswers') }}
        </div>
        <div class="questions-table">
          <div v-for="q in report.questions" :key="q.id" class="question-row">
            <div class="q-main">
              <div class="q-header">
                <span class="q-number">Q{{ q.id }}</span>
                <span class="q-type">{{ q.type }}</span>
                <span v-if="q.required" class="q-required">{{ $t('ownerReports.required') }}</span>
              </div>
              <div class="q-text">{{ q.question }}</div>
              <div v-if="q.options" class="q-options">
                {{ $t('ownerReports.options') }}: {{ q.options.join(', ') }}
              </div>
            </div>
            <div class="q-answer">
              <template v-if="isEditing && !q.answer">
                <input v-if="q.type === 'text' || q.type === 'number'" v-model="editingAnswers[q.id]" :type="q.type" class="answer-input" />
                <textarea v-else-if="q.type === 'textarea'" v-model="editingAnswers[q.id]" class="answer-input" rows="2"></textarea>
                <select v-else-if="q.type === 'select'" v-model="editingAnswers[q.id]" class="answer-input">
                  <option value="">{{ $t('ownerReports.selectAnswer') }}</option>
                  <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <label v-else-if="q.type === 'checkbox'" class="checkbox-label">
                  <input type="checkbox" :checked="editingAnswers[q.id] === 'yes'" @change="editingAnswers[q.id] = $event.target.checked ? 'yes' : 'no'" />
                  {{ $t('ownerReports.yes') }}
                </label>
              </template>
              <template v-else-if="q.answer">
                <div class="answer-value">{{ q.answer }}</div>
                <div class="answer-time" v-if="q.answered_at">{{ formatDate(q.answered_at) }}</div>
              </template>
              <div v-else class="answer-empty">{{ $t('ownerReports.notAnswered') }}</div>
            </div>
          </div>
        </div>
        <div v-if="isEditing" class="save-answers-bar">
          <button class="btn-primary" @click="saveAnswers" :disabled="savingAnswers">
            {{ savingAnswers ? $t('common.saving') : $t('ownerReports.saveAnswers') }}
          </button>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signatures-grid" v-if="report.technician_signature || report.owner_signature">
        <div v-if="report.technician_signature" class="signature-card">
          <div class="sig-icon tech"><font-awesome-icon icon="fa-solid fa-pen-nib" /></div>
          <div class="sig-label">{{ $t('ownerReports.technicianSignature') }}</div>
          <div class="sig-value">{{ report.technician_signature }}</div>
          <div class="sig-time" v-if="report.technician_signed_at">{{ formatDate(report.technician_signed_at) }}</div>
        </div>
        <div v-if="report.owner_signature" class="signature-card">
          <div class="sig-icon owner"><font-awesome-icon icon="fa-solid fa-pen-nib" /></div>
          <div class="sig-label">{{ $t('ownerReports.ownerSignature') }}</div>
          <div class="sig-value">{{ report.owner_signature }}</div>
          <div class="sig-time" v-if="report.owner_signed_at">{{ formatDate(report.owner_signed_at) }}</div>
        </div>
      </div>

      <!-- Notes -->
      <div class="section-card" v-if="report.technician_notes || report.owner_notes">
        <h3>{{ $t('ownerReports.notes') }}</h3>
        <div v-if="report.technician_notes" class="note-block tech">
          <strong>{{ $t('ownerReports.technicianNotes') }}:</strong>
          <p>{{ report.technician_notes }}</p>
        </div>
        <div v-if="report.owner_notes" class="note-block owner">
          <strong>{{ $t('ownerReports.ownerNotes') }}:</strong>
          <p>{{ report.owner_notes }}</p>
        </div>
      </div>

      <!-- Owner Actions -->
      <div class="actions-section" v-if="report.status !== 'completed' && report.status !== 'cancelled'">
        <h3>{{ $t('ownerReports.actions') }}</h3>
        <div class="action-buttons">
          <button v-if="report.status === 'draft'" class="btn-outline" @click="isEditing = !isEditing">
            <font-awesome-icon icon="fa-solid fa-pen" />
            {{ isEditing ? $t('ownerReports.stopEditing') : $t('ownerReports.fillAnswersSelf') }}
          </button>

          <button v-if="report.status === 'submitted'" class="btn-primary" @click="reviewReport">
            <font-awesome-icon icon="fa-solid fa-eye" /> {{ $t('ownerReports.markReviewed') }}
          </button>

          <button v-if="report.status === 'reviewed'" class="btn-primary" @click="showVerifyModal = true">
            <font-awesome-icon icon="fa-solid fa-check-double" /> {{ $t('ownerReports.verifySign') }}
          </button>

          <button v-if="report.status === 'verified'" class="btn-success" @click="completeReport">
            <font-awesome-icon icon="fa-solid fa-flag-checkered" /> {{ $t('ownerReports.markCompleted') }}
          </button>

          <button class="btn-danger" @click="cancelReport" v-if="report.status !== 'cancelled'">
            <font-awesome-icon icon="fa-solid fa-ban" /> {{ $t('ownerReports.cancelReport') }}
          </button>
        </div>
      </div>

      <!-- Completed Banner -->
      <div v-if="report.status === 'completed'" class="completed-banner">
        <font-awesome-icon icon="fa-solid fa-check-circle" size="2x" />
        <div>
          <h3>{{ $t('ownerReports.reportCompleted') }}</h3>
          <p v-if="report.completed_at">{{ $t('ownerReports.completedOn') }} {{ formatDate(report.completed_at) }}</p>
        </div>
      </div>

      <!-- Verify Modal -->
      <Teleport to="body">
        <div v-if="showVerifyModal" class="modal-overlay" @click.self="showVerifyModal = false">
          <div class="modal">
            <h3>{{ $t('ownerReports.verifyAndSign') }}</h3>
            <div class="form-group">
              <label>{{ $t('ownerReports.ownerNotes') }}</label>
              <textarea v-model="verifyForm.owner_notes" rows="3" :placeholder="$t('ownerReports.verifyNotesPlaceholder')"></textarea>
            </div>
            <div class="form-group">
              <label>{{ $t('ownerReports.ownerSignature') }} *</label>
              <input v-model="verifyForm.owner_signature" type="text" required :placeholder="$t('ownerReports.signaturePlaceholder')" />
            </div>
            <div class="modal-actions">
              <button class="btn-outline" @click="showVerifyModal = false">{{ $t('common.cancel') }}</button>
              <button class="btn-primary" @click="verifyReport" :disabled="!verifyForm.owner_signature">
                {{ $t('ownerReports.confirmVerify') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import api from '@/composables/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const report = ref(null)
const isEditing = ref(false)
const editingAnswers = reactive({})
const savingAnswers = ref(false)
const exporting = ref(false)
const showVerifyModal = ref(false)
const verifyForm = reactive({ owner_notes: '', owner_signature: '' })

const workflowSteps = [
  { key: 'draft', label: 'ownerReports.wfDraft' },
  { key: 'pending_technician', label: 'ownerReports.wfPending' },
  { key: 'submitted', label: 'ownerReports.wfSubmitted' },
  { key: 'reviewed', label: 'ownerReports.wfReviewed' },
  { key: 'verified', label: 'ownerReports.wfVerified' },
  { key: 'completed', label: 'ownerReports.wfCompleted' },
]

const statusOrder = ['draft', 'pending_technician', 'submitted', 'reviewed', 'verified', 'completed']

function isStepCompleted(key) {
  const currentIdx = statusOrder.indexOf(report.value?.status)
  const stepIdx = statusOrder.indexOf(key)
  return stepIdx < currentIdx
}

async function fetchReport() {
  loading.value = true
  try {
    const { data } = await api.get(`/owner/reports/${route.params.id}`)
    report.value = data.data
  } catch (e) {
    console.error(e)
    router.push('/owner/owner-reports')
  } finally {
    loading.value = false
  }
}

async function saveAnswers() {
  savingAnswers.value = true
  try {
    for (const [qId, answer] of Object.entries(editingAnswers)) {
      if (answer) {
        await api.post(`/owner/reports/${report.value.id}/answer`, {
          question_id: parseInt(qId),
          answer,
        })
      }
    }
    isEditing.value = false
    await fetchReport()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || t('common.error'))
  } finally {
    savingAnswers.value = false
  }
}

async function reviewReport() {
  try {
    await api.post(`/owner/reports/${report.value.id}/review`)
    await fetchReport()
  } catch (e) { console.error(e) }
}

async function verifyReport() {
  try {
    await api.post(`/owner/reports/${report.value.id}/verify`, verifyForm)
    showVerifyModal.value = false
    await fetchReport()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || t('common.error'))
  }
}

async function completeReport() {
  try {
    await api.post(`/owner/reports/${report.value.id}/complete`)
    await fetchReport()
  } catch (e) { console.error(e) }
}

async function cancelReport() {
  if (!confirm(t('ownerReports.cancelConfirm'))) return
  try {
    await api.post(`/owner/reports/${report.value.id}/cancel`)
    await fetchReport()
  } catch (e) { console.error(e) }
}

async function exportPdf() {
  exporting.value = true
  try {
    const response = await api.get(`/owner/reports/${report.value.id}/export/pdf`, { responseType: 'blob' })
    downloadBlob(response.data, `owner-report-${report.value.id}.pdf`)
  } catch (e) { console.error(e); alert(t('ownerReports.exportFailed')) }
  finally { exporting.value = false }
}

async function exportDocx() {
  exporting.value = true
  try {
    const response = await api.get(`/owner/reports/${report.value.id}/export/docx`, { responseType: 'blob' })
    downloadBlob(response.data, `owner-report-${report.value.id}.docx`)
  } catch (e) { console.error(e); alert(t('ownerReports.exportFailed')) }
  finally { exporting.value = false }
}

async function exportXlsx() {
  exporting.value = true
  try {
    const response = await api.get(`/owner/reports/${report.value.id}/export/xlsx`, { responseType: 'blob' })
    downloadBlob(response.data, `owner-report-${report.value.id}.xlsx`)
  } catch (e) { console.error(e); alert(t('ownerReports.exportFailed')) }
  finally { exporting.value = false }
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function getStatusColor(status) {
  const map = { draft:'rgba(255,255,255,0.35)', pending_technician:'#3b82f6', submitted:'#FFD93D', reviewed:'#a855f7', verified:'#6C63FF', completed:'#4ADE80', cancelled:'#ff6b6b' }
  return map[status] || 'rgba(255,255,255,0.35)'
}
function getStatusLabel(status) {
  const map = { draft:'Draft', pending_technician:'Pending Technician', submitted:'Submitted', reviewed:'Reviewed', verified:'Verified', completed:'Completed', cancelled:'Cancelled' }
  return map[status] || status
}
function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchReport)
</script>

<style scoped>
.owner-report-detail { padding: 0; max-width: 960px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }
.header-actions { display: flex; gap: 10px; }

/* Workflow Bar */
.workflow-bar {
  display: flex;
  gap: 0;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  overflow-x: auto;
}
.workflow-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; min-width: 90px; position: relative; }
.workflow-step:not(:last-child)::after { content: ''; position: absolute; top: 14px; left: 55%; right: -45%; height: 2px; background: rgba(255,255,255,0.08); z-index: 0; }
.workflow-step.completed:not(:last-child)::after { background: #4ADE80; }
.workflow-step.active:not(:last-child)::after { background: linear-gradient(to right, #4ADE80 50%, rgba(255,255,255,0.08) 50%); }
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  color: rgba(255,255,255,0.35);
  z-index: 1;
}
.workflow-step.active .step-dot { background: #00E5FF; color: #0a0818; }
.workflow-step.completed .step-dot { background: #4ADE80; color: #0a0818; }
.step-label { font-size: 0.72rem; color: rgba(255,255,255,0.35); text-align: center; white-space: nowrap; }
.workflow-step.active .step-label { color: #00E5FF; font-weight: 600; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px; }
.info-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 14px;
}
.info-label { font-size: 0.78rem; color: rgba(255,255,255,0.35); text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
.info-value { color: rgba(255,255,255,0.8); font-size: 0.9rem; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }

/* Section Card */
.section-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.section-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
}
.section-text { color: rgba(255,255,255,0.6); line-height: 1.6; }

/* Export Bar */
.export-bar {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.export-bar h3 { margin: 0; font-size: 1rem; color: #fff; font-family: 'Syne', sans-serif; }
.export-btns { display: flex; gap: 10px; }
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-export:hover { border-color: rgba(0,229,255,0.3); color: #00E5FF; }

/* Questions */
.questions-table { display: flex; flex-direction: column; gap: 12px; }
.question-row {
  display: flex;
  gap: 16px;
  padding: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}
.q-main { flex: 2; }
.q-header { display: flex; gap: 10px; align-items: center; margin-bottom: 6px; }
.q-number { font-family: 'Syne', sans-serif; font-weight: 700; color: #00E5FF; }
.q-type { font-size: 0.75rem; background: rgba(0,229,255,0.1); color: #00E5FF; padding: 2px 8px; border-radius: 10px; }
.q-required { font-size: 0.72rem; color: #ff6b6b; font-weight: 600; }
.q-text { font-weight: 500; color: rgba(255,255,255,0.85); }
.q-options { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
.q-answer { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.answer-input {
  width: 100%;
  padding: 8px 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.answer-input:focus { border-color: rgba(0,229,255,0.3); }
.answer-value { font-weight: 500; color: #4ADE80; }
.answer-time { font-size: 0.75rem; color: rgba(255,255,255,0.25); }
.answer-empty { color: rgba(255,255,255,0.3); font-style: italic; font-size: 0.85rem; }
.checkbox-label { display: flex; align-items: center; gap: 6px; cursor: pointer; color: rgba(255,255,255,0.7); }
.save-answers-bar { margin-top: 16px; display: flex; justify-content: flex-end; }
.answer-mode-notice {
  background: rgba(0,229,255,0.06);
  color: #00E5FF;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0,229,255,0.15);
}

/* Signatures */
.signatures-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.signature-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.sig-icon { width: 48px; height: 48px; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; }
.sig-icon.tech { background: rgba(0,229,255,0.1); color: #00E5FF; }
.sig-icon.owner { background: rgba(74,222,128,0.1); color: #4ADE80; }
.sig-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 600; }
.sig-value { font-size: 1.1rem; font-weight: 600; color: #fff; font-style: italic; margin-top: 4px; }
.sig-time { font-size: 0.75rem; color: rgba(255,255,255,0.25); margin-top: 4px; }

/* Notes */
.note-block {
  padding: 12px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 10px;
}
.note-block.tech { background: rgba(0,229,255,0.04); border-left: 4px solid #00E5FF; }
.note-block.tech strong { color: #00E5FF; }
.note-block.tech p { color: rgba(255,255,255,0.7); }
.note-block.owner { background: rgba(255,217,61,0.04); border-left: 4px solid #FFD93D; }
.note-block.owner strong { color: #FFD93D; }
.note-block.owner p { color: rgba(255,255,255,0.7); }
.note-block p { margin: 6px 0 0; }

/* Actions */
.actions-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.actions-section h3 { font-family: 'Syne', sans-serif; margin: 0 0 16px; color: #fff; }
.action-buttons { display: flex; gap: 12px; flex-wrap: wrap; }

/* Completed Banner */
.completed-banner {
  background: rgba(74,222,128,0.06);
  border: 1px solid rgba(74,222,128,0.2);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  color: #4ADE80;
}
.completed-banner h3 { font-family: 'Syne', sans-serif; margin: 0; color: #4ADE80; }
.completed-banner p { margin: 4px 0 0; color: rgba(255,255,255,0.5); font-size: 0.85rem; }

/* Buttons */
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
  text-decoration: none;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(74,222,128,0.15);
  border: 1px solid rgba(74,222,128,0.3);
  color: #4ADE80;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(255,107,107,0.15);
  border: 1px solid rgba(255,107,107,0.3);
  color: #ff6b6b;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal {
  background: #13112a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
}
.modal h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.6); }
.form-group input,
.form-group textarea {
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.form-group input:focus,
.form-group textarea:focus { border-color: rgba(0,229,255,0.3); }
.form-group input::placeholder,
.form-group textarea::placeholder { color: rgba(255,255,255,0.25); }
</style>
