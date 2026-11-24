import { CLASES_BOTON_MARCA } from "@/lib/constants";

export const CLASE_VISTA_PAGO = "flex min-h-svh items-center justify-center bg-[var(--page-bg)] px-4 pt-20 pb-6 text-[var(--page-bg-foreground)]";
const CLASE_ACCION = "flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-semibold [&_svg]:shrink-0";
export const CLASE_ACCION_PRINCIPAL = `${CLASE_ACCION} ${CLASES_BOTON_MARCA}`;
export const CLASE_ACCION_SECUNDARIA = `${CLASE_ACCION} control-publico border border-[var(--admin-border)] bg-[var(--admin-item)] text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item-hover)]`;
export const CLASE_ICONO_ESTADO = "mx-auto grid size-16 place-items-center rounded-xl";
