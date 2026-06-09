"use client";

import { dictionaries, isLocale, type Locale } from "@/lib/dictionaries";

export function getClientLocale(): Locale {
  if (typeof document === "undefined") {
    return "ko";
  }

  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : "ko";
}

export function getClientDictionary() {
  return dictionaries[getClientLocale()];
}
