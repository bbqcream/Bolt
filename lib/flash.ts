import { cookies } from "next/headers";
import {
  FLASH_TOAST_COOKIE,
  type FlashToast,
  type FlashToastKind,
} from "@/lib/flash-toast";

export async function setFlashToast(kind: FlashToastKind) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_TOAST_COOKIE, `${kind}:${Date.now()}`, {
    path: "/",
    sameSite: "lax",
    maxAge: 10,
  });
}

export async function getFlashToast() {
  const cookieStore = await cookies();
  const value = cookieStore.get(FLASH_TOAST_COOKIE)?.value;
  if (!value) return null;

  const [kind, id] = value.split(":");
  if ((kind === "saved" || kind === "deleted") && id) {
    return { kind, id } as FlashToast;
  }

  return null;
}
