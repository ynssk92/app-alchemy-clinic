import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase } from '@/integrations/supabase/client';

import commonEn from './locales/en/common.json';
import commonFr from './locales/fr/common.json';
import commonAr from './locales/ar/common.json';

const resources = {
  en: {
    common: commonEn,
  },
  fr: {
    common: commonFr,
  },
  ar: {
    common: commonAr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ladune_lang',
      caches: ['localStorage'],
    },
  });

// Handle RTL for Arabic
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Load overrides from Supabase
const loadOverrides = async () => {
  try {
    const { data, error } = await supabase
      .from('translation_overrides')
      .select('lang, key, value');

    if (error) throw error;

    if (data && data.length > 0) {
      data.forEach((override) => {
        i18n.addResource(override.lang, 'common', override.key, override.value);
      });
    }
  } catch (err) {
    console.error('Failed to load translation overrides:', err);
  }
};

// Start loading overrides in the background
loadOverrides();

// Initial set
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;