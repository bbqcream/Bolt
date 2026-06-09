"use client";

import { useEffect, useState } from "react";
import { FLASH_TOAST_COOKIE, type FlashToast } from "@/lib/flash-toast";

type FlashToastProps = {
  toast: FlashToast | null;
  message: string;
};

export function FlashToast({ toast, message }: FlashToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!toast) return;

    document.cookie = `${FLASH_TOAST_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast || !visible) return null;

  return (
    <div
      aria-live="polite"
      className="flash-toast"
      role="status"
    >
      <span className="flash-toast-dot" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
