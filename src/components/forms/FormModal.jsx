"use client";
import React from "react";

export default function FormModal({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-3xl border border-neutral-200/70 bg-white/95 p-6 shadow-xl dark:border-neutral-800/70 dark:bg-neutral-900/95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-transparent p-1 text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-900 dark:hover:border-neutral-700 dark:hover:text-neutral-100"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="mb-4 pr-6">
          <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  );
}
