import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/en.json';
import nb from '@/i18n/nb.json';
import pl from '@/i18n/pl.json';
import { Platform } from 'react-native';

const resources = {
  en: { translation: en },
  nb: { translation: nb },
  pl: { translation: pl },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: Platform.OS === 'android' ? 'v3' : undefined,
  resources,
  lng: 'nb', // Set the default language
  fallbackLng: 'en', // Set the fallback language
  interpolation: { escapeValue: false },
});

export default i18n;