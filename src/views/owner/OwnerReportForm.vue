<template>
  <div class="report-form-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? $t('ownerReports.editReport') : $t('ownerReports.createReport') }}</h1>
        <p class="page-sub">{{ isEdit ? $t('ownerReports.editReportDesc') : $t('ownerReports.createReportDesc') }}</p>
      </div>
      <RouterLink to="/owner/owner-reports" class="btn-outline">
        <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.back') }}
      </RouterLink>
    </div>

    <form @submit.prevent="saveReport" class="report-form">
      <!-- Mode Selection -->
      <div class="form-section">
        <h3>{{ $t('ownerReports.howToFill') }}</h3>
        <p class="section-hint">{{ $t('ownerReports.howToFillHint') }}</p>
        <div class="mode-cards">
          <button type="button" class="mode-card" :class="{ active: fillMode === 'self' }" @click="fillMode = 'self'">
            <div class="mode-icon self">
              <font-awesome-icon icon="fa-solid fa-pen" />
            </div>
            <div class="mode-info">
              <div class="mode-title">{{ $t('ownerReports.fillAnswersSelf') }}</div>
              <div class="mode-desc">{{ $t('ownerReports.fillAnswersSelfDesc') }}</div>
            </div>
            <div class="mode-check" v-if="fillMode === 'self'">
              <font-awesome-icon icon="fa-solid fa-circle-check" />
            </div>
          </button>
          <button type="button" class="mode-card" :class="{ active: fillMode === 'technician' }" @click="fillMode = 'technician'">
            <div class="mode-icon tech">
              <font-awesome-icon icon="fa-solid fa-user-gear" />
            </div>
            <div class="mode-info">
              <div class="mode-title">{{ $t('ownerReports.sendToTechnician') }}</div>
              <div class="mode-desc">{{ $t('ownerReports.sendToTechnicianDesc') }}</div>
            </div>
            <div class="mode-check" v-if="fillMode === 'technician'">
              <font-awesome-icon icon="fa-solid fa-circle-check" />
            </div>
          </button>
        </div>
      </div>

      <div class="form-section">
        <h3>{{ $t('ownerReports.reportDetails') }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('common.title') }} *</label>
            <input v-model="form.title" type="text" required :placeholder="$t('ownerReports.titlePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ $t('ownerReports.vehicle') }}</label>
            <select v-model="form.vehicle_id">
              <option :value="null">{{ $t('ownerReports.selectVehicle') }}</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.name }} ({{ v.registration || 'N/A' }})</option>
            </select>
          </div>
          <div class="form-group" :class="{ 'full-width': fillMode === 'self' }">
            <label>{{ $t('ownerReports.technician') }} <span v-if="fillMode === 'technician'" class="required-star">*</span></label>
            <select v-model="form.technician_id" :required="fillMode === 'technician'">
              <option :value="null">{{ $t('ownerReports.selectTechnician') }}</option>
              <option v-for="t in technicians" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Findings / Description -->
      <div class="form-section">
        <h3><font-awesome-icon icon="fa-solid fa-pen-to-square" /> {{ $t('ownerReports.technicianFindings') }}</h3>
        <p class="section-hint" v-if="fillMode === 'self'">{{ $t('ownerReports.technicianFindingsHint') }}</p>
        <p class="section-hint" v-else>{{ $t('ownerReports.findingsForTechHint') }}</p>
        <div class="form-group full-width">
          <textarea v-model="form.description" rows="6" class="large-notes" :placeholder="fillMode === 'self' ? $t('ownerReports.findingsPlaceholder') : $t('ownerReports.findingsTechPlaceholder')"></textarea>
        </div>
      </div>

      <!-- Dynamic Questions Builder -->
      <div class="form-section">
        <div class="section-header">
          <div>
            <h3>
              <font-awesome-icon icon="fa-solid fa-circle-question" />
              {{ $t('ownerReports.questions') }} ({{ form.questions.length }})
            </h3>
            <p class="section-hint">{{ fillMode === 'self' ? $t('ownerReports.questionsOptional') : $t('ownerReports.questionsForTechnicianHint') }}</p>
          </div>
          <button type="button" class="btn-add" @click="addQuestion">
            <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('ownerReports.addQuestion') }}
          </button>
        </div>

        <div v-if="form.questions.length === 0" class="empty-questions">
          <font-awesome-icon icon="fa-solid fa-circle-question" size="2x" />
          <p>{{ fillMode === 'self' ? $t('ownerReports.noQuestionsHint') : $t('ownerReports.addQuestionsForTech') }}</p>
        </div>

        <TransitionGroup name="question" tag="div" class="questions-list">
          <div v-for="(q, index) in form.questions" :key="q.id || index" class="question-card">
            <div class="question-header">
              <div class="question-left">
                <span class="question-number">Q{{ index + 1 }}</span>
                <span class="answerer-badge" :class="fillMode">
                  <font-awesome-icon :icon="fillMode === 'self' ? 'fa-solid fa-user' : 'fa-solid fa-user-gear'" />
                  {{ fillMode === 'self' ? $t('ownerReports.youAnswer') : $t('ownerReports.techAnswers') }}
                </span>
              </div>
              <div class="question-actions">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="q.required" />
                  {{ $t('ownerReports.required') }}
                </label>
                <button type="button" class="action-btn move" v-if="index > 0" @click="moveQuestion(index, -1)" :title="$t('ownerReports.moveUp')">
                  <font-awesome-icon icon="fa-solid fa-chevron-up" />
                </button>
                <button type="button" class="action-btn move" v-if="index < form.questions.length - 1" @click="moveQuestion(index, 1)" :title="$t('ownerReports.moveDown')">
                  <font-awesome-icon icon="fa-solid fa-chevron-down" />
                </button>
                <button type="button" class="action-btn delete" @click="removeQuestion(index)" :title="$t('ownerReports.removeQuestion')">
                  <font-awesome-icon icon="fa-solid fa-trash" />
                </button>
              </div>
            </div>
            <div class="question-body">
              <div class="form-group">
                <label>{{ $t('ownerReports.questionText') }} *</label>
                <input v-model="q.question" type="text" required :placeholder="$t('ownerReports.questionPlaceholder')" />
              </div>
              <div class="question-meta">
                <div class="form-group">
                  <label>{{ $t('ownerReports.answerType') }}</label>
                  <select v-model="q.type">
                    <option value="text">{{ $t('ownerReports.typeText') }}</option>
                    <option value="textarea">{{ $t('ownerReports.typeTextarea') }}</option>
                    <option value="number">{{ $t('ownerReports.typeNumber') }}</option>
                    <option value="select">{{ $t('ownerReports.typeSelect') }}</option>
                    <option value="checkbox">{{ $t('ownerReports.typeCheckbox') }}</option>
                  </select>
                </div>
                <div v-if="q.type === 'select'" class="form-group" style="flex:2">
                  <label>{{ $t('ownerReports.options') }} (comma-separated)</label>
                  <input v-model="q.optionsRaw" type="text" :placeholder="$t('ownerReports.optionsPlaceholder')" />
                </div>
              </div>
              <!-- Self Mode: Live Answer Field -->
              <div v-if="fillMode === 'self'" class="answer-field">
                <div class="answer-label">
                  <font-awesome-icon icon="fa-solid fa-pen" />
                  {{ $t('ownerReports.yourAnswer') }}
                </div>
                <input v-if="q.type === 'text'" v-model="q.answer" type="text" class="live-answer-input" :placeholder="$t('ownerReports.typeYourAnswer')" />
                <textarea v-else-if="q.type === 'textarea'" v-model="q.answer" class="live-answer-input live-textarea" rows="3" :placeholder="$t('ownerReports.typeYourAnswer')"></textarea>
                <input v-else-if="q.type === 'number'" v-model="q.answer" type="number" class="live-answer-input" :placeholder="$t('ownerReports.typeYourAnswer')" />
                <select v-else-if="q.type === 'select'" v-model="q.answer" class="live-answer-input">
                  <option value="">{{ $t('ownerReports.selectAnswer') }}</option>
                  <option v-for="opt in (q.optionsRaw || '').split(',').map(o => o.trim()).filter(Boolean)" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <label v-else-if="q.type === 'checkbox'" class="checkbox-label live-checkbox">
                  <input type="checkbox" :checked="q.answer === 'yes'" @change="q.answer = $event.target.checked ? 'yes' : 'no'" />
                  {{ $t('ownerReports.yes') }} / {{ $t('ownerReports.no') }}
                </label>
              </div>

              <!-- Technician Mode: Preview Only -->
              <div v-else class="answer-preview">
                <div class="preview-label">
                  <font-awesome-icon icon="fa-solid fa-eye" />
                  {{ $t('ownerReports.replyPreview') }}
                </div>
                <div class="preview-field">
                  <input v-if="q.type === 'text'" type="text" disabled :placeholder="$t('ownerReports.textAnswerPlaceholder')" class="preview-input" />
                  <textarea v-else-if="q.type === 'textarea'" disabled :placeholder="$t('ownerReports.textAnswerPlaceholder')" class="preview-input preview-textarea" rows="2"></textarea>
                  <input v-else-if="q.type === 'number'" type="number" disabled :placeholder="$t('ownerReports.numberAnswerPlaceholder')" class="preview-input" />
                  <select v-else-if="q.type === 'select'" disabled class="preview-input">
                    <option value="">{{ $t('ownerReports.selectAnswer') }}</option>
                    <option v-for="opt in (q.optionsRaw || '').split(',').map(o => o.trim()).filter(Boolean)" :key="opt">{{ opt }}</option>
                  </select>
                  <label v-else-if="q.type === 'checkbox'" class="checkbox-label preview-checkbox">
                    <input type="checkbox" disabled />
                    {{ $t('ownerReports.yes') }} / {{ $t('ownerReports.no') }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Quick Add Bar -->
        <div class="quick-add" v-if="form.questions.length > 0">
          <button type="button" class="btn-add-row" @click="addQuestion">
            <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('ownerReports.addAnotherQuestion') }}
          </button>
        </div>
      </div>

      <div class="form-actions">
        <RouterLink to="/owner/owner-reports" class="btn-outline">{{ $t('common.cancel') }}</RouterLink>
        <button type="submit" class="btn-primary" :disabled="saving">
          <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner fa-spin" />
          {{ saving ? $t('common.saving') : (isEdit ? $t('common.saveChanges') : $t('ownerReports.createReport')) }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import api from '@/composables/api'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const vehicles = ref([])
const technicians = ref([])
const fillMode = ref('self')

const form = reactive({
  title: '',
  description: '',
  vehicle_id: null,
  technician_id: null,
  questions: [],
})

let questionIdCounter = 100

function addQuestion() {
  form.questions.push({
    id: questionIdCounter++,
    question: '',
    type: 'text',
    options: null,
    optionsRaw: '',
    required: true,
    answer: null,
    answered_at: null,
  })
}

function removeQuestion(index) {
  form.questions.splice(index, 1)
}

function moveQuestion(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.questions.length) return
  const item = form.questions.splice(index, 1)[0]
  form.questions.splice(newIndex, 0, item)
}

