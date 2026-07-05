<template>
  <div class="gps-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('gps.title') }}</h1>
        <p class="page-sub">{{ $t('gps.subtitle') }}</p>
      </div>
      <button class="btn-primary" @click="refreshData">
        <font-awesome-icon icon="fa-solid fa-rotate" :class="{ spinning: refreshing }" />
        {{ $t('gps.refresh') }}
      </button>
    </div>

    <SkeletonLoader v-if="loading" variant="list" :rows="10" :cols="1" />

    <template v-else>
      <div class="map-container">
        <div class="map-header">
          <div class="map-header-left">
            <font-awesome-icon icon="fa-solid fa-satellite-dish" class="map-header-icon" />
            <span>{{ vehicles.filter(v => v.latitude).length }} / {{ vehicles.length }} {{ $t('gps.online') }}</span>
          </div>
          <div class="map-header-right">
            <span class="map-update-badge">{{ $t('gps.updatesEvery') }}</span>
          </div>
        </div>

        <div class="map-wrapper" ref="mapRef">
          <iframe
            class="google-map"
            :src="mapIframeUrl"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      <div class="vehicles-tracked">
        <div class="vehicles-tracked-header">
          <h3 class="section-title">{{ $t('gps.vehicleLocations') }}</h3>
          <span class="vehicle-count">{{ vehicles.length }} {{ $t('gps.total') }}</span>
        </div>

        <div v-if="vehicles.length === 0" class="empty-gps">
          <font-awesome-icon icon="fa-solid fa-satellite-dish" class="empty-icon" />
          <p>{{ $t('gps.noData') }}</p>
        </div>

        <TransitionGroup name="list" tag="div" class="track-list">
          <div v-for="v in vehicles" :key="v.id" class="track-card" @click="centerMap(v)">
            <div class="track-left">
              <div class="track-avatar" :class="{ active: v.latitude }">
                <font-awesome-icon icon="fa-solid fa-car-side" />
              </div>
              <div class="track-info">
                <strong class="track-name">{{ v.vehicle_name || 'Vehicle #'+v.vehicle_id }}</strong>
                <span class="track-coords" v-if="v.latitude">
                  {{ v.latitude.toFixed(4) }}, {{ v.longitude.toFixed(4) }}
                  <span class="track-speed" v-if="v.speed"> · {{ v.speed }} km/h</span>
                </span>
                <span class="track-coords no-signal" v-else>{{ $t('gps.noSignal') }}</span>
              </div>
            </div>
            <div class="track-right">
              <span class="track-time" v-if="v.recorded_at">{{ formatTime(v.recorded_at) }}</span>
              <span v-if="v.latitude" class="track-dot"></span>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const vehicles = ref([])
const loading = ref(true)
const refreshing = ref(false)
const mapRef = ref(null)

let interval

const DEFAULT_LOCATION = '-6.9139299,39.1565626'

const mapIframeUrl = computed(() => {
  const withCoords = vehicles.value.filter(v => v.latitude && v.longitude)
  if (withCoords.length === 0) {
    return `https://maps.google.com/maps?q=${DEFAULT_LOCATION}&z=17&output=embed`
  }
  const v = withCoords[0]
  return `https://maps.google.com/maps?q=${v.latitude},${v.longitude}&z=17&output=embed`
})

async function centerMap(v) {
  if (!v.latitude) return
  alert(`${v.vehicle_name}\nLat: ${v.latitude}\nLng: ${v.longitude}\nSpeed: ${v.speed || 0} ${t('gps.kmh')}`)
}

async function fetchLocations() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/owner/gps/all-latest`, {
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' }
    })
    const json = await res.json()
    if (json.success) vehicles.value = json.data
  } catch (_) {} finally { loading.value = false; refreshing.value = false }
}

async function refreshData() {
  refreshing.value = true
  await fetchLocations()
}

function formatTime(t) {
  return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchLocations()
  interval = setInterval(fetchLocations, 30000)
})

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.gps-page { }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }
.spinning { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.map-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
.map-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.map-header-left { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.5); font-size: 0.85rem; }
.map-header-icon { color: #4ade80; }
.map-update-badge { font-size: 0.72rem; color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); padding: 4px 10px; border-radius: 20px; }
.map-wrapper { width: 100%; aspect-ratio: 16/7; position: relative; overflow: hidden; }
.google-map { width: 100%; height: 100%; border: 0; }

.vehicles-tracked { margin-top: 8px; }
.vehicles-tracked-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.section-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.7); margin: 0; }
.vehicle-count { font-size: 0.78rem; color: rgba(255,255,255,0.3); }

.empty-gps { display: flex; flex-direction: column; align-items: center; padding: 40px; color: rgba(255,255,255,0.3); text-align: center; }
.empty-icon { font-size: 2rem; margin-bottom: 8px; }

.track-list { display: flex; flex-direction: column; gap: 6px; }
.track-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.2s; }
.track-card:hover { border-color: rgba(0,229,255,0.2); background: rgba(0,229,255,0.03); }
.track-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.track-avatar { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); flex-shrink: 0; transition: all 0.3s; }
.track-avatar.active { background: rgba(0,229,255,0.1); color: #00e5ff; box-shadow: 0 0 12px rgba(0,229,255,0.1); }
.track-info { display: flex; flex-direction: column; min-width: 0; }
.track-name { font-size: 0.85rem; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.track-coords { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
.track-coords.no-signal { color: rgba(255,255,255,0.2); }
.track-speed { color: #4ade80; }
.track-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.track-time { font-size: 0.7rem; color: rgba(255,255,255,0.25); }
.track-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 2s ease infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from { opacity: 0; transform: translateX(-16px); }
.list-leave-to { opacity: 0; transform: translateX(16px); }
.list-move { transition: transform 0.3s ease; }

@media (max-width: 768px) {
  .map-wrapper { aspect-ratio: 16/9; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
