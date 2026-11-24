interface Props {
  estado: string;
  vistaAdministrativa?: boolean;
}

const MAPA_ESTADOS: Record<string, { etiqueta: string; clases: string }> = {
  PENDIENTE: {
    etiqueta: "Pendiente",
    clases: "text-amber-900 bg-amber-50 border-amber-300",
  },
  SEÑADO: {
    etiqueta: "Señado",
    clases: "text-sky-900 bg-sky-50 border-sky-300",
  },
  PAGADO: {
    etiqueta: "Pagado",
    clases: "text-emerald-900 bg-emerald-50 border-emerald-300",
  },
  APROBADO: {
    etiqueta: "Aprobado",
    clases: "text-emerald-900 bg-emerald-50 border-emerald-300",
  },
  RECHAZADO: {
    etiqueta: "Rechazado",
    clases: "text-red-900 bg-red-50 border-red-300",
  },
  CANCELADO: {
    etiqueta: "Cancelado",
    clases: "text-zinc-900 bg-zinc-100 border-zinc-300",
  },
  EN_ACREDITACION: {
    etiqueta: "En acreditación",
    clases: "text-yellow-900 bg-yellow-50 border-yellow-300",
  },
};

const ESTADO_FALLBACK = {
  etiqueta: "Desconocido",
  clases: "text-zinc-900 bg-zinc-100 border-zinc-300",
};

const TONOS_ESTADO_ADMIN: Record<string, string> = {
  PENDIENTE: "aviso",
  SEÑADO: "info",
  PAGADO: "exito",
  APROBADO: "exito",
  RECHAZADO: "error",
  EN_ACREDITACION: "aviso",
};

export default function BadgeEstadoPago({ estado, vistaAdministrativa = false }: Props) {
  const config = MAPA_ESTADOS[estado] ?? ESTADO_FALLBACK;
  const clases = vistaAdministrativa
    ? "admin-estado"
    : `border ${config.clases}`;

  return (
    <span
      data-tono-estado={vistaAdministrativa ? TONOS_ESTADO_ADMIN[estado] : undefined}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${clases}`}
    >
      {!vistaAdministrativa && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      Pago: {config.etiqueta}
    </span>
  );
}
