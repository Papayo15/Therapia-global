import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en", "pt", "fr", "de", "ru", "ar", "ja", "zh", "hi"],   // solo los que tienen messages/<lang>.json
  defaultLocale: "es",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  pt: "🇧🇷",
  de: "🇩🇪",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ru: "🇷🇺",
  ar: "🇸🇦",
  hi: "🇮🇳",
};

export const rtlLocales: Locale[] = ["ar"];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
