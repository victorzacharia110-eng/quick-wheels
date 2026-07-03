<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <span class="logo-mark">QW</span>
            <span class="logo-text">Quick-Wheels</span>
          </div>
          <p class="footer-desc">{{ scStore.contents?.footer?.description || $t('footer.tagline') }}</p>
          <div class="footer-social">
            <a :href="scStore.contents?.footer?.facebook_url || '#'" :aria-label="$t('common.facebook')">
              <font-awesome-icon :icon="['fab', 'facebook']" />
            </a>
            <a :href="scStore.contents?.footer?.instagram_url || '#'" :aria-label="$t('common.instagram')">
              <font-awesome-icon :icon="['fab', 'instagram']" />
            </a>
            <a :href="scStore.contents?.footer?.twitter_url || '#'" :aria-label="$t('common.twitter')">
              <font-awesome-icon :icon="['fab', 'twitter']" />
            </a>
            <a :href="scStore.contents?.footer?.youtube_url || '#'" :aria-label="$t('common.youtube')">
              <font-awesome-icon :icon="['fab', 'youtube']" />
            </a>
            <a href="#" :aria-label="$t('common.whatsapp')">
              <font-awesome-icon :icon="['fab', 'whatsapp']" />
            </a>
          </div>
        </div>

        <div class="footer-links">
          <h4>{{ $t('footer.quickLinks') }}</h4>
          <RouterLink to="/">{{ $t('nav.home') }}</RouterLink>
          <RouterLink to="/vehicles">{{ $t('nav.vehicles') }}</RouterLink>
          <RouterLink to="/about">{{ $t('nav.about') }}</RouterLink>
          <RouterLink to="/contact">{{ $t('nav.contact') }}</RouterLink>
        </div>

        <div class="footer-links">
          <h4>{{ $t('footer.services') }}</h4>
          <RouterLink to="/vehicles?type=motorcycle">{{ $t('contact.motorcycleHire') }}</RouterLink>
          <RouterLink to="/vehicles?type=bajaji">{{ $t('contact.bajajiHire') }}</RouterLink>
          <RouterLink to="/vehicles?type=car">{{ $t('footer.carRentals') }}</RouterLink>
          <RouterLink to="/vehicles?type=hire-purchase">{{ $t('contact.hirePurchase') }}</RouterLink>
        </div>

        <div class="footer-contact">
          <h4>{{ $t('footer.contact') }}</h4>
          <p>
            <font-awesome-icon icon="fa-solid fa-phone" />
            +255 712 345 678
          </p>
          <p>
            <font-awesome-icon icon="fa-regular fa-envelope" />
            info@quick-wheels.co.tz
          </p>
          <p>
            <font-awesome-icon icon="fa-solid fa-location-dot" />
            Dar es Salaam, Tanzania
          </p>
          <p>
            <font-awesome-icon icon="fa-regular fa-clock" />
            {{ $t('contact.hours') }}
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p v-html="copyrightText"></p>
        <div class="footer-bottom-links">
          <a href="#">{{ $t('footer.privacyPolicy') }}</a>
          <a href="#">{{ $t('footer.termsOfService') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSiteContentStore } from '@/stores/siteContent'

const { t } = useI18n()
const scStore = useSiteContentStore()

const copyrightText = computed(() => {
  return scStore.contents?.footer?.copyright || `&copy; ${new Date().getFullYear()} Quick-Wheels. ${t('footer.allRights')}`
})

onMounted(() => {
  scStore.fetchContents()
})
</script>

<style scoped>
.footer {
  background: rgba(10, 8, 24, 0.95);
  border-top: 1px solid rgba(0, 229, 255, 0.06);
  padding: 48px 24px 24px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 32px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1e1b5e, #00c4d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Syne", sans-serif;
  font-weight: 800;
  font-size: 0.8rem;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
}

.footer-desc {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 300px;
}

.footer-social {
  display: flex;
  gap: 10px;
}

.footer-social a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.footer-social a:hover {
  background: rgba(0, 196, 212, 0.15);
  border-color: rgba(0, 196, 212, 0.3);
  color: #00C4D4;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 196, 212, 0.15);
}

.footer-links h4,
.footer-contact h4 {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  font-size: 1rem;
}

.footer-links a {
  display: block;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  padding: 4px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: #00E5FF;
  transform: translateX(4px);
}

.footer-contact p {
  color: rgba(255, 255, 255, 0.4);
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-contact p:hover {
  color: rgba(255, 255, 255, 0.7);
}

.footer-contact p svg {
  color: rgba(255, 255, 255, 0.2);
  width: 16px;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.footer-contact p:hover svg {
  color: #00C4D4;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
}

.footer-bottom-links {
  display: flex;
  gap: 16px;
}

.footer-bottom-links a {
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-bottom-links a:hover {
  color: #00E5FF;
}

@media (max-width: 992px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  
  .footer-brand {
    grid-column: 1 / -1;
  }
  
  .footer-desc {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 20px 20px;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
    text-align: center;
  }
  
  .footer-brand {
    align-items: center;
    text-align: center;
  }
  
  .footer-logo {
    justify-content: center;
  }
  
  .footer-desc {
    max-width: 100%;
    text-align: center;
  }
  
  .footer-social {
    justify-content: center;
  }
  
  .footer-links {
    text-align: center;
  }
  
  .footer-links a {
    text-align: center;
  }
  
  .footer-links a:hover {
    transform: translateY(-2px);
  }
  
  .footer-contact {
    text-align: center;
  }
  
  .footer-contact h4 {
    text-align: center;
  }
  
  .footer-contact p {
    justify-content: center;
    padding: 6px 0;
  }
  
  .footer-contact p svg {
    width: 18px;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .footer-bottom-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 32px 16px 16px;
  }
  
  .footer-grid {
    gap: 24px;
  }
  
  .footer-social a {
    width: 40px;
    height: 40px;
  }
  
  .footer-contact p {
    font-size: 0.85rem;
    padding: 5px 0;
  }
  
  .footer-contact p svg {
    width: 16px;
    font-size: 0.85rem;
  }
  
  .footer-bottom p {
    font-size: 0.7rem;
  }
  
  .footer-bottom-links a {
    font-size: 0.7rem;
  }
}
</style>
