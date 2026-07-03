<template>
  <div class="book-ride">
    <div class="page-header">
      <h1 class="page-title">{{ $t('customer.rideBooking') }}</h1>
      <p class="page-subtitle">{{ $t('customer.subtitle') }}</p>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
    </div>

    <template v-else>
      <div class="booking-layout">
        <div class="vehicles-list">
          <div v-if="vehicles.length === 0" class="empty">
            <font-awesome-icon icon="fa-solid fa-car" class="empty-icon" />
            <p>{{ $t('customer.noVehicles') }}</p>
          </div>
          <div
            v-for="v in vehicles"
            :key="v.id"
            :class="['vehicle-card', { selected: selectedVehicle?.id === v.id }]"
            @click="selectVehicle(v)"
          >
            <div class="vehicle-img">
              <font-awesome-icon icon="fa-solid fa-car-side" />
            </div>
            <div class="vehicle-body">
              <strong class="vehicle-name">{{ v.name }}</strong>
              <span class="vehicle-meta">{{ v.year }} · {{ v.type }}</span>
              <span class="vehicle-rate">${{ v.price }}/day</span>
            </div>
          </div>
        </div>

        <div class="booking-form-wrapper">
          <div v-if="!selectedVehicle" class="form-placeholder">
            <font-awesome-icon icon="fa-solid fa-hand-pointer" />
            <p>{{ $t('customer.selectVehiclePrompt') }}</p>
          </div>
          <form v-else @submit.prevent="submitBooking" class="booking-form">
            <h3 class="form-title">{{ $t('customer.bookingDetails') }}</h3>
            <div class="selected-vehicle-badge">
              <font-awesome-icon icon="fa-solid fa-car-side" />
              {{ selectedVehicle.name }} — ${{ selectedVehicle.price }}/day
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ $t('customer.pickupDate') }}</label>
                <input v-model="form.start_date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label>{{ $t('customer.returnDate') }}</label>
                <input v-model="form.end_date" type="date" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label>{{ $t('customer.pickupLocation') }}</label>
              <input v-model="form.pickup_location" type="text" class="form-input" :placeholder="$t('customer.pickupPlaceholder')" required />
            </div>

            <div class="form-group">
              <label>{{ $t('customer.notesOptional') }}</label>
              <textarea v-model="form.notes" class="form-input" rows="3" :placeholder="$t('customer.notesPlaceholder')"></textarea>
            </div>

            <p v-if="error" class="form-error">{{ error }}</p>
            <p v-if="success" class="form-success">{{ success }}</p>

            <button type="submit" :disabled="submitting" class="submit-btn">
              <font-awesome-icon v-if="submitting" icon="fa-solid fa-spinner" spin />
              {{ submitting ? $t('common.loading') : $t('customer.bookNow') }}
            </button>
          </form>
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
const vehicles = ref([]);
const selectedVehicle = ref(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const success = ref('');

const form = ref({
  start_date: '',
  end_date: '',
  pickup_location: '',
  notes: '',
});

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/customer/available-vehicles`, {
      headers: { Authorization: `Bearer ${authStore.token}`, Accept: 'application/json' },
    });
    const json = await res.json();
    if (json.success) vehicles.value = json.data;
  } catch (e) {
    console.error('Failed to load vehicles:', e);
  } finally {
    loading.value = false;
  }
});

function selectVehicle(v) {
  selectedVehicle.value = v;
  error.value = '';
  success.value = '';
}

async function submitBooking() {
  if (!selectedVehicle.value) return;
  submitting.value = true;
  error.value = '';
  success.value = '';
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/customer/bookings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        vehicle_id: selectedVehicle.value.id,
        start_date: form.value.start_date,
        end_date: form.value.end_date,
        pickup_location: form.value.pickup_location,
        notes: form.value.notes || null,
      }),
    });
    const json = await res.json();
    if (json.success) {
      success.value = t('customer.bookingConfirmed');
      form.value = { start_date: '', end_date: '', pickup_location: '', notes: '' };
      selectedVehicle.value = null;
    } else {
      error.value = json.message || t('customer.bookingFailed');
    }
  } catch (e) {
    error.value = t('customer.networkError');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.book-ride { max-width: 1100px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }
.loading-container { display: flex; justify-content: center; padding: 80px 0; }
.loader { width: 36px; height: 36px; border: 3px solid rgba(0,229,255,0.15); border-top-color: #00e5ff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty { display: flex; flex-direction: column; align-items: center; padding: 40px; color: rgba(255,255,255,0.3); }
.empty-icon { font-size: 2rem; margin-bottom: 8px; }
.booking-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 768px) { .booking-layout { grid-template-columns: 1fr; } }
.vehicles-list { display: flex; flex-direction: column; gap: 10px; }
.vehicle-card { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.2s; }
.vehicle-card:hover { border-color: rgba(0,229,255,0.2); background: rgba(0,229,255,0.04); }
.vehicle-card.selected { border-color: #00e5ff; background: rgba(0,229,255,0.08); box-shadow: 0 0 20px rgba(0,229,255,0.08); }
.vehicle-img { width: 48px; height: 48px; border-radius: 10px; background: rgba(0,229,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: #00e5ff; flex-shrink: 0; }
.vehicle-body { display: flex; flex-direction: column; }
.vehicle-name { font-size: 0.9rem; color: rgba(255,255,255,0.8); }
.vehicle-meta { font-size: 0.75rem; color: rgba(255,255,255,0.35); }
.vehicle-rate { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #22d3ee; margin-top: 2px; }
.form-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 300px; color: rgba(255,255,255,0.15); gap: 10px; border: 2px dashed rgba(255,255,255,0.06); border-radius: 12px; }
.form-placeholder svg { font-size: 2.5rem; }
.form-placeholder p { font-size: 0.9rem; color: rgba(255,255,255,0.25); }
.booking-form-wrapper { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; }
.booking-form { display: flex; flex-direction: column; gap: 16px; }
.form-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.8); margin: 0; }
.selected-vehicle-badge { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.12); color: #00e5ff; font-size: 0.85rem; font-weight: 500; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.55); }
.form-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif; outline: none; transition: border-color 0.2s; }
.form-input:focus { border-color: #00e5ff; }
.form-input::placeholder { color: rgba(255,255,255,0.2); }
textarea.form-input { resize: vertical; min-height: 60px; }
.form-error { color: #ff6b6b; font-size: 0.82rem; margin: 0; }
.form-success { color: #4ade80; font-size: 0.82rem; margin: 0; }
.submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 10px; border: none; background: linear-gradient(135deg, #1e1b5e, #00c4d4); color: #fff; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,196,212,0.25); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