async function fetchDropdowns() {
  try {
    const [vRes, tRes] = await Promise.all([
      api.get('/owner/vehicles'),
      api.get('/owner/reports/technicians'),
    ])
    vehicles.value = vRes.data.data?.data || vRes.data.data || []
    technicians.value = tRes.data.data || []
  } catch (e) { console.error(e) }
}

async function loadReport() {
  if (!isEdit.value) return
  try {
    const { data } = await api.get(`/owner/reports/${route.params.id}`)
    const r = data.data
    form.title = r.title
    form.description = r.description
    form.vehicle_id = r.vehicle_id
    form.technician_id = r.technician_id
    form.questions = (r.questions || []).map(q => ({
      ...q,
      optionsRaw: q.options ? q.options.join(', ') : '',
    }))
    if (r.status === 'pending_technician' || r.status === 'submitted') {
      fillMode.value = 'technician'
    }
  } catch (e) {
    console.error(e)
    router.push('/owner/owner-reports')
  }
}

async function saveReport() {
  saving.value = true
  try {
    const payload = {
      title: form.title,
      description: form.description,
      vehicle_id: form.vehicle_id,
      technician_id: form.technician_id,
      questions: form.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.type === 'select' && q.optionsRaw ? q.optionsRaw.split(',').map(o => o.trim()).filter(Boolean) : null,
        required: q.required,
        ...(fillMode.value === 'self' && q.answer ? { answer: q.answer } : {}),
      })),
    }

    if (!isEdit.value && fillMode.value === 'technician' && form.technician_id) {
      payload.status = 'pending_technician'
    }

    if (isEdit.value) {
      await api.put(`/owner/reports/${route.params.id}`, payload)
    } else {
      await api.post('/owner/reports', payload)
    }

    router.push('/owner/owner-reports')
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}

