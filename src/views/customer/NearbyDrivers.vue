<template>
  <div class="nearby-drivers">
    <div class="page-header">
      <h1 class="page-title">{{ $t('customer.nearbyDrivers') }}</h1>
      <p class="page-subtitle">{{ $t('customer.nearbySubtitle') }}</p>
    </div>

    <SkeletonLoader v-if="loading" variant="list" :rows="6" :cols="1" />

    <template v-else>
      <div class="map-placeholder">
        <div class="map-inner">
          <font-awesome-icon icon="fa-solid fa-map-location-dot" class="map-icon" />
          <p>{{ $t('customer.mapView') }}</p>
          <span class="map-hint">{{ drivers.length }} {{ drivers.length !== 1 ? $t('customer.driversNearby') : $t('customer.driverNearby') }}</span>
        </div>
      </div>

      <div class="drivers-list">
        <div v-if="drivers.length === 0" class="empty-drivers">
          <font-awesome-icon icon="fa-solid fa-user-slash" class="empty-icon" />
          <p>{{ $t('customer.noDrivers') }}</p>
        </div>
        <div v-for="d in drivers" :key="d.id" class="driver-card">
          <div class="driver-avatar">{{ d.name?.charAt(0) || 'D' }}</div>
          <div class="driver-info">
            <strong class="driver-name">{{ d.name }}</strong>
            <span class="driver-vehicle" v-if="d.vehicle_name">{{ d.vehicle_name }}</span>
            <span class="driver-distance" v-if="d.distance">~{{ d.distance }} {{ $t('customer.kmAway') }}</span>
          </div>
          <RouterLink to="/customer/book" class="book-driver-btn">{{ $t('customer.book') }}</RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';

const authStore = useAuthStore();
const { t } = useI18n();
const drivers = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/customer/nearby-drivers`, {
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
    });
    const json = await res.json();
    if (json.success) drivers.value = json.data;
  } catch (e) {
    console.error('Failed to load drivers:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.nearby-drivers { max-width: 800px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }
.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.loader { width: 36px; height: 36px; border: 3px solid rgba(0,229,255,0.15); border-top-color: #00e5ff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.map-placeholder { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; margin-bottom: 20px; aspect-ratio: 16/9; }
.map-inner { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.15); gap: 4px; }
.map-icon { font-size: 3rem; }
.map-inner p { font-family: 'Syne', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.25); margin: 0; }
.map-hint { font-size: 0.8rem; color: rgba(255,255,255,0.2); }
.drivers-list { display: flex; flex-direction: column; gap: 10px; }
.driver-card { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); transition: all 0.2s; }
.driver-card:hover { border-color: rgba(0,229,255,0.2); }
.driver-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #2d2b7f, #00c4d4); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.driver-info { flex: 1; display: flex; flex-direction: column; }
.driver-name { font-size: 0.9rem; color: rgba(255,255,255,0.8); }
.driver-vehicle { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.driver-distance { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
.book-driver-btn { background: rgba(0,196,212,0.12); border: 1px solid rgba(0,196,212,0.25); color: #00c4d4; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; flex-shrink: 0; }
.book-driver-btn:hover { background: rgba(0,196,212,0.25); }
.empty-drivers { display: flex; flex-direction: column; align-items: center; padding: 40px; color: rgba(255,255,255,0.3); }
.empty-icon { font-size: 2rem; margin-bottom: 8px; }
</style>
