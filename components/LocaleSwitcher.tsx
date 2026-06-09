import type { Locale } from "@/lib/dictionaries";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="segmented" aria-label="Language">
      <a aria-current={locale === "ko"} href="?locale=ko">
        KO
      </a>
      <a aria-current={locale === "en"} href="?locale=en">
        EN
      </a>
    </div>
  );
}
