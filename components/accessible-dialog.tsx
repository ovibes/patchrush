"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type AccessibleDialogProps = {
  id?: string;
  open: boolean;
  onClose(): void;
  labelledBy: string;
  describedBy?: string;
  className: string;
  children: ReactNode;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function AccessibleDialog({
  id,
  open,
  onClose,
  labelledBy,
  describedBy,
  className,
  children
}: AccessibleDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !backdropRef.current) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const backdrop = backdropRef.current;
    const previousOverflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children)
      .filter((element) => element !== backdrop)
      .map((element) => {
        const htmlElement = element as HTMLElement;
        return {
          element: htmlElement,
          inert: htmlElement.inert,
          ariaHidden: htmlElement.getAttribute("aria-hidden")
        };
      });

    document.body.style.overflow = "hidden";
    siblings.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const frame = window.requestAnimationFrame(() => {
      const preferred = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      const first = panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (preferred || first || panelRef.current)?.focus();
    });
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      siblings.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="dialog-backdrop"
      ref={backdropRef}
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        id={id}
        className={className}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key !== "Tab" || !panelRef.current) return;
          const focusable = Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
          );
          if (!focusable.length) {
            event.preventDefault();
            panelRef.current.focus();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (
            event.shiftKey &&
            (document.activeElement === first || document.activeElement === panelRef.current)
          ) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
