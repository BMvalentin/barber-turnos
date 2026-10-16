import type { DocumentoLegal } from "@/lib/legal/tipos";

/* Borrador redactado a partir del funcionamiento real de la aplicación.
   NO está validado jurídicamente: requiere revisión profesional.
   Solo se describen reglas verificables en el código; lo no definido queda
   marcado como PENDIENTE DE DEFINICIÓN. */

export const DOCUMENTO_PAGOS: DocumentoLegal = {
  clave: "pagos",
  slug: "pagos-y-cancelaciones",
  titulo: "Condiciones de pagos, señas y cancelaciones",
  descripcion:
    "Cómo funcionan las reservas, las señas, los medios de pago y las cancelaciones.",
  version: "1.0.0",
  vigenteDesde: "2026-10-16",
  requiereAceptacion: false,
  pendientes: [
    "Política de reembolsos y devoluciones de señas o pagos: PENDIENTE DE DEFINICIÓN.",
    "Penalizaciones o consecuencias por ausencia (no presentarse al turno): PENDIENTE DE DEFINICIÓN.",
    "Plazo mínimo para cancelar sin consecuencias: PENDIENTE DE DEFINICIÓN.",
    "Tratamiento de reprogramaciones y sus condiciones: PENDIENTE DE DEFINICIÓN.",
  ],
  secciones: [
    {
      titulo: "1. Reserva de turnos",
      parrafos: [
        "Para reservar un turno como cliente es necesario tener una cuenta y un número de teléfono registrado, y elegir un servicio, un barbero y un horario disponible.",
        "Las reservas deben realizarse con una anticipación mínima de 10 minutos respecto del inicio del turno.",
        "La disponibilidad depende de los horarios y servicios configurados por la barbería.",
      ],
    },
    {
      titulo: "2. Señas",
      parrafos: [
        "Algunos servicios pueden requerir el pago de una seña. La seña se define por servicio y puede no estar configurada, en cuyo caso no se solicita pago anticipado.",
        "Cuando corresponde, el pago puede ser por el importe de la seña o por el valor total del servicio.",
      ],
    },
    {
      titulo: "3. Medios de pago",
      parrafos: [
        "Mercado Pago: la aplicación genera una operación de pago (Checkout Pro) por la seña o por el total del servicio. El resultado se confirma contra Mercado Pago.",
        "Transferencia bancaria: el usuario puede registrar una transferencia. En ese caso, el pago queda en estado «en acreditación» (pendiente de revisión) y no confirma el turno de forma automática.",
      ],
    },
    {
      titulo: "4. Estados de pago y su efecto en el turno",
      parrafos: [
        "Un turno comienza como «pendiente» y pasa a «confirmado» cuando el pago queda acreditado.",
        "Los estados de pago acreditados (señado, pagado o aprobado) marcan una reserva definitiva. Los estados pendiente, rechazado, cancelado o en acreditación no constituyen una reserva confirmada.",
        "Las reservas sin pago acreditado son temporales y expiran a los 30 minutos de su creación, liberando el horario.",
      ],
    },
    {
      titulo: "5. Cancelaciones",
      parrafos: [
        "El usuario dueño del turno (o un administrador de la barbería) puede cancelarlo. Al cancelarlo, el turno pasa al estado «cancelado».",
        "Las consecuencias de la cancelación sobre los importes ya pagados figuran como PENDIENTE DE DEFINICIÓN.",
      ],
    },
    {
      titulo: "6. Reembolsos, devoluciones y ausencias",
      parrafos: [
        "La aplicación no tiene definida actualmente una política de reembolsos, devoluciones, penalizaciones ni consecuencias por ausencia. Por lo tanto, esas condiciones figuran como PENDIENTE DE DEFINICIÓN.",
      ],
    },
  ],
};
