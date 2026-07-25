<template>
  <div class="report-form-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? $t('ownerReports.editReport') : $t('ownerReports.createReport') }}</h1>
        <p class="page-sub">{{ isEdit ? $t('ownerReports.editReportDesc') : $t('ownerReports.createReportDesc') }}</p>
      </div>
      <RouterLink to="/owner/owner-reports" class="btn btn-secondary">
        <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.back') }}
      </RouterLink>
    </div>

    <form @submit.prevent="saveReport" class="report-form">
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
          <div class="form-group">
            <label>{{ $t('ownerReports.technician') }}</label>
            <select v-model="form.technician_id">
              <option :value="null">{{ $t('ownerReports.selectTechnician') }}</option>
              <option v-for="t in technicians" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>{{ $t('ownerReports.description') }}</label>
            <textarea v-model="form.description" rows="3" :placeholder="$t('ownerReports.descriptionPlaceholder')"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <h3>{{ $t('ownerReports.questions') }} ({{ form.questions.length }})</h3>
          <button type="button" class="btn btn-sm btn-outline" @click="addQuestion">
            <font-awesome-icon icon="fa-solid fa-plus" /> {{ $t('ownerReports.addQuestion') }}
          </button>
        </div>

        <div v-if="form.questions.length === 0" class="empty-questions">
          <font-awesome-icon icon="fa-solid fa-question-circle" size="2x" />
          <p>{{ $t('ownerReports.noQuestions') }}</p>
        </div>

        <TransitionGroup name="question" tag="div" class="questions-list">
          <div v-for="(q, index) in form.questions" :key="q.id || index" class="question-card">
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <div class="question-actions">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="q.required" />
                  {{ $t('ownerReports.required') }}
                </label>
                <button type="button" class="btn-icon btn-danger" @click="removeQuestion(index)">
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
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div class="form-actions">
        <RouterLink to="/owner/owner-reports" class="btn btn-secondary">{{ $t('common.cancel') }}</RouterLink>
        <button type="submit" class="btn btn-primary" :disabled="saving">
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
      })),
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
.report-form-page { padding: 24px; max-width: 900px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
.page-sub { color: #6b7280; margin: 4px 0 0 0; font-size: 0.9rem; }
.report-form { display: flex; flex-direction: column; gap: 24px; }
.form-section { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
.form-section h3 { margin: 0 0 16px; font-size: 1.1rem; color: #111827; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; font-size: 1.1rem; color: #111827; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
.form-group input, .form-group select, .form-group textarea {
  padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.questions-list { display: flex; flex-direction: column; gap: 12px; }
.question-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.question-number { font-weight: 700; color: #2563eb; font-size: 0.9rem; }
.question-actions { display: flex; align-items: center; gap: 12px; }
.question-body { display: flex; flex-direction: column; gap: 12px; }
.question-meta { display: flex; gap: 12px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #6b7280; cursor: pointer; }
.empty-questions { text-align: center; padding: 40px; color: #9ca3af; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer; text-decoration: none; }
.btn-primary { background: #2563eb; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-outline { background: white; border: 1px solid #d1d5db; color: #374151; }
.btn-sm { padding: 6px 14px; font-size: 0.82rem; }
.btn-icon { background: none; border: none; padding: 6px 8px; border-radius: 6px; cursor: pointer; color: #6b7280; }
.btn-icon:hover { background: #fee2e2; color: #ef4444; }
.question-enter-active, .question-leave-active { transition: all 0.3s ease; }
.question-enter-from { opacity: 0; transform: translateY(-10px); }
.question-leave-to { opacity: 0; transform: translateX(20px); }
</style>
