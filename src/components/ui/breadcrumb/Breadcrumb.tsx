import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type ItemBreadcrumb = {
  etiqueta: string;
  href?: string;
};

type Props = {
  items: ItemBreadcrumb[];
};

export function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, indice) => {
          const esUltimo = indice === items.length - 1;
          return (
            <li key={item.etiqueta} className="flex items-center gap-1">
              {indice > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--admin-texto-muted)]" />
              )}
              {esUltimo ? (
                <span className="font-medium text-[var(--admin-texto-primario)]">
                  {item.etiqueta}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--page-primary-tinta)]"
                >
                  {item.etiqueta}
                </Link>
              ) : (
                <span className="text-[var(--admin-texto-muted)]">{item.etiqueta}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
