<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('settings.title') }}</h1>
        <p class="page-sub">{{ $t('settings.subtitle') }}</p>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Profile Settings -->
      <div class="settings-card glass-card">
        <h3>{{ $t('settings.profileSettings') }}</h3>
        <div class="settings-item">
          <label>{{ $t('settings.businessName') }}</label>
          <input v-model="profileForm.business_name" type="text" class="form-input" />
        </div>
        <div class="settings-item">
          <label>{{ $t('settings.email') }}</label>
          <input v-model="profileForm.email" type="email" class="form-input" />
        </div>
        <div class="settings-item">
          <label>{{ $t('settings.phone') }}</label>
          <input v-model="profileForm.phone" type="tel" class="form-input" />
        </div>
        <div class="settings-item">
          <label>Business Address</label>
          <input v-model="profileForm.business_address" type="text" class="form-input" />
        </div>
        <div class="settings-item">
          <label>Business Website</label>
          <input v-model="profileForm.business_website" type="url" class="form-input" />
        </div>
        <button class="btn-primary" @click="saveProfile" :disabled="profileSaving">
          <span v-if="profileSaving">Saving...</span>
          <span v-else>{{ $t('settings.saveChanges') }}</span>
        </button>
        <p v-if="profileSuccess" class="success-text">Profile updated successfully!</p>
        <p v-if="profileError" class="error-text">{{ profileError }}</p>
      </div>

      <!-- Payment Settings -->
      <div class="settings-card glass-card">
        <h3>{{ $t('settings.paymentSettings') }}</h3>
        <div class="settings-item">
          <label>{{ $t('settings.defaultPaymentFrequency') }}</label>
          <select class="form-input">
            <option value="weekly">{{ $t('settings.weekly') }}</option>
            <option value="daily">{{ $t('settings.daily') }}</option>
          </select>
        </div>
        <div class="settings-item">
          <label>{{ $t('settings.paymentMethods') }}</label>
          <div class="checkbox-group">
            <label><input type="checkbox" checked /> {{ $t('settings.cash') }}</label>
            <label><input type="checkbox" checked /> {{ $t('settings.mpesa') }}</label>
            <label><input type="checkbox" /> {{ $t('settings.bankTransfer') }}</label>
          </div>
        </div>
        <button class="btn-primary">{{ $t('settings.savePaymentSettings') }}</button>
      </div>

      <!-- Notification Settings -->
      <div class="settings-card glass-card">
        <h3>{{ $t('settings.notificationSettings') }}</h3>
        <div class="settings-item">
          <label class="toggle-item">
            <input type="checkbox" checked />
            <span>{{ $t('settings.paymentReceived') }}</span>
          </label>
        </div>
        <div class="settings-item">
          <label class="toggle-item">
            <input type="checkbox" checked />
            <span>{{ $t('settings.newContract') }}</span>
          </label>
        </div>
        <div class="settings-item">
          <label class="toggle-item">
            <input type="checkbox" />
            <span>{{ $t('settings.expiringContracts') }}</span>
          </label>
        </div>
        <button class="btn-primary">{{ $t('settings.saveNotificationSettings') }}</button>
      </div>

      <!-- AI Features -->
      <div class="settings-card glass-card ai-settings-card">
        <div class="ai-header">
          <div>
            <h3><font-awesome-icon icon="fa-solid fa-robot" /> {{ $t('settings.aiFeatures') }}</h3>
            <p class="ai-desc">{{ $t('settings.aiFeaturesDesc') }}</p>
          </div>
          <label class="ai-toggle">
            <input type="checkbox" :checked="authStore.aiEnabled" @change="toggleAi" :disabled="aiToggling" />
            <span class="ai-toggle-slider"></span>
          </label>
        </div>
        <div v-if="aiToggling" class="ai-status">{{ $t('settings.togglingAi') }}...</div>
        <div v-else-if="authStore.aiEnabled" class="ai-status active">
          <font-awesome-icon icon="fa-solid fa-circle-check" /> {{ $t('settings.aiEnabled') }}
        </div>
        <div v-else class="ai-status inactive">
          <font-awesome-icon icon="fa-solid fa-circle-xmark" /> {{ $t('settings.aiDisabled') }}
        </div>
        <div class="ai-features-list">
          <div class="ai-feature"><font-awesome-icon icon="fa-solid fa-check" /> {{ $t('settings.aiFeatureDocAnalysis') }}</div>
          <div class="ai-feature"><font-awesome-icon icon="fa-solid fa-check" /> {{ $t('settings.aiFeatureSmartExtraction') }}</div>
          <div class="ai-feature"><font-awesome-icon icon="fa-solid fa-check" /> {{ $t('settings.aiFeatureAutoVerify') }}</div>
        </div>
        <p v-if="aiError" class="error-text">{{ aiError }}</p>
      </div>

      <!-- Danger Zone -->
      <div class="settings-card danger-zone">
        <h3>{{ $t('settings.dangerZone') }}</h3>
        <p>{{ $t('settings.dangerZoneDesc') }}</p>
        <div class="danger-actions">
          <button class="btn-danger" @click="confirmReset">
            <font-awesome-icon icon="fa-solid fa-trash" />
            {{ $t('settings.resetAllData') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import api from '@/composables/api'

const { t } = useI18n()
const authStore = useAuthStore()

const profileForm = ref({
  business_name: '',
  email: '',
  phone: '',
  business_address: '',
  business_website: '',
})
const profileSaving = ref(false)
const profileSuccess = ref(false)
const profileError = ref('')

function loadProfile() {
  const user = authStore.user
  if (user) {
    profileForm.value = {
      business_name: user.business?.business_name || '',
      email: user.business?.business_email || user.email || '',
      phone: user.business?.business_phone || user.phone || '',
      business_address: user.business?.business_address || '',
      business_website: user.business?.business_website || '',
    }
  }
}

async function saveProfile() {
  profileSaving.value = true
  profileSuccess.value = false
  profileError.value = ''
  try {
    const res = await api.put('/auth/owner/profile', profileForm.value)
    if (res.data.success) {
      profileSuccess.value = true
      await authStore.fetchUser()
    } else {
      profileError.value = res.data.message || 'Failed to save profile'
    }
  } catch (err) {
    profileError.value = err.response?.data?.message || 'Failed to save profile'
  } finally {
    profileSaving.value = false
  }
}

function confirmReset() {
  if (confirm(t('common.confirmResetData'))) {
    alert(t('common.resetAllData'))
  }
}

const aiToggling = ref(false)
const aiError = ref('')

async function toggleAi() {
  aiToggling.value = true
  aiError.value = ''
  try {
    const res = await api.post('/owner/ai/toggle')
    if (res.data.success) {
      authStore.setAiEnabled(res.data.data.ai_enabled)
    } else {
      aiError.value = res.data.message || 'Failed to toggle AI'
    }
  } catch (err) {
    aiError.value = err.response?.data?.message || 'Failed to toggle AI'
  } finally {
    aiToggling.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.settings-page { padding: 0; }
.page-header { margin-bottom: 24px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.settings-card {
  padding: 24px;
}
.settings-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}
.settings-item {
  margin-bottom: 14px;
}
.settings-item label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
  margin-bottom: 4px;
}
.form-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.form-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.06); }
select.form-input {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
.checkbox-group { display: flex; gap: 12px; flex-wrap: wrap; }
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
}
.checkbox-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #00C4D4;
  cursor: pointer;
}
.toggle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.toggle-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #00C4D4;
  cursor: pointer;
}
.toggle-item span { color: rgba(255,255,255,0.6); font-weight: 400; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
  margin-top: 8px;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,229,255,0.35); }

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 30px;
  background: rgba(255,107,107,0.15);
  border: 1px solid rgba(255,107,107,0.3);
  color: #ff6b6b;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-danger:hover { background: rgba(255,107,107,0.25); border-color: rgba(255,107,107,0.5); transform: translateY(-2px); }

