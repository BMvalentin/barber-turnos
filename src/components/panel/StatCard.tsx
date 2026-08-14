// src/components/panel/StatCard.tsx

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  href: string;
};

export function StatCard({ title, value, icon: Icon, href }: StatCardProps) {
  return (
    <Link href={href}>
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 hover:border-[var(--page-primary)]/50 transition group">
        <div className="flex justify-between">
          <div>
            <p className="text-amber-200/70 text-sm">{title}</p>
            <p className="text-3xl text-white font-bold">{value}</p>
          </div>
          <Icon className="text-[var(--page-primary)]" />
        </div>
      </div>
    </Link>
  );
}
