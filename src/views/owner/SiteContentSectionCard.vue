<template>
  <div class="section-card glass-card">
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
      <button class="edit-toggle" @click="$emit('toggle')">
        <font-awesome-icon :icon="editing ? 'fa-solid fa-times' : 'fa-solid fa-pen'" />
        {{ editing ? 'Cancel' : 'Edit' }}
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: String,
  editing: Boolean
})
defineEmits(['toggle'])
</script>

<style scoped>
.section-card {
  padding: 24px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}
.edit-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(0,229,255,0.08);
  border: 1px solid rgba(0,229,255,0.15);
  color: #00E5FF;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.edit-toggle:hover {
  background: rgba(0,229,255,0.15);
  border-color: rgba(0,229,255,0.3);
}
</style>
