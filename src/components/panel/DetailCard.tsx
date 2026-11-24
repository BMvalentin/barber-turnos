import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DetailCardProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function DetailCard({ title, icon: Icon, children }: DetailCardProps) {
  return (
    <section className="admin-card">
      <div className="flex items-center gap-2.5 border-b border-[var(--admin-border)] px-4 py-3.5 sm:px-5">
        <Icon className="size-[17px] shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="px-4 sm:px-5">{children}</div>
    </section>
  );
}
