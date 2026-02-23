"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onCancel]);

  if (!mounted) return null;

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "var(--mt-modal-overlay)" }}
          onClick={onCancel}
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md shadow-2xl"
            style={{
              background: "var(--mt-modal-bg)",
              border: "1px solid var(--mt-border-default)",
              borderRadius: "var(--mt-modal-radius)",
              padding: "var(--mt-modal-padding)",
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold"
              style={{ color: "var(--mt-text-primary)" }}
            >
              {title}
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--mt-text-secondary)" }}
            >
              {description}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="mt-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="mt-btn-danger px-4 py-2 text-sm"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(dialog, document.body);
}
