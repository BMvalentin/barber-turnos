// src/components/panel/ItemLista.tsx

import type { ReactNode } from "react";

type ItemListaProps = {
  children: ReactNode;
};

export function ItemLista({ children }: ItemListaProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--admin-border)" }}
    >
      {children}
    </div>
  );
}
