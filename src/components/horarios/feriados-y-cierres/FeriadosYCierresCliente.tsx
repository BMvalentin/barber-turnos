import { FormularioFeriadoYCierre } from "./FormularioFeriadoYCierre";
import { ListaFeriadosYCierres } from "./ListaFeriadosYCierres";
import type { BarberoParaSelector } from "@/types/barbero";
import type { ExcepcionLaboral } from "@/types/excepcion";

type FeriadosYCierresClienteProps = {
  excepciones: ExcepcionLaboral[];
  barberos: BarberoParaSelector[];
};

export function FeriadosYCierresCliente({
  excepciones,
  barberos,
}: FeriadosYCierresClienteProps) {
  return (
    <div className="grid min-w-0 gap-4 lg:gap-6">
      <section className="admin-card p-4 sm:p-6" aria-labelledby="titulo-agregar-cierre">
        <h2 id="titulo-agregar-cierre" className="text-base font-semibold text-[var(--admin-texto-primario)]">
          Agregar cierre
        </h2>
        <FormularioFeriadoYCierre barberos={barberos} />
      </section>
      <section className="admin-card" aria-labelledby="titulo-cierres">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--admin-border)] p-4 sm:px-6">
          <h2 id="titulo-cierres" className="text-base font-semibold text-[var(--admin-texto-primario)]">
            Cierres registrados
          </h2>
          <span className="text-sm tabular-nums text-[var(--admin-texto-muted)]">
            {excepciones.length} {excepciones.length === 1 ? "cierre" : "cierres"}
          </span>
        </div>
        <ListaFeriadosYCierres excepciones={excepciones} />
      </section>
    </div>
  );
}
