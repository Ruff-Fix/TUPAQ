import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/en.json';
import nb from '@/i18n/nb.json';
import pl from '@/i18n/pl.json';

const resources = {
  en: { translation: en },
  nb: { translation: nb },
  pl: { translation: pl },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: 'nb',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;