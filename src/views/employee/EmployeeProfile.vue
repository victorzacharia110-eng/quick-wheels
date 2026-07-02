<template>
  <div class="employee-profile">
    <div class="page-header">
      <h1 class="page-title">My Profile</h1>
      <p class="page-sub">View and manage your personal information</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else class="profile-card glass-card">
      <div class="profile-avatar">
        <span>{{ initials }}</span>
      </div>

      <div class="profile-info">
        <div class="info-row">
          <span class="label">Full Name</span>
          <span class="value">{{ authStore.userName }}</span>
        </div>
        <div class="info-row">
          <span class="label">Email</span>
          <span class="value">{{ authStore.userEmail }}</span>
        </div>
        <div class="info-row">
          <span class="label">Phone Number</span>
          <span class="value">{{ userData?.phone_number || 'Not provided' }}</span>
        </div>
        <div class="info-row">
          <span class="label">NIDA Number</span>
          <span class="value">{{ authStore.userNida || 'Not provided' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Role</span>
          <span class="value role-badge">{{ authStore.userRole }}</span>
        </div>
        <div class="info-row">
          <span class="label">Account Created</span>
          <span class="value">{{ formatDate(authStore.user?.created_at) }}</span>
        </div>
        <div class="info-row" v-if="myContract">
          <span class="label">Current Vehicle</span>
          <span class="value">{{ myContract.vehicle_name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useContractStore } from '@/stores/contracts'

const authStore = useAuthStore()
const contractStore = useContractStore()

const isLoading = ref(false)

const userData = computed(() => authStore.user)

const myContract = computed(() => {
  return contractStore.contracts.find(c => 
    c.driver_name === authStore.userName || 
    c.driver_email === authStore.userEmail
  )
})

const initials = computed(() => {
  const name = authStore.userName || 'User'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    authStore.fetchUser(),
    contractStore.fetchContracts()
  ])
  isLoading.value = false
})
</script>

<style scoped>
.employee-profile { animation: fadeIn 0.4s ease; padding: 0; }
.page-header { margin-bottom: 24px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 0.95rem; }

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

.profile-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00C4D4, #00E5FF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: #0a0818;
  flex-shrink: 0;
}
.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-row .label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-row .value {
  color: rgba(255,255,255,0.8);
  font-size: 1rem;
}
.role-badge {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  background: rgba(0,196,212,0.15);
  color: #00C4D4;
  font-size: 0.8rem;
  font-weight: 600;
  align-self: flex-start;
}

@media (max-width: 640px) {
  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .role-badge { align-self: center; }
}
</style>