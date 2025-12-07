
import { useState, useEffect } from 'react';
import { Language } from '../types';

const STORAGE_KEY = 'ownima_lang';

export const useLanguage = (initial: Language = 'en') => {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as Language) || initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    // Optional: Update HTML tag for accessibility tools
    document.documentElement.lang = lang;
  }, [lang]);

  return { lang, setLang };
};
