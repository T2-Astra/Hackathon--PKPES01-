import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslations, type Language, type Translations } from '@/lib/i18n';

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
  voiceLanguage: string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language;
      return stored || 'auto';
    }
    return 'auto';
  });

  const getVoiceLanguage = (lang: Language): string => {
    const voiceLanguageMap = {
      auto: 'en-IN',
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN'
    };
    return voiceLanguageMap[lang] || 'en-IN';
  };

  const getCurrentTranslations = (): Translations => {
    return getTranslations(language);
  };

  // Save language preference and trigger re-render
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const contextValue: LanguageContextProps = {
    language,
    setLanguage: handleLanguageChange,
    t: getCurrentTranslations(),
    voiceLanguage: getVoiceLanguage(language)
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
