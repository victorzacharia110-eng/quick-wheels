<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>{{ $t('notFound.title') }}</h2>
      <p>{{ $t('notFound.description') }}</p>
      <RouterLink to="/" class="btn-primary">
        <font-awesome-icon icon="fa-solid fa-arrow-left" /> {{ $t('notFound.goHome') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
.not-found-content h1 {
  font-family: 'Syne', sans-serif;
  font-size: 6rem;
  font-weight: 900;
  color: #00C4D4;
  margin-bottom: 8px;
}
.not-found-content h2 {
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
}
.not-found-content p { color: rgba(255,255,255,0.4); margin-bottom: 24px; }
</style>
