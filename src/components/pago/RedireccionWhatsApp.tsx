import { MessageCircle } from "lucide-react";
import { formatearFecha } from "@/lib/utils/formatear-fecha";
import { formatearHora } from "@/lib/utils/formatear-hora";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

type Props = {
  numeroWhatsApp: string;
  servicioNombre?: string;
  barberoNombre?: string;
  clienteNombre?: string | null;
  horarioReservado?: string | Date | null;
  precioTotal?: number;
  señaPagada?: number;
  saldoPendiente?: number;
  tipoPago?: string | null;
  estadoPago?: string | null;
};

const ESTADOS_LEGIBLES: Record<string, string> = {
  SEÑADO: "Seña pagada",
  PAGADO: "Pago total",
  APROBADO: "Aprobado",
  EN_ACREDITACION: "En acreditación",
  PENDIENTE: "Pendiente de pago",
};

const etiquetaTipoPago = (tipoPago?: string | null): string => {
  if (tipoPago === "TOTAL") return "Pago total";
  if (tipoPago === "SEÑA") return "Seña";
  return "Seña";
};

export default function RedireccionWhatsApp({
  numeroWhatsApp,
  servicioNombre,
  barberoNombre,
  clienteNombre,
  horarioReservado,
  precioTotal,
  señaPagada,
  saldoPendiente,
  tipoPago,
  estadoPago,
}: Props) {
  const numeroLimpio = (numeroWhatsApp || "").replace(/\D/g, "");
  if (!numeroLimpio) return null;

  const partes: string[] = ["Hola! Confirmé mi turno:"];

  if (horarioReservado) {
    const fecha = new Date(horarioReservado);
    if (!isNaN(fecha.getTime())) {
      const dia = formatearFecha(fecha);
      const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
      partes.push(`📅 Día: ${diaCapitalizado}`);
      partes.push(`⏰ Horario: ${formatearHora(fecha)}`);
    }
  }

  if (servicioNombre) partes.push(`✂️ Servicio: ${servicioNombre}`);
  if (barberoNombre) partes.push(`💈 Barbero: ${barberoNombre}`);
  if (clienteNombre) partes.push(`👤 Cliente: ${clienteNombre}`);
  if (precioTotal != null) partes.push(`💰 Precio total: $${formatearMoneda(precioTotal)}`);
  if (tipoPago) partes.push(`💳 Tipo de pago: ${etiquetaTipoPago(tipoPago)}`);
  if (señaPagada != null) partes.push(`💵 Seña pagada: $${formatearMoneda(señaPagada)}`);
  if (saldoPendiente != null) partes.push(`⏳ Saldo a abonar en el local: $${formatearMoneda(saldoPendiente)}`);
  if (estadoPago) partes.push(`✔️ Estado: ${ESTADOS_LEGIBLES[estadoPago] ?? estadoPago}`);

  const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(partes.join("\n"))}`;

  return (
    <a
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="control-publico flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-100 px-4 py-2.5 text-center text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-200"
    >
      <MessageCircle aria-hidden="true" className="size-5 shrink-0" />
      Compartir por WhatsApp
    </a>
  );
}
