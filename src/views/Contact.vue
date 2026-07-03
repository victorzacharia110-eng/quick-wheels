<template>
  <div class="contact-page">
    <div class="page-header">
      <h1 class="page-title">{{ scStore.contents?.contact?.title || $t('contact.title') }}</h1>
      <p class="page-sub">{{ scStore.contents?.contact?.subtitle || $t('contact.subtitle') }}</p>
    </div>

    <div class="contact-content">
      <form @submit.prevent="handleSubmit" class="contact-form">
        <div class="form-group">
          <label>{{ $t('common.fullName') }} <span class="required">*</span></label>
          <input v-model="form.name" type="text" class="form-input" :placeholder="$t('auth.name')" required />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.email') }} <span class="required">*</span></label>
          <input v-model="form.email" type="email" class="form-input" placeholder="john@example.com" required />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.phone') }}</label>
          <input v-model="form.phone" type="tel" class="form-input" placeholder="+255 712 345 678" />
        </div>
        <div class="form-group">
          <label>{{ $t('contact.service') }} <span class="required">*</span></label>
          <select v-model="form.service" class="form-input" required>
            <option value="">{{ $t('contact.selectService') }}</option>
            <option value="Motorcycle Hire">{{ $t('contact.motorcycleHire') }}</option>
            <option value="Bajaji Hire">{{ $t('contact.bajajiHire') }}</option>
            <option value="Car Rental">{{ $t('contact.carRental') }}</option>
            <option value="Hire Purchase">{{ $t('contact.hirePurchase') }}</option>
            <option value="General">{{ $t('contact.generalInquiry') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ $t('contact.message') }} <span class="required">*</span></label>
          <textarea v-model="form.message" class="form-input" rows="4" :placeholder="$t('contact.messagePlaceholder')" required />
        </div>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="btn-content">
            <span class="spinner-sm"></span> {{ $t('contact.sending') }}
          </span>
          <span v-else class="btn-content">
            <font-awesome-icon icon="fa-solid fa-paper-plane" /> {{ $t('contact.sendMessage') }}
          </span>
        </button>
      </form>

      <div class="contact-info">
        <div class="info-item">
          <font-awesome-icon icon="fa-solid fa-phone" />
          <div>
            <h4>{{ $t('contact.phone') }}</h4>
            <p>{{ scStore.contents?.contact?.phone || '+255 712 345 678' }}</p>
          </div>
        </div>
        <div class="info-item">
          <font-awesome-icon icon="fa-regular fa-envelope" />
          <div>
            <h4>{{ $t('contact.email') }}</h4>
            <p>{{ scStore.contents?.contact?.email || 'info@quick-wheels.co.tz' }}</p>
          </div>
        </div>
        <div class="info-item">
          <font-awesome-icon icon="fa-solid fa-location-dot" />
          <div>
            <h4>{{ $t('contact.location') }}</h4>
            <p>{{ scStore.contents?.contact?.address || 'Dar es Salaam, Tanzania' }}</p>
          </div>
        </div>
        <div class="info-item">
          <font-awesome-icon icon="fa-regular fa-clock" />
          <div>
            <h4>{{ $t('contact.workingHours') }}</h4>
            <p>{{ $t('contact.hours') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="map-section">
      <h2 class="map-title">{{ $t('contact.findUs') }}</h2>
      <div class="map-container">
        <iframe
          :src="scStore.contents?.contact?.map_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126916.65633634257!2d39.22904694130917!3d-6.792354075916521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4fe8f2b3f4e5%3A0x8b5b5b5b5b5b5b5b!2sDar%20es%20Salaam%2C%20Tanzania!5e0!3m2!1sen!2s!4v1'"
          width="100%"
          height="400"
          style="border:0; border-radius: 12px;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          :title="$t('contact.mapTitle')"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteContentStore } from '@/stores/siteContent'

const { t } = useI18n()
const scStore = useSiteContentStore()

onMounted(() => {
  scStore.fetchContents()
})

const form = reactive({
  name: '',
  email: '',
  phone: '',
  service: '',
  message: ''
})

const isSubmitting = ref(false)

async function handleSubmit() {
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  alert(t('contact.thankYou'))
  Object.assign(form, { name: '', email: '', phone: '', service: '', message: '' })
  isSubmitting.value = false
}
</script>

<style scoped>
.contact-page { 
  min-height: 100vh; 
  padding: 80px 32px; 
}

.page-header { 
  text-align: center; 
  margin-bottom: 48px; 
}

.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.gradient-text {
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-sub { 
  color: rgba(255,255,255,0.4); 
  font-size: 1.1rem; 
}

.contact-content {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
}

.contact-form { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
}

.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 4px; 
}

.form-group label { 
  font-size: 0.85rem; 
  font-weight: 500; 
  color: rgba(255,255,255,0.65); 
}

.required { 
  color: #ff6b6b; 
}

.form-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  font-family: 'Space Grotesk', sans-serif;
}

.form-input:focus { 
  border-color: rgba(0,229,255,0.4); 
  box-shadow: 0 0 0 3px rgba(0,229,255,0.06); 
}

textarea.form-input { 
  resize: vertical; 
  min-height: 100px; 
}

.btn-primary {
  padding: 12px 28px;
  border-radius: 30px;
  background: linear-gradient(90deg, #00C4D4, #00E5FF);
  color: #0a0818;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Space Grotesk', sans-serif;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px rgba(0, 229, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-content svg {
  font-size: 1rem;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(10,8,24,0.2);
  border-top-color: #0a0818;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

.contact-info { 
  display: flex; 
  flex-direction: column; 
  gap: 24px; 
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.06);
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(0, 229, 255, 0.1);
  transform: translateX(4px);
}

.info-item svg { 
  color: #00C4D4; 
  font-size: 1.4rem; 
  width: 32px;
  flex-shrink: 0;
}

.info-item h4 { 
  color: #fff; 
  font-size: 0.95rem; 
  font-weight: 600; 
}

.info-item p { 
  color: rgba(255,255,255,0.5); 
  font-size: 0.85rem; 
  margin-top: 2px; 
}

.map-section {
  max-width: 1000px;
  margin: 48px auto 0;
}

.map-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  text-align: center;
}

.map-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .contact-content { 
    grid-template-columns: 1fr; 
  }
  
  .contact-page { 
    padding: 60px 20px; 
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .btn-primary {
    padding: 14px 28px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .contact-page { 
    padding: 40px 16px; 
  }
  
  .page-title {
    font-size: 1.6rem;
  }
  
  .page-sub {
    font-size: 0.9rem;
  }
  
  .contact-content {
    gap: 32px;
  }
  
  .btn-primary {
    padding: 12px 24px;
    font-size: 0.9rem;
    min-height: 44px;
  }
  
  .info-item {
    padding: 12px;
  }
  
  .info-item svg {
    font-size: 1.2rem;
    width: 28px;
  }
}
</style>