onMounted(() => { fetchDropdowns(); loadReport() })
</script>

<style scoped>
.report-form-page { padding: 0; max-width: 900px; }

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

.report-form { display: flex; flex-direction: column; gap: 24px; }

.form-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 24px;
}
.form-section h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.6); }
.required-star { color: #ff6b6b; }
.form-group input,
.form-group select,
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
.form-group select:focus,
.form-group textarea:focus {
  border-color: rgba(0, 229, 255, 0.3);
}
.form-group select option { background: #0a0818; }
.form-group input::placeholder,
.form-group textarea::placeholder { color: rgba(255,255,255,0.25); }

/* Mode Cards */
.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
.mode-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px;
  background: rgba(255,255,255,0.02);
  border: 2px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: left;
  position: relative;
}
.mode-card:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); }
.mode-card.active { border-color: rgba(0,229,255,0.4); background: rgba(0,229,255,0.04); }
.mode-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.mode-icon.self { background: rgba(0,229,255,0.1); color: #00E5FF; }
.mode-icon.tech { background: rgba(108,99,255,0.1); color: #6C63FF; }
.mode-title { font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 2px; }
.mode-desc { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.4; }
.mode-check { position: absolute; top: 12px; right: 14px; color: #00E5FF; font-size: 1.1rem; }

/* Large Notes */
.large-notes {
  width: 100%;
  min-height: 140px;
  padding: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Space Grotesk', sans-serif;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}
.large-notes:focus { border-color: rgba(0,229,255,0.3); }
.large-notes::placeholder { color: rgba(255,255,255,0.25); }

/* Questions */
.questions-list { display: flex; flex-direction: column; gap: 12px; }
.question-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}
.question-card:hover { border-color: rgba(255,255,255,0.1); }
.question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.question-left { display: flex; align-items: center; gap: 10px; }
.question-number {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  color: #00E5FF;
  font-size: 0.9rem;
}
.answerer-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 600;
}
.answerer-badge.self { background: rgba(0,229,255,0.1); color: #00E5FF; }
.answerer-badge.technician { background: rgba(108,99,255,0.1); color: #6C63FF; }
.question-actions { display: flex; align-items: center; gap: 8px; }
.question-body { display: flex; flex-direction: column; gap: 12px; }
.question-meta { display: flex; gap: 12px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: rgba(255,255,255,0.5); cursor: pointer; }
.section-hint { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin: -8px 0 12px; }
.empty-questions { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); }

/* Live Answer Field (Self Mode) */
.answer-field {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0,229,255,0.15);
}
.answer-label {
  font-size: 0.72rem;
  color: #00E5FF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}
.live-answer-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0,229,255,0.03);
  border: 1px solid rgba(0,229,255,0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 0.88rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.live-answer-input:focus {
  border-color: rgba(0,229,255,0.45);
  background: rgba(0,229,255,0.05);
}
.live-answer-input::placeholder { color: rgba(255,255,255,0.25); }
.live-textarea { min-height: 70px; resize: vertical; line-height: 1.5; }
.live-checkbox { color: rgba(255,255,255,0.6); }
.live-checkbox input[type="checkbox"] { accent-color: #00E5FF; }

/* Answer Preview (Technician Mode) */
.answer-preview {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255,255,255,0.08);
}
.preview-label {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.preview-field { pointer-events: none; opacity: 0.5; }
.preview-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  color: rgba(255,255,255,0.3);
  font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.preview-textarea { min-height: 50px; resize: none; }
.preview-checkbox { color: rgba(255,255,255,0.3); }

/* Quick Add Bar */
.quick-add {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.btn-add-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  background: transparent;
  border: 1px dashed rgba(0,229,255,0.25);
  color: rgba(0,229,255,0.6);
  font-size: 0.82rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.btn-add-row:hover { border-color: rgba(0,229,255,0.5); color: #00E5FF; background: rgba(0,229,255,0.04); }

/* Buttons */
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; }
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
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.2);
  color: #00E5FF;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.action-btn {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: rgba(255,255,255,0.5);
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn.move:hover { color: #00E5FF; border-color: rgba(0,229,255,0.2); }
.action-btn.delete:hover { color: #ff6b6b; border-color: rgba(255,107,107,0.2); }

.question-enter-active, .question-leave-active { transition: all 0.3s ease; }
.question-enter-from { opacity: 0; transform: translateY(-10px); }
.question-leave-to { opacity: 0; transform: translateX(20px); }

@media (max-width: 768px) {
  .mode-cards { grid-template-columns: 1fr; }
  .question-meta { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
  .page-header { flex-wrap: wrap; gap: 12px; }
  .page-title { font-size: 1.4rem; }
  .form-actions { flex-wrap: wrap; justify-content: stretch; }
  .form-actions .btn-primary,
  .form-actions .btn-outline { flex: 1; justify-content: center; }
  .form-section { padding: 16px; }
}
</style>
