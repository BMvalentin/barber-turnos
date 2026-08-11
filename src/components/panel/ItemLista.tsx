// src/components/panel/ItemLista.tsx

import type { ReactNode } from "react";

type ItemListaProps = {
  children: ReactNode;
};

export function ItemLista({ children }: ItemListaProps) {
  return (
    <div className="p-3 bg-black/60 border border-amber-900/30 rounded-lg hover:border-[var(--page-primary)]/50 transition">
      {children}
    </div>
  );
}
