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
    <Link
      href={href}
      className="group rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 transition-colors duration-150 hover:border-[var(--admin-border-fuerte)]"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--admin-texto-secundario)]">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)]">
            {value}
          </p>
        </div>
        <Icon className="h-5 w-5" style={{ color: "var(--page-primary-tinta)" }} />
      </div>
    </Link>
  );
}
