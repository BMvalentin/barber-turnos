"use client";

import { FormularioFeriadoYCierre } from "@/componentes/panel/horarios/feriados-y-cierres/formulario-feriado-y-cierre";
import { ListaFeriadosYCierres } from "@/componentes/panel/horarios/feriados-y-cierres/lista-feriados-y-cierres";
import type { Barbero } from "@/types/barbero";
import type { ExcepcionLaboral } from "@/types/excepcion";

type FeriadosYCierresClienteProps = {
  excepciones: ExcepcionLaboral[];
  barberos: Barbero[];
};

export function FeriadosYCierresCliente({
  excepciones,
  barberos,
}: FeriadosYCierresClienteProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <div className="border-b border-[var(--admin-border)] px-4 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-[var(--admin-texto-primario)]">
              Agregar cierre
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
              Podés aplicarlo a toda la barbería o a una persona en particular.
            </p>
          </div>
        </div>
        <FormularioFeriadoYCierre barberos={barberos} />
      </div>
      <div className="px-4 py-5 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--admin-texto-primario)]">
              Próximos y registrados
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
              {excepciones.length === 1
                ? "1 cierre configurado"
                : `${excepciones.length} cierres configurados`}
            </p>
          </div>
        </div>
        <ListaFeriadosYCierres excepciones={excepciones} />
      </div>
    </section>
  );
}
