<template>
  <div class="ride-requests">
    <div class="page-header">
      <h1 class="page-title">{{ $t('driver.rideRequests') }}</h1>
      <p class="page-sub">{{ $t('driver.rideRequestsDesc') }}</p>
    </div>

    <div class="tabs">
      <button :class="['tab', { active: tab === 'active' }]" @click="tab = 'active'">
        {{ $t('driver.active') }}
        <span v-if="activeRides.length" class="tab-badge">{{ activeRides.length }}</span>
      </button>
      <button :class="['tab', { active: tab === 'history' }]" @click="tab = 'history'">
        {{ $t('driver.history') }}
      </button>
    </div>

    <SkeletonLoader v-if="loading" variant="list" :rows="4" :cols="1" />

    <template v-else>
      <!-- Active Rides -->
      <div v-if="tab === 'active'">
        <div v-if="activeRides.length === 0" class="empty-state">
          <font-awesome-icon icon="fa-solid fa-car" class="empty-icon" />
          <h3>{{ $t('driver.noActiveRides') }}</h3>
          <p>{{ $t('driver.waitingForRequests') }}</p>
        </div>

        <div v-for="ride in activeRides" :key="ride.id" class="ride-card">
          <div class="ride-top">
            <div class="ride-route">
              <span class="route-dot pickup" />
              <span class="route-line" />
              <span class="route-dot dropoff" />
            </div>
            <div class="ride-info">
              <span class="pickup-text">{{ ride.pickup_location }}</span>
              <span class="dest-text">{{ ride.destination || '—' }}</span>
            </div>
            <span :class="['ride-status', `status-${ride.status}`]">{{ $t('status.' + ride.status) }}</span>
          </div>

          <div class="ride-details">
            <div class="detail-row">
              <font-awesome-icon icon="fa-solid fa-user" />
              <span>{{ ride.customer_name || '—' }}</span>
              <span class="detail-phone" v-if="ride.customer_phone">{{ ride.customer_phone }}</span>
            </div>
            <div class="detail-row" v-if="ride.scheduled_at || ride.start_date">
              <font-awesome-icon icon="fa-solid fa-clock" />
              <span>{{ formatTime(ride.scheduled_at || ride.start_date) }}</span>
            </div>
            <div class="detail-row" v-if="ride.notes">
              <font-awesome-icon icon="fa-solid fa-note-sticky" />
              <span class="ride-notes">{{ ride.notes }}</span>
            </div>
          </div>

          <div class="ride-actions">
            <!-- requested → accept / cancel -->
            <template v-if="ride.status === 'requested'">
              <button class="action-btn cancel" @click="updateRide(ride.id, 'cancel')">
                <font-awesome-icon icon="fa-solid fa-xmark" /> {{ $t('driver.decline') }}
              </button>
              <button class="action-btn accept" @click="updateRide(ride.id, 'accept')">
                <font-awesome-icon icon="fa-solid fa-check" /> {{ $t('driver.accept') }}
              </button>
            </template>

            <!-- accepted → en route -->
            <template v-if="ride.status === 'accepted'">
              <button class="action-btn cancel" @click="updateRide(ride.id, 'cancel')">
                <font-awesome-icon icon="fa-solid fa-xmark" /> {{ $t('driver.cancel') }}
              </button>
              <button class="action-btn primary" @click="updateRide(ride.id, 'en-route')">
                <font-awesome-icon icon="fa-solid fa-location-arrow" /> {{ $t('driver.headingToPickup') }}
              </button>
            </template>

            <!-- en_route → start ride -->
            <template v-if="ride.status === 'en_route'">
              <button class="action-btn primary full" @click="updateRide(ride.id, 'start')">
                <font-awesome-icon icon="fa-solid fa-user-check" /> {{ $t('driver.passengerPickedUp') }}
              </button>
            </template>

            <!-- in_progress → complete -->
            <template v-if="ride.status === 'in_progress'">
              <div class="fare-input-row">
                <input v-model="fareInputs[ride.id]" type="number" class="fare-input" :placeholder="$t('driver.enterFare')" />
              </div>
              <button class="action-btn primary full" @click="completeRide(ride.id)">
                <font-awesome-icon icon="fa-solid fa-flag-checkered" /> {{ $t('driver.completeRide') }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- History -->
      <div v-if="tab === 'history'">
        <div v-if="historyRides.length === 0" class="empty-state">
          <font-awesome-icon icon="fa-solid fa-clock-rotate-left" class="empty-icon" />
          <h3>{{ $t('driver.noHistory') }}</h3>
        </div>

        <div v-for="ride in historyRides" :key="ride.id" class="ride-card history">
          <div class="ride-top">
            <div class="ride-route">
              <span class="route-dot pickup" />
              <span class="route-line" />
              <span class="route-dot dropoff" />
            </div>
            <div class="ride-info">
              <span class="pickup-text">{{ ride.pickup_location }}</span>
              <span class="dest-text">{{ ride.destination || '—' }}</span>
            </div>
            <div class="ride-right">
              <span :class="['ride-status', `status-${ride.status}`]">{{ $t('status.' + ride.status) }}</span>
              <span class="ride-date">{{ formatTime(ride.completed_at || ride.cancelled_at || ride.created_at) }}</span>
            </div>
          </div>
          <div class="ride-details" v-if="ride.fare || ride.total_amount">
            <span class="ride-fare">TZS {{ (ride.fare || ride.total_amount || 0).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/composables/api';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';

const { t } = useI18n();
const loading = ref(true);
const tab = ref('active');
const activeRides = ref([]);
const historyRides = ref([]);
const fareInputs = ref({});

function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function fetchRides() {
  loading.value = true;
  try {
    const [activeRes, historyRes] = await Promise.allSettled([
      api.get('/employee/ride-requests'),
      api.get('/employee/ride-requests/history'),
    ]);
    if (activeRes.status === 'fulfilled' && activeRes.value.data.success) {
      activeRides.value = activeRes.value.data.data;
    }
    if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
      historyRides.value = historyRes.value.data.data;
    }
  } catch (e) {
    console.error('Failed to load rides:', e);
  } finally {
    loading.value = false;
  }
}

async function updateRide(id, action) {
  try {
    await api.post(`/employee/ride-requests/${id}/${action}`);
    fetchRides();
  } catch (e) {
    console.error('Action failed:', e);
  }
}

async function completeRide(id) {
  try {
    const payload = fareInputs.value[id] ? { fare: parseFloat(fareInputs.value[id]) } : {};
    await api.post(`/employee/ride-requests/${id}/complete`, payload);
    delete fareInputs.value[id];
    fetchRides();
  } catch (e) {
    console.error('Complete failed:', e);
  }
}

onMounted(fetchRides);
</script>

<style scoped>
.ride-requests { max-width: 700px; margin: 0 auto; }
.page-header { margin-bottom: 20px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-sub { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; }
.tab {
  padding: 8px 18px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.45); font-size: 0.82rem;
  font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  font-family: 'Space Grotesk', sans-serif;
}
.tab.active { background: rgba(0,229,255,0.1); color: #00e5ff; border-color: rgba(0,229,255,0.2); }
.tab-badge {
  background: #00e5ff; color: #0a0818; font-size: 0.65rem; font-weight: 700;
  min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
}

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 50px 20px; text-align: center; }
.empty-icon { font-size: 2.5rem; color: rgba(255,255,255,0.08); margin-bottom: 12px; }
.empty-state h3 { font-family: 'Syne', sans-serif; color: rgba(255,255,255,0.5); margin: 0 0 4px; }
.empty-state p { color: rgba(255,255,255,0.3); font-size: 0.85rem; margin: 0; }

.ride-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 18px; margin-bottom: 12px;
  transition: border-color 0.2s;
}
.ride-card:hover { border-color: rgba(0,229,255,0.15); }
.ride-card.history { opacity: 0.7; }

.ride-top { display: flex; align-items: stretch; gap: 12px; }
.ride-route { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 2px 0; flex-shrink: 0; width: 10px; }
.route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.route-dot.pickup { background: #4ade80; }
.route-dot.dropoff { background: #f87171; }
.route-line { flex: 1; width: 2px; background: rgba(255,255,255,0.1); }

.ride-info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.pickup-text { font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.8); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dest-text { font-size: 0.82rem; color: rgba(255,255,255,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ride-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.ride-date { font-size: 0.7rem; color: rgba(255,255,255,0.3); }

.ride-status {
  font-size: 0.65rem; font-weight: 600; padding: 3px 10px; border-radius: 20px;
  text-transform: uppercase; flex-shrink: 0;
}
.status-requested { background: rgba(234,179,8,0.12); color: #facc15; }
.status-accepted { background: rgba(0,229,255,0.12); color: #22d3ee; }
.status-en_route { background: rgba(99,102,241,0.12); color: #818cf8; }
.status-in_progress { background: rgba(0,229,255,0.12); color: #22d3ee; }
.status-completed { background: rgba(74,222,128,0.12); color: #4ade80; }
.status-cancelled { background: rgba(239,68,68,0.12); color: #f87171; }

.ride-details { padding: 10px 0 0 22px; display: flex; flex-direction: column; gap: 6px; }
.detail-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: rgba(255,255,255,0.5); }
.detail-row svg { color: rgba(255,255,255,0.25); width: 14px; }
.detail-phone { color: rgba(255,255,255,0.3); font-size: 0.75rem; }
.ride-notes { color: rgba(255,255,255,0.35); font-size: 0.78rem; }
.ride-fare { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #22d3ee; }

.ride-actions {
  display: flex; gap: 10px; margin-top: 14px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.04); align-items: center; flex-wrap: wrap;
}
.action-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 18px;
  border-radius: 10px; border: none; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: 'Space Grotesk', sans-serif;
}
.action-btn.accept {
  background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3); color: #4ade80;
}
.action-btn.accept:hover { background: rgba(74,222,128,0.25); }
.action-btn.primary {
  background: linear-gradient(135deg, #1e1b5e, #00c4d4); color: #fff;
}
.action-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,196,212,0.2); }
.action-btn.cancel {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171;
}
.action-btn.cancel:hover { background: rgba(239,68,68,0.2); }
.action-btn.full { flex: 1; justify-content: center; }

.fare-input-row { width: 100%; }
.fare-input {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 0.85rem;
  font-family: 'Space Grotesk', sans-serif; outline: none; margin-bottom: 8px;
}
.fare-input:focus { border-color: #00e5ff; }
.fare-input::placeholder { color: rgba(255,255,255,0.2); }

@media (max-width: 480px) {
  .ride-actions { flex-direction: column; }
  .action-btn { width: 100%; justify-content: center; }
}
</style>
