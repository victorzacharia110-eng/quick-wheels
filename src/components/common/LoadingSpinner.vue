<template>
  <div class="spinner-container" :class="size">
    <div class="spinner"></div>
    <p v-if="message" class="spinner-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.spinner {
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.small .spinner { width: 24px; height: 24px; border: 2px solid rgba(0,196,212,0.1); border-top-color: #00C4D4; }
.medium .spinner { width: 44px; height: 44px; border: 3px solid rgba(0,196,212,0.1); border-top-color: #00C4D4; }
.large .spinner { width: 64px; height: 64px; border: 4px solid rgba(0,196,212,0.1); border-top-color: #00C4D4; }
.spinner-message { color: rgba(255,255,255,0.3); font-size: 0.9rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>