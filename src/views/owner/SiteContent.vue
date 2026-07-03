<template>
  <div class="site-content-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('siteContent.title') }}</h1>
        <p class="page-sub">{{ $t('siteContent.subtitle') }}</p>
      </div>
    </div>

    <div v-if="store.isLoading && !store.contents.hero" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="!store.isLoading || store.contents.hero" class="content-sections">
        <!-- Hero Section -->
        <SectionCard :title="$t('siteContent.heroSection')" :editing="editing.hero" @toggle="toggleEdit('hero')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.title')" v-model="local.hero.title" :disabled="!editing.hero" />
            <FormField :label="$t('siteContent.subtitle')" v-model="local.hero.subtitle" :disabled="!editing.hero" type="textarea" />
            <FormField :label="$t('siteContent.ctaText')" v-model="local.hero.cta_text" :disabled="!editing.hero" />
            <FormField :label="$t('siteContent.ctaLink')" v-model="local.hero.cta_link" :disabled="!editing.hero" />
          </div>
        </SectionCard>

        <!-- Stats Section -->
        <SectionCard :title="$t('siteContent.statsSection')" :editing="editing.stats" @toggle="toggleEdit('stats')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.vehiclesLabel')" v-model="local.stats.vehicles_label" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.driversLabel')" v-model="local.stats.drivers_label" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.contractsLabel')" v-model="local.stats.contracts_label" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.yearsLabel')" v-model="local.stats.years_label" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.vehiclesCount')" v-model="local.stats.vehicles_count" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.driversCount')" v-model="local.stats.drivers_count" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.contractsCount')" v-model="local.stats.contracts_count" :disabled="!editing.stats" />
            <FormField :label="$t('siteContent.yearsCount')" v-model="local.stats.years_count" :disabled="!editing.stats" />
          </div>
        </SectionCard>

        <!-- Services Section -->
        <SectionCard :title="$t('siteContent.servicesSection')" :editing="editing.services" @toggle="toggleEdit('services')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.title')" v-model="local.services.title" :disabled="!editing.services" />
            <FormField :label="$t('siteContent.subtitle')" v-model="local.services.subtitle" :disabled="!editing.services" type="textarea" />
          </div>
        </SectionCard>

        <!-- About Section -->
        <SectionCard :title="$t('siteContent.aboutSection')" :editing="editing.about" @toggle="toggleEdit('about')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.title')" v-model="local.about.title" :disabled="!editing.about" />
            <FormField :label="$t('siteContent.subtitle')" v-model="local.about.subtitle" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.mission')" v-model="local.about.mission" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.vision')" v-model="local.about.vision" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.storyTitle')" v-model="local.about.story_title" :disabled="!editing.about" />
            <FormField :label="$t('siteContent.storyParagraph1')" v-model="local.about.story_paragraph_1" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.storyParagraph2')" v-model="local.about.story_paragraph_2" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.valuesTitle')" v-model="local.about.values_title" :disabled="!editing.about" />
            <FormField :label="$t('siteContent.value1Title')" v-model="local.about.value1_title" :disabled="!editing.about" />
            <FormField :label="$t('siteContent.value1Desc')" v-model="local.about.value1_desc" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.value2Title')" v-model="local.about.value2_title" :disabled="!editing.about" />
            <FormField :label="$t('siteContent.value2Desc')" v-model="local.about.value2_desc" :disabled="!editing.about" type="textarea" />
            <FormField :label="$t('siteContent.value3Title')" v-model="local.about.value3_title" :disabled="!editing.about" />
            <FormField :label="$t('siteContent.value3Desc')" v-model="local.about.value3_desc" :disabled="!editing.about" type="textarea" />
          </div>
        </SectionCard>

        <!-- Contact Section -->
        <SectionCard :title="$t('siteContent.contactSection')" :editing="editing.contact" @toggle="toggleEdit('contact')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.title')" v-model="local.contact.title" :disabled="!editing.contact" />
            <FormField :label="$t('siteContent.subtitle')" v-model="local.contact.subtitle" :disabled="!editing.contact" type="textarea" />
            <FormField :label="$t('siteContent.address')" v-model="local.contact.address" :disabled="!editing.contact" />
            <FormField :label="$t('siteContent.phone')" v-model="local.contact.phone" :disabled="!editing.contact" />
            <FormField :label="$t('siteContent.email')" v-model="local.contact.email" :disabled="!editing.contact" />
            <FormField :label="$t('siteContent.mapEmbedUrl')" v-model="local.contact.map_embed_url" :disabled="!editing.contact" />
          </div>
        </SectionCard>

        <!-- Footer Section -->
        <SectionCard :title="$t('siteContent.footerSection')" :editing="editing.footer" @toggle="toggleEdit('footer')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.description')" v-model="local.footer.description" :disabled="!editing.footer" type="textarea" />
            <FormField :label="$t('siteContent.copyright')" v-model="local.footer.copyright" :disabled="!editing.footer" />
            <FormField :label="$t('siteContent.facebookUrl')" v-model="local.footer.facebook_url" :disabled="!editing.footer" />
            <FormField :label="$t('siteContent.instagramUrl')" v-model="local.footer.instagram_url" :disabled="!editing.footer" />
            <FormField :label="$t('siteContent.twitterUrl')" v-model="local.footer.twitter_url" :disabled="!editing.footer" />
            <FormField :label="$t('siteContent.youtubeUrl')" v-model="local.footer.youtube_url" :disabled="!editing.footer" />
          </div>
        </SectionCard>

        <!-- SEO Section -->
        <SectionCard :title="$t('siteContent.seoSection')" :editing="editing.seo" @toggle="toggleEdit('seo')">
          <div class="form-grid">
            <FormField :label="$t('siteContent.siteName')" v-model="local.seo.site_name" :disabled="!editing.seo" />
            <FormField :label="$t('siteContent.metaDescription')" v-model="local.seo.meta_description" :disabled="!editing.seo" type="textarea" />
          </div>
        </SectionCard>

        <!-- Save Button -->
        <div class="save-bar">
          <button class="btn-primary btn-save" :disabled="store.isLoading" @click="saveAll">
            <span v-if="store.isLoading" class="spinner-small"></span>
            <font-awesome-icon v-else icon="fa-solid fa-save" />
            {{ $t('siteContent.saveAllChanges') }}
          </button>
          <Transition name="fade">
            <span v-if="saved" class="save-success">{{ $t('siteContent.savedSuccess') }}</span>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteContentStore } from '@/stores/siteContent'
