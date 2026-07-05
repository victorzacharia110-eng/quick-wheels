<script setup>
import { onMounted } from "vue";
import { useI18n } from 'vue-i18n'
import VehicleCard3D from "../components/common/VehicleCard3D.vue";
import { useVehicleStore } from '@/stores/vehicles'
import { storeToRefs } from 'pinia'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const store = useVehicleStore()
const { vehicles, categories, isLoading, error, activeCategory, filteredVehicles } = storeToRefs(store)
const { getCategoryIcon, setCategory } = store

function translateCategory(cat) {
  const key = 'status.' + cat.toLowerCase().replace(/\s+/g, '_')
  const translated = t(key)
  return translated !== key ? translated : cat
}

onMounted(() => {
  store.fetchPublicVehicles()
})
</script>

<template>
  <div class="vehicles-page">
    <div class="page-header">
      <div class="page-header-inner">
        <p class="section-label">{{ $t('home.ourFleet') }}</p>
        <h1 class="page-title">{{ $t('vehicle.findPerfectRide') }}</h1>
        <p class="page-sub">{{ $t('vehicle.pageSub') }}</p>

        <div v-if="isLoading" class="loading-filters">
          <span class="spinner-sm"></span> {{ $t('vehicle.loadingVehicles') }}
        </div>

        <div v-else class="filters">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['filter-btn', { active: activeCategory === cat }]"
            @click="setCategory(cat)"
          >
            <font-awesome-icon v-if="cat !== 'All'" :icon="getCategoryIcon(cat)" size="xs" />
            {{ cat === 'All' ? $t('common.all') : translateCategory(cat) }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
      {{ error }}
    </div>

    <SkeletonLoader v-if="isLoading" variant="card" :rows="2" :cols="3" />

    <div v-else class="vehicles-grid-wrap">
      <TransitionGroup v-if="filteredVehicles.length > 0" name="cards" tag="div" class="vehicles-grid">
        <VehicleCard3D v-for="vehicle in filteredVehicles" :key="vehicle.id" :vehicle="vehicle" />
      </TransitionGroup>

      <div v-else class="empty-state">
        <font-awesome-icon icon="fa-solid fa-car" size="3x" />
        <h3>{{ $t('vehicle.noVehiclesFound') }}</h3>
        <p>{{ $t('vehicle.noVehiclesInCategory', { category: activeCategory }) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vehicles-page { min-height: 100vh; position: relative; z-index: 1; }
.page-header {
  padding: 140px 32px 80px;
  text-align: center;
  position: relative;
}
.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(0,196,212,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.page-header-inner { position: relative; z-index: 1; }
.section-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #00c4d4;
  font-weight: 600;
}
.page-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 800;
  margin: 12px 0 16px;
  color: #fff;
}
.gradient-text {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.page-sub { color: rgba(255,255,255,0.55); margin-bottom: 40px; line-height: 1.7; }

.loading-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
}
.spinner-sm {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(0,196,212,0.2);
  border-top-color: #00c4d4;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.filters {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 8px 20px;
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: rgba(255,255,255,0.55);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  font-family: "Space Grotesk", sans-serif;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-btn:hover { border-color: rgba(0,229,255,0.4); color: #fff; }
.filter-btn.active {
  background: linear-gradient(90deg, #00c4d4, #00e5ff);
  color: #0a0818;
  border-color: transparent;
  font-weight: 700;
}
.filter-btn.active svg { color: #0a0818; }

.vehicles-grid-wrap { padding: 0 32px 100px; }
.vehicles-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.cards-enter-active, .cards-leave-active { transition: all 0.4s ease; }
.cards-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.cards-leave-to { opacity: 0; transform: scale(0.9); }

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: rgba(255,255,255,0.3);
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }
.empty-state p { margin-bottom: 24px; }

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 0 32px 16px;
  background: rgba(255,0,0,0.08);
  border: 1px solid rgba(255,0,0,0.2);
  border-radius: 10px;
  color: #ff6b6b;
  font-size: 0.9rem;
}
.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.2rem;
  cursor: pointer;
}

@media (max-width: 1024px) { .vehicles-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .vehicles-grid-wrap { padding: 0 16px 60px; }
  .page-header { padding: 100px 16px 50px; }
  .error-banner { margin: 0 16px 16px; }
}
@media (max-width: 640px) {
  .vehicles-grid { grid-template-columns: 1fr; }
  .filters { gap: 6px; }
  .filter-btn { padding: 6px 14px; font-size: 0.75rem; }
}
</style>
