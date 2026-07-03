<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="pagination-info">
      {{ $t('common.showing') }} {{ start }} {{ $t('common.to') }} {{ end }} {{ $t('common.of') }} {{ total }} {{ $t('common.records') }}
    </div>
    <div class="pagination-controls">
      <button class="page-btn" :disabled="currentPage === 1" @click="$emit('page-change', currentPage - 1)">
        &laquo; {{ $t('common.previous') }}
      </button>
      <button
        v-for="p in pages"
        :key="p"
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="$emit('page-change', p)"
      >{{ p }}</button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="$emit('page-change', currentPage + 1)">
        {{ $t('common.next') }} &raquo;
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  perPage: { type: Number, required: true },
  total: { type: Number, required: true },
})

defineEmits(['page-change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const start = computed(() => props.total === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1)
const end = computed(() => Math.min(props.currentPage * props.perPage, props.total))

const pages = computed(() => {
  const p = []
  for (let i = 1; i <= totalPages.value; i++) p.push(i)
  return p
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  gap: 16px;
  flex-wrap: wrap;
}
.pagination-info { color: rgba(255,255,255,0.4); font-size: 0.8rem; }
.pagination-controls { display: flex; gap: 4px; flex-wrap: wrap; }
.page-btn {
  padding: 6px 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.6);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled):not(.active) { background: rgba(255,255,255,0.08); color: #fff; }
.page-btn.active { background: #00C4D4; border-color: #00C4D4; color: #0a0818; font-weight: 600; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
@media (max-width: 768px) {
  .pagination { flex-direction: column; align-items: stretch; }
  .pagination-controls { justify-content: center; }
}
</style>
