<template>
  <div class="my-rides">
    <div class="page-header">
      <h1 class="page-title">{{ $t("customer.myRides") }}</h1>
      <p class="page-subtitle">{{ $t("customer.noRidesSubtitle") }}</p>
    </div>

    <SkeletonLoader v-if="loading" variant="list" :rows="6" :cols="1" />

    <template v-else-if="rides.length === 0">
      <div class="empty-state">
        <font-awesome-icon icon="fa-solid fa-car-side" class="empty-icon" />
        <h3>{{ $t("customer.noRides") }}</h3>
        <p>{{ $t("customer.startBooking") }}</p>
        <RouterLink to="/customer/book" class="empty-cta">{{
          $t("customer.rideBooking")
        }}</RouterLink>
      </div>
    </template>

    <div v-else class="rides-list">
      <div v-for="b in rides" :key="b.id" class="ride-card">
        <div class="ride-card-top">
          <div class="ride-route">
            <span class="route-dot pickup" />
            <span class="route-line" />
            <span class="route-dot dropoff" />
          </div>
          <div class="ride-info">
            <span class="ride-location pickup-text">{{ b.pickup_location }}</span>
            <span class="ride-location dest-text">{{ b.destination || b.return_location || '—' }}</span>
          </div>
          <div class="ride-right">
            <span :class="['ride-status', `status-${b.status}`]">{{ $t("status." + b.status) }}</span>
            <span v-if="b.scheduled_at || b.start_date" class="ride-date">
              {{ formatRideDate(b.scheduled_at || b.start_date) }}
            </span>
          </div>
        </div>
        <div class="ride-card-bottom">
          <div class="ride-meta">
            <span v-if="b.assigned_driver_name" class="meta-item">
              <font-awesome-icon icon="fa-solid fa-user" size="xs" />
              {{ b.assigned_driver_name }}
            </span>
            <span v-if="b.vehicle_name" class="meta-item">
              <font-awesome-icon icon="fa-solid fa-car" size="xs" />
              {{ b.vehicle_name }}
            </span>
            <span v-if="b.fare || b.total_amount" class="ride-fare">
              TZS {{ (b.fare || b.total_amount || 0).toLocaleString() }}
            </span>
          </div>
          <button
            v-if="['requested', 'pending'].includes(b.status)"
            class="cancel-btn"
            @click="cancelRide(b.id)"
          >
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/composables/api";
import SkeletonLoader from "@/components/common/SkeletonLoader.vue";

const { t } = useI18n();
const rides = ref([]);
const loading = ref(true);

function formatRideDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function fetchRides() {
  try {
    const { data: json } = await api.get("/customer/my-rides");
    if (json.success) rides.value = json.data;
  } catch (e) {
    console.error("Failed to load rides:", e);
  } finally {
    loading.value = false;
  }
}

async function cancelRide(id) {
  try {
    const { data: json } = await api.post(`/customer/rides/${id}/cancel`, {
      reason: t("customer.cancelRide"),
    });
    if (json.success) fetchRides();
  } catch (e) {
    console.error("Cancel failed:", e);
  }
}

onMounted(fetchRides);
</script>

<style scoped>
.my-rides { max-width: 800px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; text-align: center; }
.empty-icon { font-size: 3rem; color: rgba(255,255,255,0.1); margin-bottom: 12px; }
.empty-state h3 { font-family: 'Syne', sans-serif; color: rgba(255,255,255,0.5); margin: 0 0 4px; }
.empty-state p { color: rgba(255,255,255,0.3); font-size: 0.85rem; margin: 0 0 16px; }
.empty-cta { background: rgba(0,196,212,0.15); border: 1px solid rgba(0,196,212,0.3); color: #00c4d4; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.empty-cta:hover { background: rgba(0,196,212,0.25); }

.rides-list { display: flex; flex-direction: column; gap: 10px; }
.ride-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
.ride-card-top { display: flex; align-items: stretch; gap: 12px; }

.ride-route { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 2px 0; flex-shrink: 0; width: 10px; }
.route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.route-dot.pickup { background: #4ade80; }
.route-dot.dropoff { background: #f87171; }
.route-line { flex: 1; width: 2px; background: rgba(255,255,255,0.1); }

.ride-info { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.ride-location { font-size: 0.85rem; color: rgba(255,255,255,0.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pickup-text { font-weight: 500; }
.dest-text { color: rgba(255,255,255,0.4); }

.ride-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.ride-status { font-size: 0.65rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
.status-requested { background: rgba(234,179,8,0.12); color: #facc15; }
.status-pending { background: rgba(234,179,8,0.12); color: #facc15; }
.status-accepted { background: rgba(0,229,255,0.12); color: #22d3ee; }
.status-confirmed { background: rgba(34,197,94,0.12); color: #4ade80; }
.status-en_route { background: rgba(99,102,241,0.12); color: #818cf8; }
.status-active { background: rgba(0,229,255,0.12); color: #22d3ee; }
.status-in_progress { background: rgba(0,229,255,0.12); color: #22d3ee; }
.status-completed { background: rgba(74,222,128,0.12); color: #4ade80; }
.status-cancelled { background: rgba(239,68,68,0.12); color: #f87171; }
.ride-date { font-size: 0.72rem; color: rgba(255,255,255,0.35); }

.ride-card-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.04); }
.ride-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.meta-item { font-size: 0.75rem; color: rgba(255,255,255,0.35); display: flex; align-items: center; gap: 5px; }
.ride-fare { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #22d3ee; }

.cancel-btn { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 0.78rem; font-weight: 500; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif; }
.cancel-btn:hover { background: rgba(239,68,68,0.2); }
</style>
