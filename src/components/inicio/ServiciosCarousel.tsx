import { construirSlidesServicios } from "@/lib/servicio-imagenes/construir-slides";
import { ImageCarousel } from "@/components/inicio/ImageCarousel";
import { obtenerServiciosRecientes } from "@/lib/consultas/obtener-servicios-recientes";

export function EstadoServiciosCarousel({ estado }: { estado: "cargando" | "vacio" | "error" }) {
  return (
    <section id="servicios" aria-labelledby="titulo-servicios" className="scroll-mt-16 bg-[var(--page-bg)] py-12 sm:py-16" aria-busy={estado === "cargando"}>
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 id="titulo-servicios" className="mb-8 text-3xl font-black tracking-[-0.04em] uppercase sm:text-4xl">
          Nuestros <span className="italic text-[var(--page-primary-tinta)]">Servicios</span>
        </h2>
        {estado === "cargando" ? (
          <>
            <p role="status" className="text-[var(--admin-texto-secundario)]">Cargando servicios…</p>
            <div className="mx-auto mt-6 flex max-w-4xl gap-3 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, indice) => (
                <div key={indice} className="aspect-[4/5] basis-4/5 shrink-0 rounded-xl bg-[var(--admin-item)] min-[400px]:basis-[calc((100%-0.75rem)/2)] sm:aspect-square md:basis-[calc((100%-1.5rem)/3)]" />
              ))}
            </div>
          </>
        ) : (
          <p role={estado === "error" ? "alert" : "status"} className="mx-auto max-w-md text-[var(--admin-texto-secundario)]">
            {estado === "error"
              ? "No pudimos cargar los servicios. Actualizá la página para volver a intentarlo."
              : "Por el momento no hay servicios disponibles."}
          </p>
        )}
      </div>
    </section>
  );
}

export async function ServiciosCarousel() {
  const servicios = await obtenerServiciosRecientes().catch(() => null);
  if (!servicios) return <EstadoServiciosCarousel estado="error" />;
  if (servicios.length === 0) return <EstadoServiciosCarousel estado="vacio" />;

  return <ImageCarousel slides={construirSlidesServicios(servicios)} />;
}
