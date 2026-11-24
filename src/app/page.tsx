import { Suspense } from "react";
import { Hero } from "@/components/inicio/Hero";
import { LocationSection } from "@/components/inicio/LocationSection";
import { EstadoServiciosCarousel, ServiciosCarousel } from "@/components/inicio/ServiciosCarousel";
import { obtenerHorariosCompactos } from "@/lib/consultas/obtener-horarios-compactos";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

async function HorariosUbicacion() {
  const horarios = await obtenerHorariosCompactos().catch(() => ["Error al cargar horarios"]);
  return horarios.map((horario) => <p key={horario}>{horario}</p>);
}

export default async function Page() {
  const config = await obtenerConfigCacheada();

  return (
    <div className="min-h-screen justify-center items-center mx-auto">
      <main id="contenido-inicio" tabIndex={-1}>
        <Hero config={config ? {
          slogan: config.slogan,
          description: config.description,
          backgroundImage: config.backgroundImage,
        } : null} />
        <Suspense fallback={<EstadoServiciosCarousel estado="cargando" />}>
          <ServiciosCarousel />
        </Suspense>
        <LocationSection config={config ? {
          mapsUrl: config.mapsUrl,
          address: config.address,
          whatsapp: config.whatsapp,
        } : null}>
          <Suspense fallback={<p role="status">Cargando horarios...</p>}>
            <HorariosUbicacion />
          </Suspense>
        </LocationSection>
      </main>
    </div>
  );
}