.danger-zone {
  border-color: rgba(255,107,107,0.2);
}
.danger-zone h3 { color: #ff6b6b; }
.danger-zone p { color: rgba(255,255,255,0.4); font-size: 0.85rem; margin-bottom: 16px; }
.success-text { color: #4ADE80; font-size: 0.85rem; margin-top: 8px; }
.error-text { color: #ff6b6b; font-size: 0.85rem; margin-top: 8px; }

.ai-settings-card { border: 1px solid rgba(0,229,255,0.15); }
.ai-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ai-header h3 { margin-bottom: 4px; }
.ai-desc { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin: 0; }
.ai-toggle { position: relative; display: inline-block; width: 52px; height: 28px; cursor: pointer; flex-shrink: 0; }
.ai-toggle input { opacity: 0; width: 0; height: 0; }
.ai-toggle-slider {
  position: absolute; inset: 0;
  background: rgba(255,255,255,0.1);
  border-radius: 28px;
  transition: all 0.3s;
}
.ai-toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px; height: 22px;
  left: 3px; bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s;
}
.ai-toggle input:checked + .ai-toggle-slider { background: linear-gradient(90deg, #00C4D4, #00E5FF); }
.ai-toggle input:checked + .ai-toggle-slider::before { transform: translateX(24px); }
.ai-toggle input:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-status { font-size: 0.85rem; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
.ai-status.active { color: #4ADE80; }
.ai-status.inactive { color: rgba(255,255,255,0.4); }
.ai-features-list { display: flex; flex-direction: column; gap: 8px; }
.ai-feature {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; color: rgba(255,255,255,0.55);
}
.ai-feature svg { color: #00E5FF; font-size: 0.75rem; }

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>