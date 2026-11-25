import { obtenerHorariosCompactos } from "@/lib/consultas/obtener-horarios-compactos";

const MENSAJES = {
  cargando: "Cargando horarios…",
  cerrado: "Cerrado",
  error: "No pudimos cargar los horarios.",
};

export function EstadoHorariosUbicacion({ estado }: { estado: keyof typeof MENSAJES }) {
  return (
    <p className="text-[var(--admin-texto-secundario)]" role={estado === "cargando" ? "status" : undefined}>
      {MENSAJES[estado]}
    </p>
  );
}

export async function HorariosUbicacion() {
  const horarios = await obtenerHorariosCompactos().catch(() => null);

  if (!horarios) return <EstadoHorariosUbicacion estado="error" />;
  if (horarios.length === 0) return <EstadoHorariosUbicacion estado="cerrado" />;

  return (
    <dl className="divide-y divide-[var(--page-separador)]">
      {horarios.map(({ dias, rangos }) => (
        <div key={dias} className="grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)] items-baseline gap-x-2 py-1.5 last:pb-0">
          <dt className="font-medium">{dias}</dt>
          <dd className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[var(--admin-texto-secundario)] tabular-nums lg:gap-x-5">
            {rangos.length === 0 ? "Cerrado" : rangos.map(({ desde, hasta }, indice) => (
              <span key={desde} className="whitespace-nowrap">
                <time dateTime={desde}>{desde}</time>
                <span aria-hidden="true">–</span><span className="sr-only"> a </span>
                <time dateTime={hasta}>{hasta}</time>
                {indice < rangos.length - 1 && <span className="sr-only">, </span>}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
