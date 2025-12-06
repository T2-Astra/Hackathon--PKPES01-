import { useState, useEffect } from 'react';
import { getTranslations, type Language, type Translations } from '@/lib/i18n';

export type { Language };

interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  voiceCode: string; // For speech recognition
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageConfig> = {
  auto: {
    code: 'auto',
    name: 'Auto-detect',
    nativeName: 'Auto-detect',
    voiceCode: 'en-IN'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    voiceCode: 'en-IN'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    voiceCode: 'hi-IN'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    voiceCode: 'mr-IN'
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language;
      return stored || 'auto';
    }
    return 'auto';
  });

  const getCurrentLanguage = (): LanguageConfig => {
    if (language === 'auto') {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('hi')) {
        return SUPPORTED_LANGUAGES.hi;
      } else if (browserLang.startsWith('mr')) {
        return SUPPORTED_LANGUAGES.mr;
      } else {
        return SUPPORTED_LANGUAGES.en;
      }
    }
    return SUPPORTED_LANGUAGES[language];
  };

  const getVoiceLanguage = (): string => {
    return getCurrentLanguage().voiceCode;
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const getTranslationsForLanguage = (): Translations => {
    return getTranslations(language);
  };

  return {
    language,
    setLanguage,
    currentLanguage: getCurrentLanguage(),
    voiceLanguage: getVoiceLanguage(),
    supportedLanguages: SUPPORTED_LANGUAGES,
    t: getTranslationsForLanguage() // Translations object
  };
}
