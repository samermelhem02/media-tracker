"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClassName?: string; // e.g. "max-w-2xl"
};

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-2xl",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // prevent background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal shell */}
      <div
        className={[
          "relative z-[10000] w-[92vw] rounded-2xl border border-white/10",
          "bg-zinc-950/70 shadow-2xl backdrop-blur-xl",
          "max-h-[85vh] overflow-hidden",
          maxWidthClassName,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="text-sm font-semibold text-zinc-100">{title ?? ""}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-200 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* content (scrolls) */}
        <div className="max-h-[calc(85vh-56px)] overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
