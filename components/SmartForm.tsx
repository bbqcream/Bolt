"use client";

import {
  type FormHTMLAttributes,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";

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
  const formRef = useRef<HTMLFormElement>(null);
  const initialSnapshotRef = useRef("");
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
      event.preventDefault();
      event.returnValue = dirtyWarningMessage ?? "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirtyWarningMessage, isDirty, warnOnDirtyExit]);

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

        setIsDirty(false);
        onSubmit?.(event);
      }}
    >
      {children}
    </form>
  );
}
