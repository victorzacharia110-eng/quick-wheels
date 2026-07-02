<script setup>
import { ref, onMounted, computed } from 'vue'
import Hero3D from '../components/common/Hero3D.vue'
import SkillsOrbit from '../components/common/SkillsOrbit.vue'
import VehicleCard3D from '../components/owner/VehicleCard3D.vue'
import { useVehicleStore } from '@/stores/vehicles'
import { storeToRefs } from 'pinia'

const store = useVehicleStore()
const { vehicles, isLoading, error, availableVehicles } = storeToRefs(store)

const activeService = ref(null)

const stats = [
  { value: '50+', label: 'Vehicles Available', icon: 'fa-solid fa-car' },
  { value: '8+', label: 'Years Experience', icon: 'fa-solid fa-clock' },
  { value: '100+', label: 'Happy Drivers', icon: 'fa-solid fa-users' },
  { value: '99%', label: 'Uptime SLA', icon: 'fa-solid fa-star' },
]

const marquee = [
  'Motorcycles', 'Bajajis', 'Cars', 'SUVs', 'Luxury Vehicles',
  'Hire Purchase', 'Daily Rentals', 'Weekly Rentals', 'Delivery Services',
]

const services = [
  {
    icon: 'fa-solid fa-motorcycle',
    title: 'Motorcycle Hire Purchase',
    desc: 'Get your own motorcycle through our flexible hire purchase program. Own it after completing payments.',
    features: ['Daily/Weekly Payments', 'Ownership After Completion', 'Maintenance Included'],
  },
  {
    icon: 'fa-solid fa-truck-front',
    title: 'Bajaji Hire Purchase',
    desc: 'Start your delivery business with our Bajaji hire purchase. Perfect for urban transport and deliveries.',
    features: ['Flexible Payment Plans', 'Ownership After Completion', 'Insurance Covered'],
  },
  {
    icon: 'fa-solid fa-car',
    title: 'Car Rentals',
    desc: 'Wide range of cars from economy to luxury. Self-drive or with professional drivers.',
    features: ['Daily & Weekly Rentals', 'Full Insurance', '24/7 Support'],
  },
  {
    icon: 'fa-solid fa-route',
    title: 'Fleet Management',
    desc: 'Complete fleet management solutions for businesses with multiple vehicles.',
    features: ['Maintenance Tracking', 'Fuel Management', 'Driver Management'],
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Insurance Coverage',
    desc: 'Comprehensive insurance coverage for all vehicles. Drive with peace of mind.',
    features: ['Third Party', 'Comprehensive', 'Accidental Coverage'],
  },
  {
    icon: 'fa-solid fa-headset',
    title: '24/7 Support',
    desc: 'Round-the-clock customer support for all your rental needs and emergencies.',
    features: ['Emergency Response', 'Roadside Assistance', 'Dedicated Support'],
  },
]

const featuredVehicles = computed(() => {
  return availableVehicles.value.slice(0, 3)
})

async function loadVehicles() {
  await store.fetchVehicles()
}

onMounted(() => {
  loadVehicles()
})
</script>

