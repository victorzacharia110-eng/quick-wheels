<template>
  <div class="about-page">
    <div class="page-header">
      <h1 class="page-title">{{ scStore.contents?.about?.title || $t('about.title') }}</h1>
      <p class="page-sub">{{ scStore.contents?.about?.subtitle || $t('about.subtitle') }}</p>
    </div>

    <div class="story-section">
      <div class="story-content">
        <h2 class="section-heading">{{ scStore.contents?.about?.story_title || 'Our Story' }}</h2>
        <p>{{ scStore.contents?.about?.story_paragraph_1 || '' }}</p>
        <p>{{ scStore.contents?.about?.story_paragraph_2 || '' }}</p>
      </div>
    </div>

    <div class="mission-vision">
      <div class="mv-card glass-card">
        <div class="mv-icon"><font-awesome-icon icon="fa-solid fa-bullseye" /></div>
        <h3>{{ $t('about.mission') }}</h3>
        <p>{{ scStore.contents?.about?.mission || $t('about.missionDesc') }}</p>
      </div>
      <div class="mv-card glass-card">
        <div class="mv-icon"><font-awesome-icon icon="fa-solid fa-eye" /></div>
        <h3>{{ $t('about.vision') }}</h3>
        <p>{{ scStore.contents?.about?.vision || $t('about.visionDesc') }}</p>
      </div>
    </div>

    <div class="values-section">
      <h2 class="section-heading centered">{{ scStore.contents?.about?.values_title || 'Our Values' }}</h2>
      <div class="about-grid">
        <div class="about-card glass-card">
          <font-awesome-icon :icon="scStore.contents?.about?.value1_icon || 'fa-solid fa-shield-halved'" size="2x" />
          <h3>{{ scStore.contents?.about?.value1_title || 'Reliability' }}</h3>
          <p>{{ scStore.contents?.about?.value1_desc || '' }}</p>
        </div>
        <div class="about-card glass-card">
          <font-awesome-icon :icon="scStore.contents?.about?.value2_icon || 'fa-solid fa-handshake'" size="2x" />
          <h3>{{ scStore.contents?.about?.value2_title || 'Flexibility' }}</h3>
          <p>{{ scStore.contents?.about?.value2_desc || '' }}</p>
        </div>
        <div class="about-card glass-card">
          <font-awesome-icon :icon="scStore.contents?.about?.value3_icon || 'fa-solid fa-headset'" size="2x" />
          <h3>{{ scStore.contents?.about?.value3_title || 'Support' }}</h3>
          <p>{{ scStore.contents?.about?.value3_desc || '' }}</p>
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
.page-header { text-align: center; margin-bottom: 48px; max-width: 720px; margin-left: auto; margin-right: auto; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
}
.page-sub { color: rgba(255,255,255,0.45); font-size: 1.1rem; line-height: 1.7; }

.section-heading {
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00E5FF;
  margin-bottom: 20px;
}
.section-heading.centered { text-align: center; }

.story-section {
  max-width: 800px;
  margin: 0 auto 60px;
  padding: 40px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(0,229,255,0.08);
  border-radius: 16px;
}
.story-content p {
  color: rgba(255,255,255,0.6);
  line-height: 1.9;
  margin-bottom: 16px;
  font-size: 1rem;
}
.story-content p:last-child { margin-bottom: 0; }

.mission-vision {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto 60px;
}
.mv-card {
  padding: 36px 28px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}
.mv-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.3);
}
.mv-icon { font-size: 2rem; color: #00C4D4; margin-bottom: 16px; }
.mv-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}
.mv-card p {
  color: rgba(255,255,255,0.55);
  line-height: 1.8;
  font-size: 0.95rem;
}

.values-section {
  max-width: 900px;
  margin: 0 auto;
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
  transition: transform 0.3s, box-shadow 0.3s;
}
.about-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(0,196,212,0.1);
}
.about-card svg { color: #00C4D4; margin-bottom: 16px; }
.about-card h3 { color: #fff; font-size: 1.1rem; margin-bottom: 12px; }
.about-card p { color: rgba(255,255,255,0.45); font-size: 0.9rem; line-height: 1.7; }

@media (max-width: 768px) {
  .mission-vision { grid-template-columns: 1fr; }
  .about-grid { grid-template-columns: 1fr; }
  .about-page { padding: 60px 20px; }
  .story-section { padding: 24px; }
}
</style>
