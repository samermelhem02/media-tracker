"use client";

import { useState, useRef, useEffect } from "react";

const triggerClass =
  "w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2.5 text-left text-sm text-zinc-100 focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-colors flex items-center justify-between gap-2";

export function CustomSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "All",
  openUp = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | { value: string; label: string }[];
  placeholder?: string;
  /** When true, dropdown opens above the trigger to avoid overlapping content below */
  openUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const selectedLabel = value ? items.find((o) => o.value === value)?.label ?? value : placeholder;

  return (
    <div ref={ref} className="relative min-w-0 flex-1 sm:max-w-[140px]">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 z-50 max-h-56 overflow-auto rounded-lg border border-zinc-600 bg-zinc-800 py-1 shadow-xl ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <li role="option">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                !value
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "text-zinc-200 hover:bg-white/15"
              }`}
            >
              {placeholder}
            </button>
          </li>
          {items.map((opt) => (
            <li key={opt.value} role="option">
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm capitalize transition-colors ${
                  value === opt.value
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-zinc-200 hover:bg-white/15"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
