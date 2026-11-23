import type { ReactNode } from "react";

export function ItemLista({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-12 min-w-0 items-center justify-between gap-3 border-b border-[var(--admin-border)] py-2.5 last:border-b-0">
      {children}
    </div>
  );
}
