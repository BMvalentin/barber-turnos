"use client";

interface Props {
  estado: string;
  onChange: (estado: string) => void;
}

const OPCIONES_ESTADO: ReadonlyArray<{ valor: string; etiqueta: string }> = [
  { valor: "TODOS", etiqueta: "Todos" },
  { valor: "PENDIENTE", etiqueta: "Pendientes" },
  { valor: "CONFIRMADO", etiqueta: "Confirmados" },
  { valor: "COMPLETADO", etiqueta: "Completados" },
  { valor: "CANCELADO", etiqueta: "Cancelados" },
];

export default function TurnosFiltros({ estado, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {OPCIONES_ESTADO.map((opcion) => {
        const activo = opcion.valor === estado;
        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => onChange(opcion.valor)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              activo
                ? "bg-[var(--page-primary-15)] text-[var(--page-primary-tinta)] border border-[var(--page-primary-30)]"
                : "border border-transparent text-[var(--admin-texto-muted)] hover:text-[var(--admin-texto-primario)] hover:bg-white/5"
            }`}
          >
            {opcion.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
