"use client";

interface Props {
  estado: string;
  onChange: (estado: string) => void;
  mostrarTodos?: boolean;
}

const OPCIONES_ESTADO: ReadonlyArray<{ valor: string; etiqueta: string }> = [
  { valor: "TODOS", etiqueta: "Todos" },
  { valor: "PENDIENTE", etiqueta: "Pendientes" },
  { valor: "CONFIRMADO", etiqueta: "Confirmados" },
  { valor: "COMPLETADO", etiqueta: "Completados" },
  { valor: "CANCELADO", etiqueta: "Cancelados" },
];

export default function TurnosFiltros({ estado, onChange, mostrarTodos = true }: Props) {
  const opcionesVisibles = mostrarTodos
    ? OPCIONES_ESTADO
    : OPCIONES_ESTADO.filter((opcion) => opcion.valor !== "TODOS");

  return (
    <div
      role="group"
      aria-label="Filtrar por estado del turno"
      className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--admin-item)] p-1 sm:flex sm:w-fit"
    >
      {opcionesVisibles.map((opcion) => {
        const activo = opcion.valor === estado;
        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => onChange(opcion.valor)}
            aria-pressed={activo}
            className={`min-h-10 rounded-lg px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)] sm:px-3 sm:text-sm ${
              activo
                ? "bg-[var(--admin-surface)] text-[var(--page-primary-tinta)] shadow-sm"
                : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]"
            }`}
          >
            {opcion.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
