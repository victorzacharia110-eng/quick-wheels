<template>
  <div class="report-detail" v-if="report">
    <div class="page-header">
      <div>
        <RouterLink to="/technician/owner-reports" class="back-btn">
          <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.back') }}
        </RouterLink>
        <h1 class="page-title">{{ report.title }}</h1>
        <p class="page-sub">{{ $t('techOwnerReports.reportFrom') }} {{ report.owner?.name || 'Owner' }}</p>
      </div>
      <div class="header-actions">
        <span class="status-badge" :style="{ background: getStatusColor(report.status) + '18', color: getStatusColor(report.status) }">
          {{ getStatusLabel(report.status) }}
        </span>
      </div>
    </div>

    <!-- Info Cards -->
    <div class="info-grid">
      <div class="info-card" v-if="report.vehicle">
        <div class="info-icon" style="background: rgba(0, 229, 255, 0.12); color: #00e5ff;">
          <font-awesome-icon icon="fa-solid fa-car" />
        </div>
        <div>
          <div class="info-label">{{ $t('techOwnerReports.vehicle') }}</div>
          <div class="info-value">{{ report.vehicle.name }} ({{ report.vehicle.registration || 'N/A' }})</div>
        </div>
      </div>
      <div class="info-card">
        <div class="info-icon" style="background: rgba(74, 222, 128, 0.12); color: #4ADE80;">
          <font-awesome-icon icon="fa-solid fa-calendar" />
        </div>
        <div>
          <div class="info-label">{{ $t('common.date') }}</div>
          <div class="info-value">{{ formatDate(report.created_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="report.description" class="section-card">
      <h3>{{ $t('techOwnerReports.ownerDescription') }}</h3>
      <p class="section-text">{{ report.description }}</p>
    </div>

    <!-- Questions to Answer -->
    <div class="section-card" v-if="report.questions?.length">
      <h3>
        <font-awesome-icon icon="fa-solid fa-circle-question" />
        {{ $t('techOwnerReports.questionsToAnswer') }} ({{ answeredCount }}/{{ report.questions.length }})
      </h3>
      <p class="section-hint" v-if="report.status === 'pending_technician'">
        {{ $t('techOwnerReports.answerHint') }}
      </p>

      <div class="questions-list">
        <div v-for="(q, index) in report.questions" :key="q.id || index" class="question-card">
          <div class="question-header">
            <span class="q-number">Q{{ index + 1 }}</span>
            <div class="question-tags">
              <span class="q-type">{{ q.type }}</span>
              <span v-if="q.required" class="q-required">{{ $t('ownerReports.required') }}</span>
              <span v-if="q.answer" class="q-answered">
                <font-awesome-icon icon="fa-solid fa-check" /> {{ $t('techOwnerReports.answered') }}
              </span>
            </div>
          </div>
          <div class="q-text">{{ q.question }}</div>
          <div v-if="q.options" class="q-options">{{ $t('ownerReports.options') }}: {{ q.options.join(', ') }}</div>

          <div class="q-answer-section">
            <template v-if="report.status === 'pending_technician' && !q.answer">
              <input v-if="q.type === 'text' || q.type === 'number'" v-model="answers[q.id]" :type="q.type"
                class="answer-input" :placeholder="$t('techOwnerReports.typeAnswer')" />
              <textarea v-else-if="q.type === 'textarea'" v-model="answers[q.id]" class="answer-input" rows="3"
                :placeholder="$t('techOwnerReports.typeAnswer')"></textarea>
              <select v-else-if="q.type === 'select'" v-model="answers[q.id]" class="answer-input">
                <option value="">{{ $t('ownerReports.selectAnswer') }}</option>
                <option v-for="opt in q.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <label v-else-if="q.type === 'checkbox'" class="checkbox-label">
                <input type="checkbox" :checked="answers[q.id] === 'yes'" @change="answers[q.id] = $event.target.checked ? 'yes' : 'no'" />
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
    </div>

    <!-- No Questions -->
    <div class="section-card" v-if="!report.questions?.length">
      <div class="no-questions">
        <font-awesome-icon icon="fa-solid fa-circle-info" size="2x" />
        <p>{{ $t('techOwnerReports.noQuestions') }}</p>
      </div>
    </div>

    <!-- Submit Bar -->
    <div class="submit-bar" v-if="report.status === 'pending_technician' && report.questions?.length">
      <div class="submit-info">
        <font-awesome-icon icon="fa-solid fa-info-circle" />
        {{ $t('techOwnerReports.submitInfo') }}
      </div>
      <button class="btn-primary" @click="submitAnswers" :disabled="submitting || answeredCount === 0">
        <font-awesome-icon v-if="submitting" icon="fa-solid fa-spinner fa-spin" />
        <font-awesome-icon v-else icon="fa-solid fa-paper-plane" />
        {{ submitting ? $t('common.processing') : $t('techOwnerReports.submitAnswers') }}
      </button>
    </div>

    <!-- Submitted Banner -->
    <div class="submitted-banner" v-if="report.status === 'submitted'">
      <font-awesome-icon icon="fa-solid fa-check-circle" size="2x" />
      <div>
        <h3>{{ $t('techOwnerReports.alreadySubmitted') }}</h3>
        <p v-if="report.submitted_at">{{ $t('techOwnerReports.submittedOn') }} {{ formatDate(report.submitted_at) }}</p>
      </div>
    </div>
  </div>

  <div v-else class="loading-state">
    <font-awesome-icon icon="fa-solid fa-spinner" spin size="2x" />
    <p>{{ $t('common.loading') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import api from '@/composables/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const report = ref(null)
const answers = reactive({})
const submitting = ref(false)

const answeredCount = computed(() => {
  const answered = (report.value?.questions || []).filter(q => q.answer).length
  const newAnswers = Object.values(answers).filter(a => a).length
  return answered + newAnswers
})

function getStatusColor(status) {
  const map = { pending_technician:'#3b82f6', submitted:'#FFD93D', reviewed:'#a855f7', verified:'#6C63FF', completed:'#4ADE80', cancelled:'#ff6b6b' }
  return map[status] || 'rgba(255,255,255,0.35)'
}

function getStatusLabel(status) {
  const map = { pending_technician: t('techOwnerReports.statusPending'), submitted: t('techOwnerReports.statusSubmitted'), reviewed: t('techOwnerReports.statusReviewed'), verified: t('techOwnerReports.statusVerified'), completed: t('techOwnerReports.statusCompleted'), cancelled: t('techOwnerReports.statusCancelled') }
  return map[status] || status
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchReport() {
  loading.value = true
  try {
    const { data } = await api.get(`/technician/owner-reports/${route.params.id}`)
    report.value = data.data
  } catch (e) {
    console.error(e)
    router.push('/technician/owner-reports')
  } finally {
    loading.value = false
  }
}

async function submitAnswers() {
  submitting.value = true
  try {
    for (const [qId, answer] of Object.entries(answers)) {
      if (answer) {
        await api.post(`/technician/owner-reports/${report.value.id}/answer`, {
          question_id: parseInt(qId),
          answer,
        })
      }
    }
    await api.post(`/technician/owner-reports/${report.value.id}/submit`)
    await fetchReport()
  } catch (e) {
    console.error(e)
    alert(e.response?.data?.message || t('common.error'))
  } finally {
    submitting.value = false
  }
}

onMounted(fetchReport)
</script>

<style scoped>
.report-detail { padding: 0; max-width: 960px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.back-btn {
  background: none; border: none;
  color: rgba(255,255,255,0.4);
  cursor: pointer; font-size: 0.82rem;
  font-family: 'Space Grotesk', sans-serif;
  margin-bottom: 8px;
  display: flex; align-items: center; gap: 6px;
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
.header-actions { display: flex; gap: 8px; align-items: center; }
.status-badge { padding: 6px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 600; }

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
.info-value { font-weight: 600; color: #fff; font-size: 0.9rem; }

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
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-text { color: rgba(255,255,255,0.6); line-height: 1.6; white-space: pre-wrap; }
.section-hint { font-size: 0.82rem; color: rgba(255,255,255,0.35); margin: -8px 0 16px; }

.questions-list { display: flex; flex-direction: column; gap: 16px; }
.question-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 18px;
}
.question-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.q-number { font-family: 'Syne', sans-serif; font-weight: 700; color: #00E5FF; font-size: 0.9rem; }
.question-tags { display: flex; gap: 8px; align-items: center; }
.q-type { font-size: 0.7rem; background: rgba(0,229,255,0.1); color: #00E5FF; padding: 2px 8px; border-radius: 10px; }
.q-required { font-size: 0.7rem; color: #ff6b6b; font-weight: 600; }
.q-answered { font-size: 0.7rem; color: #4ADE80; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.q-text { font-weight: 500; color: rgba(255,255,255,0.85); margin-bottom: 6px; }
.q-options { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 10px; }

.q-answer-section { margin-top: 10px; }
.answer-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
}
.answer-input:focus { border-color: rgba(0,229,255,0.3); }
.answer-input::placeholder { color: rgba(255,255,255,0.25); }
.answer-value { font-weight: 500; color: #4ADE80; font-size: 0.95rem; }
.answer-time { font-size: 0.75rem; color: rgba(255,255,255,0.25); margin-top: 2px; }
.answer-empty { color: rgba(255,255,255,0.3); font-style: italic; font-size: 0.85rem; }
.checkbox-label { display: flex; align-items: center; gap: 6px; cursor: pointer; color: rgba(255,255,255,0.7); }

.no-questions { text-align: center; padding: 40px; color: rgba(255,255,255,0.3); }
.no-questions p { margin-top: 12px; }

.submit-bar {
  background: rgba(0,229,255,0.04);
  border: 1px solid rgba(0,229,255,0.15);
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.submit-info { font-size: 0.85rem; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 8px; }

.submitted-banner {
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
.submitted-banner h3 { font-family: 'Syne', sans-serif; margin: 0; color: #4ADE80; }
.submitted-banner p { margin: 4px 0 0; color: rgba(255,255,255,0.5); font-size: 0.85rem; }

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
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.loading-state {
  text-align: center;
  padding: 60px;
  color: rgba(255,255,255,0.3);
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .submit-bar { flex-direction: column; gap: 12px; text-align: center; }
}
</style>
