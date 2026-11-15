"use client";

import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
}

/**
 * Dialog dengan perilaku yang benar: Escape menutup, fokus dikurung di dalam,
 * fokus kembali ke elemen pemicu saat ditutup, dan judul terhubung lewat aria-labelledby.
 */
export default function Dialog({ open, title, children, footer, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const titleId = panel?.getAttribute("aria-labelledby") ?? undefined;

    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    focusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previous && document.contains(previous)) previous.focus();
      void titleId;
    };
  }, [open]);

  if (!open) return null;

  const titleId = `dialog-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-ink/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card my-auto w-full max-w-md p-5 sm:p-6"
      >
        <h2 id={titleId} className="font-serif text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}
