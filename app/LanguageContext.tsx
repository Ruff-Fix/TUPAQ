import React, { createContext, useState, useContext } from 'react';
import i18next from '@/app/i18n';

const LanguageContext = createContext({
  language: i18next.language,
  setLanguage: (lang: string) => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState(i18next.language);

  const handleSetLanguage = (lang: string) => {
    i18next.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default function LanguageContextScreen() {
  return null; // Or a placeholder screen if this file is meant to be accessed as a route
}