import { MapPin, Phone, Clock } from "lucide-react";
import type { ReactNode } from "react";

interface LocationSectionProps {
  children: ReactNode;
  config?: {
    mapsUrl?: string | null;
    address?: string | null;
    whatsapp?: string | null;
  } | null;
}

export function LocationSection({ config, children }: LocationSectionProps) {
  const datos = [
    { icono: MapPin, titulo: "Dirección", contenido: config?.address },
    { icono: Phone, titulo: "Turnos y consultas", contenido: config?.whatsapp },
    { icono: Clock, titulo: "Horarios", contenido: children },
  ];

  return (
    <section id="ubicacion" aria-labelledby="titulo-ubicacion" className="scroll-mt-16 py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="titulo-ubicacion" className="mb-8 text-center text-3xl font-bold sm:mb-10 sm:text-5xl">
          Nuestra <span className="text-[var(--page-primary-tinta)] italic">Ubicación</span>
        </h2>

        <div className={config?.mapsUrl ? "grid items-stretch gap-5 lg:grid-cols-2 lg:gap-8" : "mx-auto max-w-2xl"}>
          <div className="flex min-w-0 flex-col divide-y divide-[var(--page-separador)]">
            {datos.map(({ icono: Icono, titulo, contenido }) => contenido && (
              <div key={titulo} className="flex min-w-0 flex-1 items-start gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4 sm:py-5">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--page-primary-soft)] text-[var(--tema-primario-suave-texto)]">
                  <Icono className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--admin-texto-primario)]">{titulo}</h3>
                  <div className="mt-0.5 space-y-0.5 text-[var(--admin-texto-secundario)] [overflow-wrap:anywhere]">{contenido}</div>
                </div>
              </div>
            ))}
          </div>

          {config?.mapsUrl && (
            <iframe
              src={config.mapsUrl}
              className="h-[min(24rem,75svh)] w-full rounded-xl bg-[var(--admin-surface)] lg:h-full lg:min-h-80"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de la barbería"
            />
          )}
        </div>
      </div>
    </section>
  );
}
