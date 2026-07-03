import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sw from './locales/sw.json'

const messages = { en, sw }

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
