import { CLASES_BOTON_MARCA } from "@/lib/constants";

export const CLASE_ETIQUETA = "block text-sm font-semibold text-[var(--admin-texto-primario)]";
export const CLASE_ICONO_CAMPO = "pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[var(--admin-texto-muted)]";
export const CLASE_CAMPO = "min-h-12 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] py-2.5 pl-11 text-base text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]";
export const CLASE_VER_PASSWORD = "absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]";
export const CLASE_ENVIO = `flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-bold ${CLASES_BOTON_MARCA} disabled:opacity-50`;
export const CLASE_ENLACE = "rounded-sm font-semibold text-[var(--page-primary-tinta)] underline underline-offset-4 decoration-current/50 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]";
export const CLASE_VOLVER = "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm text-sm font-semibold text-[var(--admin-texto-secundario)] transition-colors hover:text-[var(--admin-texto-primario)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]";
export const CLASE_ERROR = "text-sm text-[var(--page-error)]";
