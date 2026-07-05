<template>
  <div class="skeleton-wrapper" :class="[variant, `rows-${rows || 1}`]">
    <template v-if="variant === 'table'">
      <div class="skeleton-table">
        <div class="skeleton-thead">
          <div v-for="i in (cols || 4)" :key="'h'+i" class="skeleton-cell" :style="{ width: colWidths?.[i-1] || 'auto' }"></div>
        </div>
        <div v-for="r in (rows || 5)" :key="'r'+r" class="skeleton-tr">
          <div v-for="c in (cols || 4)" :key="'c'+c" class="skeleton-cell" :style="{ width: colWidths?.[c-1] || 'auto' }"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'card'">
      <div v-for="i in (rows || 3)" :key="i" class="skeleton-card">
        <div class="skeleton-card-img"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line w-75"></div>
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-60"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'stats'">
      <div class="skeleton-stats-grid">
        <div v-for="i in (rows || 4)" :key="i" class="skeleton-stat">
          <div class="skeleton-line w-40 skeleton-stat-value"></div>
          <div class="skeleton-line w-60 skeleton-stat-label"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'list'">
      <div v-for="i in (rows || 5)" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-body">
          <div class="skeleton-line w-60"></div>
          <div class="skeleton-line w-40"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'form'">
      <div class="skeleton-form">
        <div v-for="i in (rows || 4)" :key="i" class="skeleton-form-group">
          <div class="skeleton-line w-30 skeleton-label"></div>
          <div class="skeleton-input"></div>
        </div>
      </div>
    </template>

    <template v-else-if="variant === 'profile'">
      <div class="skeleton-profile">
        <div class="skeleton-avatar large"></div>
        <div class="skeleton-profile-body">
          <div class="skeleton-line w-50"></div>
          <div class="skeleton-line w-30"></div>
          <div class="skeleton-line w-70"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-for="i in (rows || 3)" :key="i" class="skeleton-text-row">
        <div class="skeleton-line" :class="i % 2 === 0 ? 'w-70' : 'w-90'"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: v => ['text', 'table', 'card', 'stats', 'list', 'form', 'profile'].includes(v)
  },
  rows: { type: Number, default: null },
  cols: { type: Number, default: null },
  colWidths: { type: Array, default: null }
})
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

/* Pulse animation */
.skeleton-line,
.skeleton-cell,
.skeleton-input,
.skeleton-avatar,
.skeleton-card-img,
.skeleton-stat {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
}
.skeleton-line::after,
.skeleton-cell::after,
.skeleton-input::after,
.skeleton-avatar::after,
.skeleton-card-img::after,
.skeleton-stat::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0,229,255,0.06), transparent);
  animation: shimmer 1.6s ease-in-out infinite;
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.w-30 { width: 30%; }
.w-40 { width: 40%; }
.w-50 { width: 50%; }
.w-60 { width: 60%; }
.w-70 { width: 70%; }
.w-75 { width: 75%; }
.w-90 { width: 90%; }

.skeleton-line {
  height: 14px;
  margin-bottom: 10px;
}

/* Table variant */
.skeleton-table {
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  overflow: hidden;
}
.skeleton-thead,
.skeleton-tr {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
}
.skeleton-thead {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.skeleton-tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.skeleton-tr:last-child {
  border-bottom: none;
}
.skeleton-cell {
  height: 16px;
  flex: 1;
}
.skeleton-thead .skeleton-cell {
  height: 12px;
}

/* Stats variant */
.skeleton-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.skeleton-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}
.skeleton-stat-value {
  height: 32px;
}
.skeleton-stat-label {
  height: 12px;
}

/* Card variant */
.skeleton-card {
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}
.skeleton-card-img {
  height: 160px;
}
.skeleton-card-body {
  padding: 16px;
}

/* List variant */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}
.skeleton-avatar.large {
  width: 80px;
  height: 80px;
}
.skeleton-list-body {
  flex: 1;
}

/* Form variant */
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.skeleton-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.skeleton-label {
  height: 12px;
}
.skeleton-input {
  height: 42px;
}

/* Profile variant */
.skeleton-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}
.skeleton-profile-body {
  flex: 1;
}
</style>
