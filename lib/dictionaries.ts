import en from "@/dictionaries/en.json";
import ko from "@/dictionaries/ko.json";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const dictionaries = { ko, en };

export function isLocale(locale: string | null | undefined): locale is Locale {
  return locale === "ko" || locale === "en";
}

export function getDictionaryForLocale(locale: Locale) {
  return dictionaries[locale];
}
