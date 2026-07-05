<template>
  <div class="my-rides">
    <div class="page-header">
      <h1 class="page-title">{{ $t('customer.myRides') }}</h1>
      <p class="page-subtitle">{{ $t('customer.noRidesSubtitle') }}</p>
    </div>

    <SkeletonLoader v-if="loading" variant="list" :rows="6" :cols="1" />

    <template v-else-if="rides.length === 0">
      <div class="empty-state">
        <font-awesome-icon icon="fa-solid fa-car-side" class="empty-icon" />
        <h3>{{ $t('customer.noRides') }}</h3>
        <p>{{ $t('customer.startBooking') }}</p>
        <RouterLink to="/customer/book" class="empty-cta">{{ $t('customer.rideBooking') }}</RouterLink>
      </div>
    </template>

    <div v-else class="rides-list">
      <div v-for="b in rides" :key="b.id" class="ride-card">
        <div class="ride-card-top">
          <div class="ride-vehicle-icon">
            <font-awesome-icon icon="fa-solid fa-car-side" />
          </div>
          <div class="ride-info">
            <strong class="ride-vehicle">{{ b.vehicle_name || $t('contract.vehicle') }}</strong>
            <span class="ride-dates">{{ b.start_date }} → {{ b.end_date }}</span>
            <span class="ride-location">{{ b.pickup_location }}</span>
          </div>
          <span :class="['ride-status', `status-${b.status}`]">{{ $t('status.' + b.status) }}</span>
        </div>
        <div class="ride-card-bottom">
          <span class="ride-price" v-if="b.total_amount">${{ b.total_amount }}</span>
          <button
            v-if="['pending', 'confirmed'].includes(b.status)"
            class="cancel-btn"
            @click="cancelRide(b.id)"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';

const authStore = useAuthStore();
const { t } = useI18n();
const rides = ref([]);
const loading = ref(true);

async function fetchRides() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/customer/my-rides`, {
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
    });
    const json = await res.json();
    if (json.success) rides.value = json.data;
  } catch (e) {
    console.error('Failed to load rides:', e);
  } finally {
    loading.value = false;
  }
}

async function cancelRide(id) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/customer/rides/${id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ reason: t('customer.cancelRide') }),
    });
    const json = await res.json();
    if (json.success) fetchRides();
  } catch (e) {
    console.error('Cancel failed:', e);
  }
}

onMounted(fetchRides);
</script>

<style scoped>
.my-rides { max-width: 800px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }
.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.loader { width: 36px; height: 36px; border: 3px solid rgba(0,229,255,0.15); border-top-color: #00e5ff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; text-align: center; }
.empty-icon { font-size: 3rem; color: rgba(255,255,255,0.1); margin-bottom: 12px; }
.empty-state h3 { font-family: 'Syne', sans-serif; color: rgba(255,255,255,0.5); margin: 0 0 4px; }
.empty-state p { color: rgba(255,255,255,0.3); font-size: 0.85rem; margin: 0 0 16px; }
.empty-cta { background: rgba(0,196,212,0.15); border: 1px solid rgba(0,196,212,0.3); color: #00c4d4; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.empty-cta:hover { background: rgba(0,196,212,0.25); }
.rides-list { display: flex; flex-direction: column; gap: 10px; }
.ride-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
.ride-card-top { display: flex; align-items: center; gap: 14px; }
.ride-vehicle-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(0,229,255,0.08); display: flex; align-items: center; justify-content: center; color: #00e5ff; flex-shrink: 0; }
.ride-info { flex: 1; display: flex; flex-direction: column; }
.ride-vehicle { font-size: 0.9rem; color: rgba(255,255,255,0.8); }
.ride-dates { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.ride-location { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
.ride-status { font-size: 0.7rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; flex-shrink: 0; }
.status-pending { background: rgba(234,179,8,0.12); color: #facc15; }
.status-confirmed { background: rgba(34,197,94,0.12); color: #4ade80; }
.status-active { background: rgba(99,102,241,0.12); color: #818cf8; }
.status-completed { background: rgba(0,196,212,0.12); color: #22d3ee; }
.status-cancelled { background: rgba(239,68,68,0.12); color: #f87171; }
.ride-card-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.04); }
.ride-price { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #22d3ee; }
.cancel-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 0.78rem; font-weight: 500; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
.cancel-btn:hover { background: rgba(239,68,68,0.2); }
</style>
