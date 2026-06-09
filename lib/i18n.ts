import { cookies } from "next/headers";
import {
  dictionaries,
  isLocale,
  type Locale,
} from "@/lib/dictionaries";

export type { Locale } from "@/lib/dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("volt_locale")?.value;
  return isLocale(locale) ? locale : "ko";
}

export async function getDictionary() {
  const locale = await getLocale();
  return dictionaries[locale];
}
