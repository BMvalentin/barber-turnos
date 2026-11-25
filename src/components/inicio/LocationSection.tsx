import { Clock, MapPin, Phone } from "lucide-react";
import { Suspense } from "react";
import { EstadoHorariosUbicacion, HorariosUbicacion } from "./HorariosUbicacion";

interface LocationSectionProps {
  config?: {
    mapsUrl?: string | null;
    address?: string | null;
    whatsapp?: string | null;
  } | null;
}

export function LocationSection({ config }: LocationSectionProps) {
  const { address, whatsapp, mapsUrl } = config ?? {};
  const datos = [
    { icono: MapPin, titulo: "Dirección", contenido: address },
    { icono: Phone, titulo: "Turnos y consultas", contenido: whatsapp },
  ];

  return (
    <section id="ubicacion" aria-labelledby="titulo-ubicacion" className="scroll-mt-16 py-12 sm:py-20">
      <div className={`mx-auto px-4 sm:px-6 ${mapsUrl ? "max-w-6xl" : "max-w-2xl"}`}>
        <div className={mapsUrl ? "grid items-start gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12" : undefined}>
          <div className="min-w-0">
            <h2 id="titulo-ubicacion" className="mb-6 text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
              Nuestra <span className="text-[var(--page-primary-tinta)] italic">ubicación</span>
            </h2>

            {(address || whatsapp) && (
              <dl className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-4 border-b border-[var(--page-separador)] pb-5">
                {datos.map(({ icono: Icono, titulo, contenido }) => contenido && (
                  <div key={titulo} className="min-w-0">
                    <dt className="flex items-center gap-3 text-sm text-[var(--admin-texto-secundario)]">
                      <Icono className="size-4 shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
                      {titulo}
                    </dt>
                    <dd className="pl-7 text-lg leading-snug font-medium [overflow-wrap:anywhere]">{contenido}</dd>
                  </div>
                ))}
              </dl>
            )}

            <h3 className="mb-2 flex items-center gap-3 text-base font-semibold">
              <Clock className="size-4 shrink-0 text-[var(--page-primary-tinta)]" aria-hidden="true" />
              Horarios
            </h3>
            <Suspense fallback={<EstadoHorariosUbicacion estado="cargando" />}>
              <HorariosUbicacion />
            </Suspense>
          </div>

          {mapsUrl && (
            <div className="relative h-64 overflow-hidden rounded-xl border border-[var(--page-separador)] bg-[var(--admin-surface)] sm:h-72 md:h-auto md:min-h-88 md:self-stretch">
              <iframe
                src={mapsUrl}
                className="absolute inset-0 size-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la barbería"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
