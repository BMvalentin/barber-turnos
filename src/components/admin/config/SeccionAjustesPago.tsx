import { InterruptorAdmin } from "@/components/admin/InterruptorAdmin";

interface SeccionAjustesPagoProps {
  mostrarAvisoSeniaPendiente: boolean;
  manejarCambio: (activo: boolean) => void;
}

export default function SeccionAjustesPago({
  mostrarAvisoSeniaPendiente,
  manejarCambio,
}: SeccionAjustesPagoProps) {
  return (
    <div className="flex items-start justify-between gap-4 sm:items-center sm:gap-8">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[var(--admin-texto-primario)]">
          Mostrar aviso de seña pendiente
        </h2>
        <p className="mt-1 max-w-prose text-sm leading-6 text-[var(--admin-texto-muted)]">
          Avisá al cliente que su turno se confirma cuando paga la seña.
        </p>
      </div>
      <InterruptorAdmin etiqueta="Mostrar aviso de seña pendiente" activo={mostrarAvisoSeniaPendiente} alCambiar={manejarCambio} />
    </div>
  );
}
