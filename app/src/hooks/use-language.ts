import { useState, useEffect, useCallback } from 'react';
import { getLanguage, setLanguage as saveLanguage } from '@/constants/api';
import { getLanguageCode } from '@/constants/languages';

const DEFAULT_LANGUAGE = 'en';

export function useLanguage() {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await getLanguage();
        if (saved) {
          setLanguageState(saved);
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    try {
      await saveLanguage(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  const languageCode = getLanguageCode(language);

  return { language, languageCode, isLoading, setLanguage };
}
