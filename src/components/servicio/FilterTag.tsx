"use client";

import { X } from "lucide-react";

type FilterTagProps = {
  label: string;
  onRemove: () => void;
};

export default function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded"
      style={{
        backgroundColor: "var(--page-primary-15)",
        borderColor: "var(--page-primary-40)",
        color: "var(--page-primary)",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:text-[var(--admin-texto-primario)] transition-colors duration-150 leading-none"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}