<template>
  <div class="business-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <font-awesome-icon icon="fa-solid fa-spinner" spin size="3x" />
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="notFound" class="not-found">
      <font-awesome-icon icon="fa-solid fa-store" size="4x" />
      <h2>{{ $t('home.businessNotFound') }}</h2>
      <p>{{ $t('home.businessNotFoundDesc') }}</p>
      <RouterLink to="/" class="btn-primary">{{ $t('home.backToHome') }}</RouterLink>
    </div>

    <!-- Business Page -->
    <template v-else-if="business">
      <!-- Hero Section -->
      <section class="biz-hero">
        <div class="biz-hero-bg"></div>
        <div class="biz-hero-content">
          <div class="biz-badge">
            <font-awesome-icon icon="fa-solid fa-shield-halved" />
            {{ $t('home.verifiedBusiness') }}
          </div>
          <h1 class="biz-name">{{ business.business_name }}</h1>
          <p class="biz-tagline">{{ business.business_description || $t('home.defaultTagline') }}</p>
          <div class="biz-stats">
            <div class="biz-stat">
              <font-awesome-icon icon="fa-solid fa-car" />
              <span><strong>{{ vehicles.length }}</strong> {{ $t('home.vehiclesAvailable') }}</span>
            </div>
            <div class="biz-stat" v-if="business.business_phone">
              <font-awesome-icon icon="fa-solid fa-phone" />
              <span>{{ business.business_phone }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Vehicles Section -->
      <section class="biz-vehicles">
        <div class="section-container">
          <div class="section-header">
            <p class="section-label">{{ $t('home.ourFleet') }}</p>
            <h2 class="section-title">{{ $t('home.availableVehicles') }}</h2>
          </div>

          <div v-if="vehiclesLoading" class="vehicles-loading">
            <SkeletonLoader variant="card" :rows="3" :cols="3" />
          </div>

          <div v-else-if="vehicles.length === 0" class="empty-state">
            <font-awesome-icon icon="fa-solid fa-car" size="3x" />
            <h3>{{ $t('home.noVehiclesAvailable') }}</h3>
            <p>{{ $t('home.noVehiclesDesc') }}</p>
          </div>

          <div v-else class="vehicles-grid">
            <VehicleCard3D v-for="vehicle in vehicles" :key="vehicle.id" :vehicle="vehicle" />
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="biz-about" v-if="business.business_description">
        <div class="section-container">
          <div class="about-grid">
            <div class="about-text">
              <p class="section-label">{{ $t('home.aboutBusiness') }}</p>
              <h2>{{ business.business_name }}</h2>
              <p>{{ business.business_description }}</p>
              <div class="about-details">
                <div v-if="business.business_address" class="detail-item">
                  <font-awesome-icon icon="fa-solid fa-location-dot" />
                  <span>{{ business.business_address }}</span>
                </div>
                <div v-if="business.business_email" class="detail-item">
                  <font-awesome-icon icon="fa-solid fa-envelope" />
                  <span>{{ business.business_email }}</span>
                </div>
                <div v-if="business.business_phone" class="detail-item">
                  <font-awesome-icon icon="fa-solid fa-phone" />
                  <span>{{ business.business_phone }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="biz-cta">
        <div class="section-container">
          <div class="cta-card glass-card">
            <h2>{{ $t('home.interestedInFleet') }}</h2>
            <p>{{ $t('home.contactBusiness') }}</p>
            <a v-if="business.business_phone" :href="'tel:' + business.business_phone" class="btn-primary">
              <font-awesome-icon icon="fa-solid fa-phone" /> {{ $t('home.callNow') }}
            </a>
            <a v-if="business.business_email" :href="'mailto:' + business.business_email" class="btn-outline" style="margin-left: 12px;">
              <font-awesome-icon icon="fa-solid fa-envelope" /> {{ $t('home.sendEmail') }}
            </a>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/composables/api'
import VehicleCard3D from '@/components/common/VehicleCard3D.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const route = useRoute()

const business = ref(null)
const vehicles = ref([])
const loading = ref(true)
const vehiclesLoading = ref(true)
const notFound = ref(false)

async function loadBusiness(slug) {
  loading.value = true
  notFound.value = false
  try {
    const res = await api.get(`/public/business/${slug}`)
    if (res.data.success) {
      business.value = res.data.data
      loadVehicles(slug)
    } else {
      notFound.value = true
    }
  } catch (err) {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function loadVehicles(slug) {
  vehiclesLoading.value = true
  try {
    const res = await api.get(`/public/business/${slug}/vehicles`)
    if (res.data.success) {
      vehicles.value = (res.data.data || []).filter(v => v.owner_id != null)
    }
  } catch (err) {
    console.error('Failed to load vehicles:', err)
  } finally {
    vehiclesLoading.value = false
  }
}

onMounted(() => loadBusiness(route.params.slug))
watch(() => route.params.slug, (slug) => { if (slug) loadBusiness(slug) })
</script>

<style scoped>
.business-page { padding: 0; min-height: 100vh; }

/* Loading & Not Found */
.loading-state, .not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: rgba(255,255,255,0.4); gap: 16px; text-align: center; padding: 40px; }
.not-found h2 { color: #fff; font-family: 'Syne', sans-serif; }
.not-found p { color: rgba(255,255,255,0.4); margin-bottom: 20px; }

/* Hero */
.biz-hero { position: relative; padding: 120px 32px 80px; text-align: center; overflow: hidden; }
.biz-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,229,255,0.08) 0%, transparent 70%); }
.biz-hero-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
.biz-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.2); border-radius: 20px; color: #4ADE80; font-size: 0.8rem; font-weight: 600; margin-bottom: 20px; }
.biz-name { font-family: 'Syne', sans-serif; font-size: 2.8rem; font-weight: 800; color: #fff; margin-bottom: 12px; line-height: 1.1; }
.biz-tagline { color: rgba(255,255,255,0.5); font-size: 1.1rem; line-height: 1.6; margin-bottom: 28px; }
.biz-stats { display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; }
.biz-stat { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 0.95rem; }
.biz-stat svg { color: #00E5FF; }
.biz-stat strong { color: #fff; }

/* Sections */
.section-container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-header { text-align: center; margin-bottom: 48px; }
.section-label { color: #00E5FF; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
.section-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; }

/* Vehicles */
.biz-vehicles { padding: 80px 0; }
.vehicles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.vehicles-loading { padding: 40px 0; }

/* About */
.biz-about { padding: 80px 0; background: rgba(255,255,255,0.02); }
.about-grid { max-width: 800px; margin: 0 auto; }
.about-text h2 { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin: 8px 0 16px; }
.about-text p { color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 20px; }
.about-details { display: flex; flex-direction: column; gap: 12px; }
.detail-item { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); font-size: 0.9rem; }
.detail-item svg { color: #00E5FF; width: 16px; }

/* CTA */
.biz-cta { padding: 80px 0; }
.cta-card { text-align: center; padding: 60px 40px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
.cta-card h2 { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin-bottom: 12px; }
.cta-card p { color: rgba(255,255,255,0.5); margin-bottom: 28px; }

/* Buttons */
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 30px; background: linear-gradient(135deg, #00C4D4, #00E5FF); color: #0a0818; font-weight: 700; font-size: 0.9rem; text-decoration: none; cursor: pointer; border: none; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,229,255,0.35); }
.btn-outline { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 30px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); font-weight: 600; font-size: 0.9rem; text-decoration: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
.btn-outline:hover { background: rgba(255,255,255,0.05); color: #fff; }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); }
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

@media (max-width: 1024px) { .vehicles-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .biz-name { font-size: 2rem; }
  .vehicles-grid { grid-template-columns: 1fr; }
  .biz-hero { padding: 100px 20px 60px; }
  .section-container { padding: 0 16px; }
}
</style>