<template>
  <div class="home">
    <!-- ── HERO ── -->
    <section class="hero">
      <Hero3D />
      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          <span class="section-label">Quick-Wheels</span>
        </div>
        <h1 class="hero-title">
          <span class="line1">Your Journey</span><br>
          <span class="line2 gradient-text">Our Wheels</span>
        </h1>
        <p class="hero-sub">
          Rent motorcycles, bajajis, and cars for daily commutes, business trips, 
          or weekend adventures. Own your vehicle through our flexible hire purchase program.
        </p>
        <div class="hero-actions">
          <RouterLink to="/vehicles" class="btn-primary">
            View Our Fleet <font-awesome-icon icon="fa-solid fa-arrow-right" />
          </RouterLink>
          <RouterLink to="/contact" class="btn-outline">
            <font-awesome-icon icon="fa-solid fa-rocket" /> Get a Quote
          </RouterLink>
        </div>
        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-value gradient-text">{{ stat.value }}</span>
            <span class="stat-label">
              <font-awesome-icon :icon="stat.icon" class="stat-icon" /> {{ stat.label }}
            </span>
          </div>
        </div>
      </div>
      <div class="scroll-hint">
        <div class="scroll-mouse"><div class="scroll-wheel"></div></div>
        <span>Scroll</span>
      </div>
    </section>

    <!-- ── MARQUEE ── -->
    <div class="marquee-strip">
      <div class="marquee-track">
        <span v-for="item in [...marquee, ...marquee]" :key="Math.random()" class="marquee-item">
          <font-awesome-icon icon="fa-solid fa-check-circle" class="marquee-dot" /> {{ item }}
        </span>
      </div>
    </div>

    <!-- ── SERVICES ── -->
    <section class="services-section">
      <div class="section-header">
        <p class="section-label">What We Offer</p>
        <h2 class="section-title">Services That <span class="gradient-text">Drive</span></h2>
        <p class="section-sub">End-to-end transport solutions from daily rentals to full fleet management.</p>
      </div>
      <div class="services-grid">
        <div v-for="(svc, i) in services" :key="svc.title" class="service-card glass-card"
          :style="{ animationDelay: `${i * 0.1}s` }"
          @mouseenter="activeService = i" @mouseleave="activeService = null">
          <div class="svc-glow" :class="{ visible: activeService === i }"></div>
          <div class="svc-icon"><font-awesome-icon :icon="svc.icon" /></div>
          <h3 class="svc-title">{{ svc.title }}</h3>
          <p class="svc-desc">{{ svc.desc }}</p>
          <div class="svc-features">
            <span v-for="f in svc.features" :key="f" class="svc-feat">
              <font-awesome-icon icon="fa-solid fa-check-circle" size="xs" /> {{ f }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SKILLS ORBIT ── -->
    <SkillsOrbit />

    <!-- ── VEHICLES PREVIEW ── -->
    <section class="vehicles-preview">
      <div class="section-header">
        <p class="section-label">Our Fleet</p>
        <h2 class="section-title">Featured <span class="gradient-text">Vehicles</span></h2>
        <p v-if="!isLoading && !error && featuredVehicles.length > 0" class="section-sub">
          Showing {{ featuredVehicles.length }} vehicle{{ featuredVehicles.length > 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading vehicles...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-banner">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" /> {{ error }}
        <button @click="loadVehicles" class="btn-retry">
          <font-awesome-icon icon="fa-solid fa-rotate" /> Retry
        </button>
      </div>

      <!-- No Vehicles -->
      <div v-else-if="featuredVehicles.length === 0" class="empty-state">
        <font-awesome-icon icon="fa-solid fa-car" size="3x" />
        <h3>No Vehicles Available</h3>
        <p>No vehicles available at the moment. Please check back later.</p>
        <RouterLink to="/contact" class="btn-primary" style="margin-top: 16px;">
          Contact Us <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </RouterLink>
      </div>

      <!-- Vehicles Grid -->
      <div v-else class="vehicles-grid">
        <VehicleCard3D v-for="vehicle in featuredVehicles" :key="vehicle.id" :vehicle="vehicle" />
      </div>

      <div v-if="featuredVehicles.length > 0" style="text-align:center; margin-top:48px">
        <RouterLink to="/vehicles" class="btn-outline">
          See All Vehicles <font-awesome-icon icon="fa-solid fa-arrow-right" />
        </RouterLink>
      </div>
    </section>

    <!-- ── CTA BANNER ── -->
    <section class="cta-banner">
      <div class="cta-inner glass-card">
        <div class="cta-glow-orb orb1"></div>
        <div class="cta-glow-orb orb2"></div>
        <p class="section-label">Ready to ride?</p>
        <h2 class="cta-title">Book Your <span class="gradient-text">Dream Ride</span></h2>
        <p class="cta-sub">From motorcycles to luxury cars, we have the perfect vehicle for every journey.</p>
        <RouterLink to="/vehicles" class="btn-primary" style="font-size:1rem; padding:16px 40px">
          <font-awesome-icon icon="fa-solid fa-rocket" /> Book Now
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── HERO ── */
.hero {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 32px 80px;
  max-width: 680px;
  margin-left: max(32px, calc(50vw - 580px));
}
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.eyebrow-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00E5FF;
  box-shadow: 0 0 12px #00E5FF;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}
.hero-title {
  font-size: clamp(2.8rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.08;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}
.line1 { color: #fff; }
.hero-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  max-width: 520px;
  margin-bottom: 36px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 60px;
}
.hero-stats {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}
.stat-item { display: flex; flex-direction: column; gap: 4px; }
.stat-value { font-size: 2rem; font-weight: 800; font-family: 'Syne', sans-serif; }
.stat-label { 
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.stat-icon { font-size: 0.7rem; opacity: 0.6; }

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.35);
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  z-index: 2;
}
.scroll-mouse {
  width: 22px; height: 36px;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}
.scroll-wheel {
  width: 3px; height: 8px;
  background: #00E5FF;
  border-radius: 2px;
  animation: scrollAnim 1.6s infinite;
}
@keyframes scrollAnim {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(12px); opacity: 0; }
}

/* ── MARQUEE ── */
.marquee-strip {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-top: 1px solid rgba(0,229,255,0.1);
  border-bottom: 1px solid rgba(0,229,255,0.1);
  padding: 16px 0;
  background: rgba(0,196,212,0.04);
}
.marquee-track {
  display: flex;
  gap: 0;
  animation: marquee 30s linear infinite;
  width: max-content;
}
.marquee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  white-space: nowrap;
}
.marquee-dot { color: #00C4D4; font-size: 0.6rem; opacity: 0.7; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ── SECTIONS ── */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}
.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.section-sub {
  color: rgba(255,255,255,0.55);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── SERVICES ── */
.services-section {
  padding: 80px 32px;
  position: relative;
  z-index: 1;
}
.services-section > * { max-width: 1200px; margin-left: auto; margin-right: auto; }
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
.service-card {
  padding: 32px 28px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,196,212,0.1);
}
.svc-glow {
  position: absolute;
  top: -40px; right: -40px;
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(0,229,255,0.15), transparent);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.svc-glow.visible { opacity: 1; }
.svc-icon { font-size: 2rem; margin-bottom: 16px; color: #00E5FF; }
.svc-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; }
.svc-desc { font-size: 0.875rem; color: rgba(255,255,255,0.58); line-height: 1.65; margin-bottom: 20px; }
.svc-features { display: flex; flex-wrap: wrap; gap: 6px; }
.svc-feat {
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(37,99,196,0.2);
  border: 1px solid rgba(37,99,196,0.4);
  color: rgba(255,255,255,0.6);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.svc-feat svg { font-size: 0.5rem; color: #00C4D4; }

/* ── SKILLS ORBIT ── */
.skills-orbit {
  padding: 60px 32px;
}

/* ── VEHICLES PREVIEW ── */
.vehicles-preview {
  padding: 80px 32px 100px;
  position: relative;
  z-index: 1;
}
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── LOADING ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
  color: rgba(255,255,255,0.3);
}
.spinner {
  width: 44px; height: 44px;
  border: 3px solid rgba(0,196,212,0.1);
  border-top-color: #00C4D4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── ERROR ── */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255,0,0,0.08);
  border: 1px solid rgba(255,0,0,0.2);
  border-radius: 10px;
  color: #ff6b6b;
  font-size: 0.9rem;
  flex-wrap: wrap;
}
.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  transition: all 0.2s;
}
.btn-retry:hover {
  background: rgba(255,255,255,0.2);
}

/* ── EMPTY ── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.3);
  grid-column: 1 / -1;
}
.empty-state svg { opacity: 0.3; margin-bottom: 16px; }
.empty-state h3 { color: #fff; margin-bottom: 8px; }

/* ── CTA ── */
.cta-banner { padding: 80px 32px 120px; position: relative; z-index: 1; }
.cta-inner {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
  padding: 72px 48px;
  position: relative;
  overflow: hidden;
}
.cta-glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.orb1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0,196,212,0.12), transparent);
  top: -80px; left: -80px;
}
.orb2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(45,43,127,0.2), transparent);
  bottom: -60px; right: -60px;
}
.cta-title {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  margin: 12px 0 16px;
}
.cta-sub { color: rgba(255,255,255,0.6); margin-bottom: 36px; line-height: 1.7; }

/* ── BUTTONS ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,229,255,0.3);
}
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 30px;
  border: 1.5px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-outline:hover {
  border-color: #00E5FF;
  color: #fff;
  background: rgba(0,229,255,0.05);
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .services-grid, .vehicles-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .services-section { padding: 60px 16px; }
  .vehicles-preview { padding: 60px 16px 80px; }
  .cta-inner { padding: 48px 24px; }
  .skills-orbit { padding: 40px 16px; }
}
@media (max-width: 640px) {
  .services-grid, .vehicles-grid { grid-template-columns: 1fr; }
  .hero-content { padding: 100px 24px 60px; margin-left: 0; }
  .hero-stats { gap: 24px; }
  .cta-inner { padding: 32px 16px; }
}
</style>