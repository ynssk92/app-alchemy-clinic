import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import { initAutoTranslate, setAutoTranslateLanguage } from "@/lib/autoTranslate";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "ladune_lang",
      caches: ["localStorage"],
    },
  });

if (!localStorage.getItem("ladune_lang")) {
  i18n.changeLanguage("fr");
}

const initial = (i18n.resolvedLanguage || i18n.language || "fr").slice(0, 2) as "fr" | "en";
document.documentElement.lang = initial;
initAutoTranslate(initial);

i18n.on("languageChanged", (lng) => {
  const code = (lng || "fr").slice(0, 2) as "fr" | "en";
  document.documentElement.lang = code;
  setAutoTranslateLanguage(code);
});

export default i18n;
