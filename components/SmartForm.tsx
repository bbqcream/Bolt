"use client";

import {
  type FormHTMLAttributes,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type SmartFormProps = PropsWithChildren<
  Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
    action?: FormHTMLAttributes<HTMLFormElement>["action"];
    confirmMessage?: string;
    enableSaveShortcut?: boolean;
    warnOnDirtyExit?: boolean;
    dirtyWarningMessage?: string;
  }
>;

function serializeForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  return JSON.stringify(
    Array.from(formData.entries()).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey),
    ),
  );
}

export function SmartForm({
  action,
  children,
  className,
  confirmMessage,
  dirtyWarningMessage,
  enableSaveShortcut = false,
  onChange,
  onInput,
  onSubmit,
  warnOnDirtyExit = false,
  ...props
}: SmartFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const initialSnapshotRef = useRef("");
  const bypassPromptRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    initialSnapshotRef.current = serializeForm(form);
  }, []);

  useEffect(() => {
    if (!enableSaveShortcut) return;

    function handleKeydown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") {
        return;
      }

      const form = formRef.current;
      const activeElement = document.activeElement;
      if (!form || !(activeElement instanceof Node) || !form.contains(activeElement)) {
        return;
      }

      event.preventDefault();
      form.requestSubmit();
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [enableSaveShortcut]);

  useEffect(() => {
    if (!warnOnDirtyExit || !isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (bypassPromptRef.current) return;
      event.preventDefault();
      event.returnValue = dirtyWarningMessage ?? "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirtyWarningMessage, isDirty, warnOnDirtyExit]);

  useEffect(() => {
    if (!warnOnDirtyExit || !isDirty) return;

    function handleDocumentClick(event: MouseEvent) {
      if (bypassPromptRef.current || event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.href === currentUrl.href) return;

      const shouldLeave = window.confirm(dirtyWarningMessage ?? "");
      if (!shouldLeave) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      bypassPromptRef.current = true;
      setIsDirty(false);

      if (nextUrl.origin === currentUrl.origin) {
        router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
        return;
      }

      window.location.assign(nextUrl.href);
    }

    function handlePopState() {
      if (bypassPromptRef.current) return;

      const shouldLeave = window.confirm(dirtyWarningMessage ?? "");
      if (shouldLeave) {
        bypassPromptRef.current = true;
        setIsDirty(false);
        return;
      }

      bypassPromptRef.current = true;
      window.history.go(1);
      window.setTimeout(() => {
        bypassPromptRef.current = false;
      }, 0);
    }

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [dirtyWarningMessage, isDirty, router, warnOnDirtyExit]);

  function handleDirtyState() {
    const form = formRef.current;
    if (!form) return;
    setIsDirty(serializeForm(form) !== initialSnapshotRef.current);
  }

  return (
    <form
      {...props}
      ref={formRef}
      action={action}
      className={className}
      onChange={(event) => {
        handleDirtyState();
        onChange?.(event);
      }}
      onInput={(event) => {
        handleDirtyState();
        onInput?.(event);
      }}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }

        bypassPromptRef.current = true;
        setIsDirty(false);
        onSubmit?.(event);
      }}
    >
      {children}
    </form>
  );
}
