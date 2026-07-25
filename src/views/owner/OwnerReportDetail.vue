<template>
  <div class="report-detail-page">
    <button class="back-btn" @click="$router.back()">
      <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('common.back') }}
    </button>

    <SkeletonLoader v-if="loading" variant="detail" :rows="6" />

    <template v-else-if="report">
      <div class="report-header">
        <div>
          <h1 class="report-title">{{ report.title }}</h1>
          <p class="report-number">{{ report.report_number }}</p>
        </div>
        <span class="status-badge" :style="{ background: report.status_color + '22', color: report.status_color }">
          {{ report.status_label }}
        </span>
      </div>

      <!-- Workflow Progress Bar -->
      <div class="workflow-bar">
        <div v-for="(step, i) in workflowSteps" :key="i" class="wf-step" :class="{ active: report.workflow_step >= i + 1, current: report.workflow_step === i + 1 }">
          <div class="wf-dot">
            <font-awesome-icon v-if="report.workflow_step > i + 1" icon="fa-solid fa-check" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="wf-label">{{ step }}</span>
        </div>
        <div class="wf-line">
          <div class="wf-fill" :style="{ width: ((report.workflow_step - 1) / (workflowSteps.length - 1) * 100) + '%' }"></div>
        </div>
      </div>

      <!-- Report Info Grid -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">{{ $t('maintenance.vehicle') }}</div>
          <div class="info-value">{{ report.vehicle_name }} <span class="info-sub">{{ report.vehicle_type }}</span></div>
          <div v-if="report.vehicle_color" class="info-sub">{{ report.vehicle_color }} · {{ report.vehicle_chassis_number }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">{{ $t('maintenance.technician') }}</div>
          <div class="info-value">{{ report.employee_name }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">{{ $t('common.priority') }}</div>
          <div class="info-value" :style="{ color: report.priority_color }">{{ report.priority_label }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">{{ $t('maintenance.estimatedCost') }}</div>
          <div class="info-value">TZS {{ Number(report.estimated_cost).toLocaleString() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">{{ $t('maintenance.actualCost') }}</div>
          <div class="info-value">TZS {{ Number(report.actual_cost).toLocaleString() }}</div>
        </div>
        <div class="info-card">
          <div class="info-label">{{ $t('maintenance.mileage') }}</div>
          <div class="info-value">{{ report.vehicle_mileage ? report.vehicle_mileage + ' km' : '—' }}</div>
        </div>
      </div>

      <!-- Description & Issues -->
      <div v-if="report.description || report.diagnosed_issues" class="section-card">
        <h3 v-if="report.description">{{ $t('common.description') }}</h3>
        <p v-if="report.description" class="desc-text">{{ report.description }}</p>
        <h3 v-if="report.diagnosed_issues">{{ $t('maintenance.diagnosedIssues') }}</h3>
        <p v-if="report.diagnosed_issues" class="desc-text">{{ report.diagnosed_issues }}</p>
      </div>

      <!-- Items -->
      <div v-if="report.items && report.items.length" class="section-card">
        <h3>{{ $t('maintenance.items') }} ({{ report.items.length }})</h3>
        <div class="items-list">
          <div v-for="item in report.items" :key="item.id" class="item-row">
            <span class="item-type" :class="item.type">{{ item.type }}</span>
            <span class="item-name">{{ item.name }}</span>
            <span class="item-cost">TZS {{ Number(item.cost).toLocaleString() }} × {{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div class="signatures-row">
        <div v-if="report.technician_signature" class="sig-card">
          <div class="sig-label">{{ $t('maintenance.technicianSignature') }}</div>
          <div class="sig-box"><img :src="report.technician_signature" alt="Tech signature" /></div>
          <div class="sig-date">{{ formatDate(report.technician_signed_at) }}</div>
        </div>
        <div v-if="report.owner_signature" class="sig-card">
          <div class="sig-label">{{ $t('maintenance.ownerSignature') }}</div>
          <div class="sig-box"><img :src="report.owner_signature" alt="Owner signature" /></div>
          <div class="sig-date">{{ formatDate(report.owner_signed_at) }}</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar" v-if="report.status !== 'completed' && report.status !== 'cancelled'">
        <button v-if="canConfirm" class="btn-primary" @click="doConfirm" :disabled="acting">
          <font-awesome-icon icon="fa-solid fa-check" /> {{ $t('maintenance.confirmService') }}
        </button>
        <button v-if="canVerify" class="btn-verify" @click="showSignModal = true" :disabled="acting">
          <font-awesome-icon icon="fa-solid fa-pen-to-square" /> {{ $t('maintenance.verifyAndSign') }}
        </button>
      </div>

      <!-- Animated Sending Overlay -->
      <Transition name="modal">
        <div v-if="report.status === 'verified' && !report.completed_at" class="sending-overlay">
          <div class="sending-box">
            <div class="sending-animation">
              <div class="sending-plane">
                <font-awesome-icon icon="fa-solid fa-paper-plane" />
              </div>
              <div class="sending-trail"></div>
            </div>
            <h3>{{ $t('maintenance.sendingToTechnician') }}</h3>
            <p>{{ $t('maintenance.sendingDesc') }}</p>
            <div class="sending-progress">
              <div class="sending-bar"><div class="sending-fill" :style="{ width: sendingProgress + '%' }"></div></div>
              <span>{{ Math.round(sendingProgress) }}%</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Completed Banner -->
      <div v-if="report.status === 'completed'" class="completed-banner">
        <font-awesome-icon icon="fa-solid fa-circle-check" />
        <span>{{ $t('maintenance.reportCompleted') }}</span>
      </div>

      <!-- Sign Modal -->
      <Transition name="modal">
        <div v-if="showSignModal" class="modal-overlay" @click.self="showSignModal = false">
          <div class="modal-box">
            <div class="modal-header">
              <h3>{{ $t('maintenance.verifyAndSign') }}</h3>
              <button class="modal-close" @click="showSignModal = false"><font-awesome-icon icon="fa-solid fa-times" /></button>
            </div>
            <p class="sign-desc">{{ $t('maintenance.signDesc') }}</p>
            <div class="canvas-wrap">
              <canvas ref="signCanvas" class="sign-canvas" width="450" height="200"></canvas>
              <button class="btn-clear" @click="clearCanvas">{{ $t('common.cancel') }} {{ $t('common.clear') }}</button>
            </div>
            <div class="modal-actions">
              <button class="btn-outline" @click="showSignModal = false">{{ $t('common.cancel') }}</button>
              <button class="btn-verify" @click="doVerify" :disabled="acting || !hasSignature">
                <font-awesome-icon icon="fa-solid fa-pen-to-square" /> {{ $t('maintenance.verifyAndSign') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const report = ref(null)
const loading = ref(true)
const acting = ref(false)
const showSignModal = ref(false)
const signCanvas = ref(null)
const hasSignature = ref(false)
const sendingProgress = ref(0)
let sendingInterval = null

const workflowSteps = computed(() => [
  t('maintenance.wfSubmitted'),
  t('maintenance.wfViewed'),
  t('maintenance.wfProcessing'),
  t('maintenance.wfConfirmed'),
  t('maintenance.wfVerified'),
  t('maintenance.wfCompleted'),
])

const canConfirm = computed(() => report.value && ['viewed', 'processing'].includes(report.value.status))
const canVerify = computed(() => report.value && report.value.status === 'confirmed')

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchReport() {
  loading.value = true
  try {
    const res = await api.get(`/owner/maintenance/${route.params.id}`)
    if (res.data.success) {
      report.value = res.data.data
      if (report.value.status === 'verified' && !report.value.completed_at) {
        startSendingAnimation()
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function doConfirm() {
  acting.value = true
  try {
    const res = await api.post(`/owner/maintenance/${report.value.id}/confirm`)
    if (res.data.success) report.value = res.data.data
  } catch (err) {
    alert(err.response?.data?.message || err.message)
  } finally {
    acting.value = false
  }
}

async function doVerify() {
  if (!hasSignature.value) return
  acting.value = true
  try {
    const sigData = signCanvas.value.toDataURL('image/png')
    const res = await api.post(`/owner/maintenance/${report.value.id}/verify`, { owner_signature: sigData })
    if (res.data.success) {
      report.value = res.data.data
      showSignModal.value = false
      startSendingAnimation()
    }
  } catch (err) {
    alert(err.response?.data?.message || err.message)
  } finally {
    acting.value = false
  }
}

function startSendingAnimation() {
  sendingProgress.value = 0
  const duration = 120000
  const interval = 50
  const step = (interval / duration) * 100
  sendingInterval = setInterval(() => {
    sendingProgress.value = Math.min(100, sendingProgress.value + step)
    if (sendingProgress.value >= 100) {
      clearInterval(sendingInterval)
      fetchReport()
    }
  }, interval)
}

// Canvas drawing
let isDrawing = false
let ctx = null

function setupCanvas() {
  if (!signCanvas.value) return
  ctx = signCanvas.value.getContext('2d')
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  const getPos = (e) => {
    const rect = signCanvas.value.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => { e.preventDefault(); isDrawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
  const draw = (e) => { if (!isDrawing) return; e.preventDefault(); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); hasSignature.value = true }
  const stopDraw = () => { isDrawing = false }

  signCanvas.value.addEventListener('mousedown', startDraw)
  signCanvas.value.addEventListener('mousemove', draw)
  signCanvas.value.addEventListener('mouseup', stopDraw)
  signCanvas.value.addEventListener('mouseleave', stopDraw)
  signCanvas.value.addEventListener('touchstart', startDraw, { passive: false })
  signCanvas.value.addEventListener('touchmove', draw, { passive: false })
  signCanvas.value.addEventListener('touchend', stopDraw)
}

function clearCanvas() {
  if (!ctx || !signCanvas.value) return
  ctx.clearRect(0, 0, signCanvas.value.width, signCanvas.value.height)
  hasSignature.value = false
}

watch(showSignModal, async (v) => {
  if (v) {
    await nextTick()
    setupCanvas()
    clearCanvas()
  }
})

onMounted(() => fetchReport())
onUnmounted(() => { if (sendingInterval) clearInterval(sendingInterval) })
</script>

<style scoped>
.report-detail-page { padding: 0; }
.back-btn { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.9rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.back-btn:hover { color: #fff; }

.report-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.report-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.report-number { color: rgba(255,255,255,0.4); font-size: 0.9rem; }
.status-badge { display: inline-block; padding: 4px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }

/* Workflow Bar */
.workflow-bar { position: relative; display: flex; justify-content: space-between; margin: 0 auto 32px; max-width: 600px; padding-top: 16px; }
.wf-step { display: flex; flex-direction: column; align-items: center; z-index: 2; flex: 1; }
.wf-dot { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: rgba(255,255,255,0.3); font-weight: 700; transition: all 0.3s; }
.wf-step.active .wf-dot { background: rgba(0,229,255,0.15); border-color: #00E5FF; color: #00E5FF; }
.wf-step.current .wf-dot { background: #00E5FF; color: #0a0818; box-shadow: 0 0 16px rgba(0,229,255,0.4); animation: pulse-dot 2s infinite; }
.wf-label { font-size: 0.65rem; color: rgba(255,255,255,0.3); margin-top: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
.wf-step.active .wf-label { color: rgba(255,255,255,0.6); }
.wf-line { position: absolute; top: 32px; left: 5%; right: 5%; height: 2px; background: rgba(255,255,255,0.06); z-index: 1; }
.wf-fill { height: 100%; background: linear-gradient(90deg, #00E5FF, #4ADE80); transition: width 0.5s ease; border-radius: 1px; }

@keyframes pulse-dot { 0%, 100% { box-shadow: 0 0 16px rgba(0,229,255,0.4); } 50% { box-shadow: 0 0 28px rgba(0,229,255,0.7); } }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
.info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
.info-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.info-value { font-size: 1rem; color: #fff; font-weight: 600; }
.info-sub { font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 400; }

/* Section Card */
.section-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.section-card h3 { color: #fff; font-size: 1rem; font-weight: 600; margin-bottom: 12px; }
.desc-text { color: rgba(255,255,255,0.6); line-height: 1.6; }

.items-list { display: flex; flex-direction: column; gap: 8px; }
.item-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.item-type { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; }
.item-type.part { background: rgba(0,229,255,0.15); color: #00E5FF; }
.item-type.service { background: rgba(74,222,128,0.15); color: #4ADE80; }
.item-name { flex: 1; color: rgba(255,255,255,0.7); font-size: 0.9rem; }
.item-cost { color: rgba(255,255,255,0.5); font-size: 0.85rem; }

/* Signatures */
.signatures-row { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
.sig-card { flex: 1; min-width: 200px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; text-align: center; }
.sig-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 8px; }
.sig-box { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; min-height: 80px; display: flex; align-items: center; justify-content: center; }
.sig-box img { max-width: 100%; max-height: 80px; object-fit: contain; }
.sig-date { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 8px; }

/* Actions */
.action-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.btn-primary, .btn-verify { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; border: none; cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
.btn-primary { background: linear-gradient(90deg, #00C4D4, #00E5FF); color: #0a0818; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,229,255,0.35); }
.btn-verify { background: linear-gradient(90deg, #34d399, #4ADE80); color: #0a0818; }
.btn-verify:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(74,222,128,0.35); }
.btn-primary:disabled, .btn-verify:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* Completed Banner */
.completed-banner { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 20px; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); border-radius: 12px; color: #4ADE80; font-weight: 700; font-size: 1.1rem; margin-bottom: 24px; }

/* Sending Overlay */
.sending-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; }
.sending-box { text-align: center; color: #fff; }
.sending-box h3 { font-family: 'Syne', sans-serif; font-size: 1.4rem; margin: 20px 0 8px; }
.sending-box p { color: rgba(255,255,255,0.5); margin-bottom: 24px; }
.sending-animation { position: relative; width: 200px; height: 100px; margin: 0 auto; }
.sending-plane { position: absolute; left: 0; top: 50%; transform: translateY(-50%); font-size: 2rem; color: #00E5FF; animation: fly-plane 3s ease-in-out infinite; }
.sending-trail { position: absolute; left: 30px; top: 50%; width: 0; height: 2px; background: linear-gradient(90deg, #00E5FF, transparent); animation: fly-trail 3s ease-in-out infinite; }
@keyframes fly-plane { 0%, 100% { left: 0; } 50% { left: 140px; } }
@keyframes fly-trail { 0%, 100% { width: 0; left: 30px; } 50% { width: 120px; left: 20px; } }

.sending-progress { display: flex; align-items: center; gap: 12px; max-width: 300px; margin: 0 auto; }
.sending-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.sending-fill { height: 100%; background: linear-gradient(90deg, #00E5FF, #4ADE80); border-radius: 3px; transition: width 0.1s linear; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-box { background: #13102a; border: 1px solid rgba(0,229,255,0.15); border-radius: 16px; padding: 30px; width: 100%; max-width: 540px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { color: #fff; font-family: 'Syne', sans-serif; font-size: 1.2rem; }
.modal-close { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: rgba(255,255,255,0.6); cursor: pointer; padding: 6px 10px; }
.modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
.sign-desc { color: rgba(255,255,255,0.5); margin-bottom: 16px; font-size: 0.9rem; }
.canvas-wrap { margin-bottom: 16px; }
.sign-canvas { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: crosshair; }
.btn-clear { margin-top: 8px; background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 0.8rem; }
.btn-clear:hover { color: #ff6b6b; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
.btn-outline { padding: 10px 22px; border-radius: 30px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.6); font-weight: 600; font-size: 0.85rem; cursor: pointer; font-family: 'Space Grotesk', sans-serif; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 768px) { .info-grid { grid-template-columns: 1fr 1fr; } .signatures-row { flex-direction: column; } }
@media (max-width: 480px) { .info-grid { grid-template-columns: 1fr; } }
</style>
