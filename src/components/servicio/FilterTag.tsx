"use client";

import { X } from "lucide-react";

type FilterTagProps = {
  label: string;
  onRemove: () => void;
};

export default function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <button
      type="button"
      aria-label={`Quitar filtro ${label}`}
      onClick={onRemove}
      className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg bg-[var(--page-primary-soft)] px-3 text-sm font-medium text-[var(--admin-acento-suave-texto)] hover:bg-[var(--admin-item)]"
    >
      <span className="truncate">{label}</span>
      <X aria-hidden="true" className="size-3.5 shrink-0" />
    </button>
  );
}
