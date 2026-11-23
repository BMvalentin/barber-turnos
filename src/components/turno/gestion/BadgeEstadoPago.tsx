interface Props {
  estado: string;
  vistaAdministrativa?: boolean;
}

const MAPA_ESTADOS: Record<string, { etiqueta: string; clases: string }> = {
  PENDIENTE: {
    etiqueta: "Pendiente",
    clases: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  SEÑADO: {
    etiqueta: "Señado",
    clases: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  },
  PAGADO: {
    etiqueta: "Pagado",
    clases: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  APROBADO: {
    etiqueta: "Aprobado",
    clases: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  RECHAZADO: {
    etiqueta: "Rechazado",
    clases: "text-red-400 bg-red-400/10 border-red-400/20",
  },
  CANCELADO: {
    etiqueta: "Cancelado",
    clases: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
  },
  EN_ACREDITACION: {
    etiqueta: "En acreditación",
    clases: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
};

const ESTADO_FALLBACK = {
  etiqueta: "Desconocido",
  clases: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
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