import SectionCard from './SiteContentSectionCard.vue'
import FormField from './SiteContentFormField.vue'

const { t } = useI18n()
const store = useSiteContentStore()

const editing = reactive({
  hero: false, stats: false, services: false, about: false,
  contact: false, footer: false, seo: false
})

const local = reactive({
  hero: {}, stats: {}, services: {}, about: {},
  contact: {}, footer: {}, seo: {}
})

const saved = ref(false)

const sectionFields = {
  hero: ['title', 'subtitle', 'cta_text', 'cta_link'],
  stats: ['vehicles_label', 'drivers_label', 'contracts_label', 'years_label', 'vehicles_count', 'drivers_count', 'contracts_count', 'years_count'],
  services: ['title', 'subtitle'],
  about: ['title', 'subtitle', 'mission', 'vision', 'story_title', 'story_paragraph_1', 'story_paragraph_2', 'values_title', 'value1_title', 'value1_desc', 'value1_icon', 'value2_title', 'value2_desc', 'value2_icon', 'value3_title', 'value3_desc', 'value3_icon'],
  contact: ['title', 'subtitle', 'address', 'phone', 'email', 'map_embed_url'],
  footer: ['description', 'copyright', 'facebook_url', 'instagram_url', 'twitter_url', 'youtube_url'],
  seo: ['site_name', 'meta_description']
}

function syncLocal() {
  Object.keys(local).forEach(section => {
    local[section] = { ...(store.contents[section] || {}) }
  })
}

watch(() => store.contents, syncLocal, { deep: true, immediate: true })

function toggleEdit(section) {
  editing[section] = !editing[section]
  if (!editing[section]) {
    local[section] = { ...(store.contents[section] || {}) }
  }
}

function collectChanges() {
  const updates = []
  Object.keys(editing).forEach(section => {
    if (!editing[section]) return
    const fields = sectionFields[section]
    const original = store.contents[section] || {}
    fields.forEach(key => {
      const value = local[section][key]
      if (value !== undefined && value !== original[key]) {
        updates.push({ section, key, value, type: 'text' })
      }
    })
  })
  return updates
}

async function saveAll() {
  const updates = collectChanges()
  if (updates.length === 0) return
  const result = await store.updateContents(updates)
  if (result.success) {
    Object.keys(editing).forEach(s => { editing[s] = false })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  }
}

onMounted(() => {
  store.fetchContents()
})
</script>

<style scoped>
.site-content-page { padding: 0; }
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
  padding: 80px 0;
  gap: 16px;
  color: rgba(255,255,255,0.4);
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(0,229,255,0.15);
  border-top-color: #00E5FF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.save-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
}
.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Space Grotesk', sans-serif;
}
.btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,229,255,0.35); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner-small {
  width: 18px; height: 18px;
  border: 2px solid rgba(10,8,24,0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.save-success {
  color: #00E5FF;
  font-size: 0.9rem;
  font-weight: 500;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: stretch; }
}
</style>
