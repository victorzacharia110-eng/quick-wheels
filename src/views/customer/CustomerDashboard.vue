<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">{{ $t('dashboard.title') }}</h1>
      <p class="page-subtitle">{{ $t('customer.welcomeBack') }}, {{ authStore.userName || $t('auth.customer') }}</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--total">
            <font-awesome-icon icon="fa-solid fa-calendar-check" />
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ stats.total_bookings }}</span>
            <span class="stat-label">{{ $t('customer.totalBookings') }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--active">
            <font-awesome-icon icon="fa-solid fa-play" />
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ stats.active }}</span>
            <span class="stat-label">{{ $t('customer.active') }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--pending">
            <font-awesome-icon icon="fa-solid fa-clock" />
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">{{ $t('customer.pending') }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon--completed">
            <font-awesome-icon icon="fa-solid fa-check-circle" />
          </div>
          <div class="stat-body">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">{{ $t('customer.completed') }}</span>
          </div>
        </div>
      </div>

      <div class="dash-sections">
        <div class="section-card">
          <div class="section-header">
            <h2>{{ $t('customer.recentBookings') }}</h2>
            <RouterLink to="/customer/my-rides" class="section-link">{{ $t('dashboard.viewAll') }}</RouterLink>
          </div>
          <div class="section-body">
            <div v-if="recentBookings.length === 0" class="empty-state">
              <font-awesome-icon icon="fa-solid fa-car-side" class="empty-icon" />
              <p>{{ $t('customer.noRides') }}</p>
              <RouterLink to="/customer/book" class="empty-cta">{{ $t('customer.bookFirstRide') }}</RouterLink>
            </div>
            <div v-for="b in recentBookings.slice(0, 3)" :key="b.id" class="booking-row">
              <div class="booking-info">
                <span class="booking-vehicle">{{ b.vehicle || $t('contract.vehicle') }}</span>
                <span class="booking-dates">{{ b.start_date }} - {{ b.end_date }}</span>
              </div>
              <span :class="['booking-status', `status-${b.status}`]">{{ $t('status.' + b.status) }}</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-header">
            <h2>{{ $t('customer.availableVehicles') }}</h2>
            <RouterLink to="/customer/book" class="section-link">{{ $t('customer.bookOne') }}</RouterLink>
          </div>
          <div class="section-body">
            <div v-if="vehicles.length === 0" class="empty-state">
              <font-awesome-icon icon="fa-solid fa-car" class="empty-icon" />
              <p>{{ $t('customer.noVehiclesAvailable') }}</p>
            </div>
            <div v-for="v in vehicles.slice(0, 3)" :key="v.id" class="vehicle-card-mini">
              <div class="vehicle-mini-info">
                <strong>{{ v.name }}</strong>
                <span>{{ v.year }} · {{ v.type }}</span>
              </div>
              <span class="vehicle-price">${{ v.price }}/day</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const { t } = useI18n();
const stats = ref({ total_bookings: 0, active: 0, pending: 0, completed: 0, cancelled: 0 });
const recentBookings = ref([]);
const vehicles = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/customer/dashboard`, {
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
    });
    const json = await res.json();
    if (json.success) {
      stats.value = json.data.stats;
      recentBookings.value = json.data.recent_bookings || [];
      vehicles.value = json.data.available_vehicles || [];
    }
  } catch (e) {
    console.error('Dashboard fetch failed:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard { max-width: 1000px; margin: 0 auto; }
.dashboard-header { margin-bottom: 28px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }
.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.loader { width: 36px; height: 36px; border: 3px solid rgba(0,229,255,0.15); border-top-color: #00e5ff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
.stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 14px; backdrop-filter: blur(8px); }
.stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.stat-icon--total { background: rgba(99,102,241,0.15); color: #818cf8; }
.stat-icon--active { background: rgba(34,197,94,0.15); color: #4ade80; }
.stat-icon--pending { background: rgba(234,179,8,0.15); color: #facc15; }
.stat-icon--completed { background: rgba(0,196,212,0.15); color: #22d3ee; }
.stat-body { display: flex; flex-direction: column; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; color: #fff; line-height: 1; }
.stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.dash-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 700px) { .dash-sections { grid-template-columns: 1fr; } }
.section-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.section-header h2 { margin: 0; font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.8); }
.section-link { color: #00c4d4; font-size: 0.8rem; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.section-link:hover { color: #00e5ff; }
.section-body { padding: 8px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 28px 16px; text-align: center; }
.empty-icon { font-size: 2rem; color: rgba(255,255,255,0.15); margin-bottom: 8px; }
.empty-state p { color: rgba(255,255,255,0.35); font-size: 0.85rem; margin: 0 0 10px; }
.empty-cta { background: rgba(0,196,212,0.15); border: 1px solid rgba(0,196,212,0.3); color: #00c4d4; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
.empty-cta:hover { background: rgba(0,196,212,0.25); }
.booking-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
.booking-row:last-child { border-bottom: none; }
.booking-info { display: flex; flex-direction: column; }
.booking-vehicle { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.7); }
.booking-dates { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
.booking-status { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
.status-pending { background: rgba(234,179,8,0.12); color: #facc15; }
.status-confirmed { background: rgba(34,197,94,0.12); color: #4ade80; }
.status-active { background: rgba(99,102,241,0.12); color: #818cf8; }
.status-completed { background: rgba(0,196,212,0.12); color: #22d3ee; }
.status-cancelled { background: rgba(239,68,68,0.12); color: #f87171; }
.vehicle-card-mini { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
.vehicle-card-mini:last-child { border-bottom: none; }
.vehicle-mini-info { display: flex; flex-direction: column; }
.vehicle-mini-info strong { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.7); }
.vehicle-mini-info span { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
.vehicle-price { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #22d3ee; }
</style>
