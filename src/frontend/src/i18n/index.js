import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import pt from './locales/pt.json';

const messages = {
  en,
  es,
  fr,
  ru,
  zh,
  pt
};

const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages,
  globalInjection: true
});

export default i18n; 