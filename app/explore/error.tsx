"use client";

import { getClientDictionary } from "@/lib/client-i18n";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const dict = getClientDictionary();

  return (
    <div className="empty-state">
      <p>{dict.status.exploreError}</p>
      <button className="solid-button" onClick={reset} type="button">
        {dict.common.retry}
      </button>
    </div>
  );
}
