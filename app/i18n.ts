import { initReactI18next } from "react-i18next";
import en from '@/i18n/en.json';
import nb from '@/i18n/nb.json';
import pl from '@/i18n/pl.json';

const resources = {
  en: { translation: en },
  nb: { translation: nb },
  pl: { translation: pl },
};

const i18n = initReactI18next({
  resources,
  lng: 'en', // Set the default language
  fallbackLng: 'en', // Set the fallback language
  interpolation: { escapeValue: false },
});

export default i18n;