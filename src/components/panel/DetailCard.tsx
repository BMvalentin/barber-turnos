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
    <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-[var(--page-primary)]" />
        <h2 className="text-white font-bold">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
