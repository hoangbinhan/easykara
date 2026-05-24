/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

// Translation map
const translations: Record<string, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  vi: vi as Record<string, unknown>,
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('easykara-lang') || 'en';
  });

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('easykara-lang', lang);
    }
  };

  const t = (path: string): string => {
    const parts = path.split('.');
    let current: unknown = translations[language] || translations['en'];

    for (const part of parts) {
      if (current == null || typeof current !== 'object') return path;
      current = (current as Record<string, unknown>)[part];
    }

    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
