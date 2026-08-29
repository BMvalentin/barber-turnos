interface Props {
  estado: string;
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
};

const ESTADO_FALLBACK = {
  etiqueta: "Desconocido",
  clases: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

export default function BadgeEstadoPago({ estado }: Props) {
  const config = MAPA_ESTADOS[estado] ?? ESTADO_FALLBACK;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.clases}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.etiqueta}
    </span>
  );
}
