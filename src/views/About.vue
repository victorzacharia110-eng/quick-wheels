<template>
  <div class="about-page">
    <div class="page-header">
      <h1 class="page-title">{{ scStore.contents?.about?.title || $t('about.title') }}</h1>
      <p class="page-sub">{{ scStore.contents?.about?.subtitle || $t('about.subtitle') }}</p>
    </div>

    <div class="about-content">
      <div class="about-section">
        <h2>{{ $t('about.mission') }}</h2>
        <p>{{ scStore.contents?.about?.mission || $t('about.missionDesc') }}</p>
      </div>

      <div class="about-section">
        <h2>{{ $t('about.vision') }}</h2>
        <p>{{ scStore.contents?.about?.vision || $t('about.visionDesc') }}</p>
      </div>

      <div class="about-section">
        <h2>{{ scStore.contents?.about?.story_title || $t('about.story_title', 'Our Story') }}</h2>
        <p>{{ scStore.contents?.about?.story_paragraph1 || $t('about.story_paragraph1', '') }}</p>
        <p>{{ scStore.contents?.about?.story_paragraph2 || $t('about.story_paragraph2', '') }}</p>
      </div>

      <h2 class="values-title">{{ scStore.contents?.about?.values_title || $t('about.values_title', 'Our Values') }}</h2>

      <div class="about-grid">
        <div class="about-card glass-card">
          <font-awesome-icon :icon="scStore.contents?.about?.value1_icon || 'fa-solid fa-motorcycle'" size="2x" />
          <h3>{{ scStore.contents?.about?.value1_title || $t('about.value1_title') }}</h3>
          <p>{{ scStore.contents?.about?.value1_desc || $t('about.value1_desc') }}</p>
        </div>
        <div class="about-card glass-card">
          <font-awesome-icon :icon="scStore.contents?.about?.value2_icon || 'fa-solid fa-truck-front'" size="2x" />
          <h3>{{ scStore.contents?.about?.value2_title || $t('about.value2_title') }}</h3>
          <p>{{ scStore.contents?.about?.value2_desc || $t('about.value2_desc') }}</p>
        </div>
        <div class="about-card glass-card">
          <font-awesome-icon :icon="scStore.contents?.about?.value3_icon || 'fa-solid fa-car'" size="2x" />
          <h3>{{ scStore.contents?.about?.value3_title || $t('about.value3_title') }}</h3>
          <p>{{ scStore.contents?.about?.value3_desc || $t('about.value3_desc') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteContentStore } from '@/stores/siteContent'

const { t } = useI18n()
const scStore = useSiteContentStore()

onMounted(() => {
  scStore.fetchContents()
})
</script>

<style scoped>
.about-page { min-height: 100vh; padding: 80px 32px; }
.page-header { text-align: center; margin-bottom: 48px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}
.page-sub { color: rgba(255,255,255,0.4); font-size: 1.1rem; }

.about-content { max-width: 800px; margin: 0 auto; }
.about-section { margin-bottom: 32px; }
.about-section h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #00E5FF;
  margin-bottom: 12px;
}
.about-section p { color: rgba(255,255,255,0.6); line-height: 1.8; }

.values-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #00E5FF;
  margin: 40px 0 12px;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}
.about-card {
  text-align: center;
  padding: 32px 24px;
}
.about-card svg { color: #00C4D4; margin-bottom: 12px; }
.about-card h3 { color: #fff; font-size: 1.1rem; margin-bottom: 8px; }
.about-card p { color: rgba(255,255,255,0.4); font-size: 0.9rem; line-height: 1.6; }

@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-page { padding: 60px 20px; }
}
</style>
