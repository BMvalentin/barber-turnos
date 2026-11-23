import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

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
      className="admin-card grid content-between gap-3 p-3.5 transition-colors duration-150 hover:bg-[var(--admin-surface-elevated)] sm:p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <Icon className="size-[18px] text-[var(--page-primary-tinta)]" aria-hidden="true" />
        <ArrowUpRight className="size-4 text-[var(--admin-texto-muted)]" aria-hidden="true" />
      </div>
      <div className="grid min-w-0 gap-1">
        <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums sm:text-[1.75rem]">
          {value.toLocaleString("es-AR")}
        </span>
        <span className="text-xs font-medium text-[var(--admin-texto-secundario)] sm:text-sm">
          {title}
        </span>
      </div>
    </Link>
  );
}
