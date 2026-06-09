export const FLASH_TOAST_COOKIE = "volt_flash_toast";

export type FlashToastKind = "saved" | "deleted";

export type FlashToast = {
  id: string;
  kind: FlashToastKind;
};
