interface Props {
  estado: string;
  vistaAdministrativa?: boolean;
}

const MAPA_ESTADOS: Record<string, { etiqueta: string; clases: string }> = {
  PENDIENTE: {
    etiqueta: "Pendiente",
    clases: "text-amber-900 bg-amber-50 border-amber-300",
  },
  CONFIRMADO: {
    etiqueta: "Confirmado",
    clases: "text-emerald-900 bg-emerald-50 border-emerald-300",
  },
  COMPLETADO: {
    etiqueta: "Completado",
    clases: "text-emerald-900 bg-emerald-50 border-emerald-300",
  },
  CANCELADO: {
    etiqueta: "Cancelado",
    clases: "text-red-900 bg-red-50 border-red-300",
  },
};

const ESTADO_FALLBACK = {
  etiqueta: "Desconocido",
  clases: "text-zinc-900 bg-zinc-100 border-zinc-300",
};

const TONOS_ESTADO_ADMIN: Record<string, string> = {
  PENDIENTE: "aviso",
  CONFIRMADO: "exito",
  CANCELADO: "error",
};

export default function BadgeEstadoTurno({ estado, vistaAdministrativa = false }: Props) {
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
      <span>
        <span className={vistaAdministrativa ? "sr-only" : undefined}>Turno: </span>
        {config.etiqueta}
      </span>
    </span>
  );
}
