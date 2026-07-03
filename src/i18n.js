import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sw from './locales/sw.json'
import fr from './locales/fr.json'
import es from './locales/es.json'
import pt from './locales/pt.json'
import ar from './locales/ar.json'
import zh from './locales/zh.json'
import hi from './locales/hi.json'
import ru from './locales/ru.json'
import ja from './locales/ja.json'
import de from './locales/de.json'
import it from './locales/it.json'
import ko from './locales/ko.json'
import tr from './locales/tr.json'
import vi from './locales/vi.json'

const messages = { en, sw, fr, es, pt, ar, zh, hi, ru, ja, de, it, ko, tr, vi }

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
