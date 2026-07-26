<template>
  <div class="book-ride">
    <div class="page-header">
      <h1 class="page-title">{{ $t('customer.rideBooking') }}</h1>
      <p class="page-subtitle">{{ $t('customer.rideBookingSubtitle') }}</p>
    </div>

    <div class="ride-form-card">
      <form @submit.prevent="requestRide" class="ride-form">
        <div class="location-section">
          <div class="location-dot pickup-dot" />
          <div class="location-inputs">
            <div class="form-group">
              <input
                v-model="form.pickup_location"
                type="text"
                class="form-input pickup-input"
                :placeholder="$t('customer.enterPickup')"
                required
              />
            </div>
            <div class="location-divider" />
            <div class="form-group">
              <input
                v-model="form.destination"
                type="text"
                class="form-input dest-input"
                :placeholder="$t('customer.enterDestination')"
                required
              />
            </div>
          </div>
        </div>

        <div class="schedule-toggle">
          <label class="toggle-label">
            <input type="checkbox" v-model="scheduleLater" class="toggle-cb" />
            <span class="toggle-switch" />
            <span>{{ $t('customer.scheduleForLater') }}</span>
          </label>
        </div>

        <div v-if="scheduleLater" class="form-row">
          <div class="form-group">
            <label>{{ $t('customer.rideDate') }}</label>
            <input v-model="form.ride_date" type="date" class="form-input" :min="today" required />
          </div>
          <div class="form-group">
            <label>{{ $t('customer.rideTime') }}</label>
            <input v-model="form.ride_time" type="time" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('customer.notesOptional') }}</label>
          <textarea v-model="form.notes" class="form-input" rows="2" :placeholder="$t('customer.notesPlaceholder')"></textarea>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>
        <p v-if="success" class="form-success">{{ success }}</p>

        <button type="submit" :disabled="submitting" class="submit-btn">
          <font-awesome-icon v-if="submitting" icon="fa-solid fa-spinner" spin />
          <font-awesome-icon v-else icon="fa-solid fa-car" />
          {{ submitting ? $t('common.loading') : $t('customer.requestRide') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/composables/api';

const { t } = useI18n();
const submitting = ref(false);
const error = ref('');
const success = ref('');
const scheduleLater = ref(false);

const today = new Date().toISOString().split('T')[0];

const form = ref({
  pickup_location: '',
  destination: '',
  ride_date: today,
  ride_time: '',
  notes: '',
});

async function requestRide() {
  submitting.value = true;
  error.value = '';
  success.value = '';

  try {
    const payload = {
      pickup_location: form.value.pickup_location,
      destination: form.value.destination,
      notes: form.value.notes || null,
    };

    if (scheduleLater.value && form.value.ride_date && form.value.ride_time) {
      payload.scheduled_at = `${form.value.ride_date}T${form.value.ride_time}`;
    }

    const { data: json } = await api.post('/customer/bookings', payload);

    if (json.success) {
      success.value = t('customer.rideRequested');
      form.value = { pickup_location: '', destination: '', ride_date: today, ride_time: '', notes: '' };
      scheduleLater.value = false;
    } else {
      error.value = json.message || t('customer.bookingFailed');
    }
  } catch (e) {
    error.value = e.response?.data?.message || t('customer.networkError');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.book-ride { max-width: 560px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
.page-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0; }

.ride-form-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 24px;
}
.ride-form { display: flex; flex-direction: column; gap: 18px; }

.location-section { display: flex; gap: 12px; align-items: stretch; }
.location-dot { width: 12px; min-height: 100%; display: flex; flex-direction: column; align-items: center; padding: 14px 0; }
.pickup-dot::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
.pickup-dot::after { content: ''; flex: 1; width: 2px; background: rgba(255,255,255,0.1); margin-top: 4px; }
.location-inputs { flex: 1; display: flex; flex-direction: column; gap: 0; }
.location-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 2px 0; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.55); }
.form-input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px 14px;
  color: #fff;
  font-size: 0.88rem;
  font-family: 'Space Grotesk', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: #00e5ff; }
.form-input::placeholder { color: rgba(255,255,255,0.2); }
.pickup-input { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none; }
.dest-input { border-top-left-radius: 0; border-top-right-radius: 0; }
textarea.form-input { resize: vertical; min-height: 50px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.schedule-toggle { display: flex; }
.toggle-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.85rem; color: rgba(255,255,255,0.6); }
.toggle-cb { display: none; }
.toggle-switch {
  width: 36px; height: 20px; border-radius: 10px;
  background: rgba(255,255,255,0.1);
  position: relative; transition: background 0.3s; flex-shrink: 0;
}
.toggle-switch::after {
  content: ''; width: 16px; height: 16px; border-radius: 50%;
  background: rgba(255,255,255,0.4);
  position: absolute; top: 2px; left: 2px; transition: all 0.3s;
}
.toggle-cb:checked + .toggle-switch { background: rgba(0,229,255,0.3); }
.toggle-cb:checked + .toggle-switch::after { left: 18px; background: #00e5ff; }

.form-error { color: #ff6b6b; font-size: 0.82rem; margin: 0; }
.form-success { color: #4ade80; font-size: 0.82rem; margin: 0; }

.submit-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; border-radius: 12px; border: none;
  background: linear-gradient(135deg, #1e1b5e, #00c4d4);
  color: #fff; font-family: 'Syne', sans-serif; font-weight: 700;
  font-size: 0.95rem; cursor: pointer; transition: all 0.3s;
}
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,196,212,0.25); }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
  .ride-form-card { padding: 16px; }
}
</style>
