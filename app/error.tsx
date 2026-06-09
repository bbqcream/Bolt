"use client";

import { getClientDictionary } from "@/lib/client-i18n";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = getClientDictionary();

  return (
    <main className="auth-page">
      <div className="panel auth-panel">
        <h1>{dict.status.error}</h1>
        <button className="solid-button" onClick={reset} type="button">
          {dict.common.retry}
        </button>
      </div>
    </main>
  );
}
