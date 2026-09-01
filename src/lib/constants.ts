import type { CSSProperties } from "react";

/* Zona horaria del negocio */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

/* Estados de turno (alineados al enum Prisma `turno_estado`) */
export const ESTADOS_TURNO = ["PENDIENTE", "CONFIRMADO", "COMPLETADO", "CANCELADO"] as const;

/* Estados que cuentan como turnos vigentes/activos */
export const ESTADOS_TURNO_ACTIVOS = ["PENDIENTE", "CONFIRMADO"] as const;

/* Estados de pago de la seña (alineados al enum Prisma `estado_pago`).
   Incluye los estados que setea el backend de Mercado Pago. */
export const ESTADOS_PAGO = [
  "PENDIENTE",
  "SEÑADO",
  "PAGADO",
  "APROBADO",
  "RECHAZADO",
  "CANCELADO",
  "EN_ACREDITACION",
] as const;

/* Estados de pago que se pueden seleccionar/cargar de forma MANUAL (sin Mercado Pago):
   el selector del admin y la acción de creación usan SOLO estos. */
export const ESTADOS_PAGO_MANUALES = ["PENDIENTE", "SEÑADO", "PAGADO"] as const;

/* Estados de pago ACREDITADOS (pago confirmado): marcan que el turno es una reserva
   definitiva. Un turno solo debe mostrarse en "Mis turnos" si su estadoPago está acá. */
export const ESTADOS_PAGO_ACREDITADOS = ["SEÑADO", "PAGADO", "APROBADO"] as const;

/* Estados de pago NO acreditados que representan una reserva temporal sin pago
   (o un pago fallido): candidatos a expirar/cancelar y que NO cuentan como reserva. */
export const ESTADOS_PAGO_EXPIRABLES = ["PENDIENTE", "RECHAZADO", "CANCELADO"] as const;

/* Ventana de vigencia de una reserva temporal sin pago. Alineada con la expiración
   de la preferencia de Mercado Pago (30 min): antes de ese límite el pago aún puede
   confirmar el turno; pasado el límite la reserva se libera y deja de bloquear el slot. */
export const EXPIRACION_TURNO_PENDIENTE_MS = 30 * 60 * 1000;

/* --- Semántica de estados de turno (NO confundir reserva temporal con confirmada) ---
   - Reserva temporal (impaga / en tránsito): estado = PENDIENTE, estadoPago en
     [PENDIENTE, RECHAZADO, CANCELADO, EN_ACREDITACION]. NO se muestra en "Mis turnos",
     NO es reserva definitiva y expira a los EXPIRACION_TURNO_PENDIENTE_MS.
   - Reserva confirmada: estado = CONFIRMADO (o COMPLETADO), estadoPago en
     [SEÑADO, PAGADO, APROBADO]. Solo un pago acreditado la produce.
*/

/* Tipos de pago de Mercado Pago (seña o valor total del servicio). */
export const TIPOS_PAGO = ["SEÑA", "TOTAL"] as const;

/* Anticipación mínima (ms) para reservar o reprogramar un turno */
export const MINIMO_ANTICIPACION_MS = 10 * 60 * 1000;

/* Días de la semana en el orden del enum Prisma `dias_laborales` (Lunes..Domingo), SIN acentos */
export const DIAS_SEMANA_DB = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"] as const;

/* Índice de JS `getDay()` (0 = Domingo) → nombre del enum Prisma `dias_laborales` */
export const MAPA_DIA_SEMANA_DB: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sabado",
};

/* Nombre del enum Prisma `dias_laborales` → índice de JS `getDay()` (0 = Domingo) */
export const REVERSE_MAPA_DIA_SEMANA_DB: Record<string, number> = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sabado: 6,
};

/* Nombres de días para render de UI, en orden `getDay()` (0 = Domingo), CON acentos */
export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

/* Abreviaturas de días para encabezados de calendario (Dom primero) */
export const ABREVIATURAS_DIAS = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"] as const;

/* Selección de usuario básica (id, name, email, telefono) */
export const SELECCION_USUARIO_BASICA = { id: true, name: true, email: true, telefono: true } as const;

/* Estilo de fondo sólido de marca (botones, íconos, chips) */
export const ESTILO_FONDO_MARCA: CSSProperties = {
  backgroundColor: "var(--page-primary)",
};

/* Trío de clases de marca: fondo sólido + hover + texto legible */
export const CLASES_BOTON_MARCA =
  "bg-[var(--page-primary)] hover:bg-[var(--page-primary-hover)] text-[var(--page-primary-foreground)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-background)]";

/* Botón "X" de cierre de modales (consistente con ui/dialog) */
export const CLASES_BOTON_CERRAR =
  "rounded-sm p-1 transition-all duration-150 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)] focus:ring-offset-2 focus:ring-offset-[var(--admin-background)] disabled:pointer-events-none bg-[var(--page-primary)] hover:bg-[var(--page-primary-hover)] text-[var(--page-primary-foreground)] hover:cursor-pointer flex items-center justify-center";

/* TTL de los locks de slots (única fuente; lo usan el hook y las rutas REST) */
export const TTL_LOCK_SLOT_MS = 5 * 60 * 1000;
