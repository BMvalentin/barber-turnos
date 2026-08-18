// src/components/panel/DetailCard.tsx

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DetailCardProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function DetailCard({ title, icon: Icon, children }: DetailCardProps) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--admin-border)]">
        <Icon className="h-4 w-4" style={{ color: "var(--page-primary-tinta)" }} />
        <h2 className="text-sm font-semibold text-[var(--admin-texto-primario)]">
          {title}
        </h2>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
