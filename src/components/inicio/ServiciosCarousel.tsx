import { construirSlidesServicios } from "@/lib/servicio-imagenes/construir-slides";
import { ImageCarousel } from "@/components/inicio/ImageCarousel";
import { obtenerServiciosRecientes } from "@/lib/consultas/obtener-servicios-recientes";

export function EstadoServiciosCarousel({ estado }: { estado: "cargando" | "vacio" | "error" }) {
  return (
    <section id="servicios" className="min-h-[22rem] bg-[var(--page-bg)] py-12" aria-busy={estado === "cargando"}>
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <h2 className="mb-8 text-3xl font-black uppercase tracking-tighter text-[var(--page-bg-foreground)]">
          Nuestros <span className="italic text-[var(--page-primary-tinta)]">Servicios</span>
        </h2>
        {estado === "cargando" ? (
          <>
            <p role="status" className="text-[var(--page-bg-foreground)]/70">Cargando servicios...</p>
            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 3 }).map((_, indice) => (
                <div key={indice} className="aspect-square animate-pulse rounded-2xl bg-[var(--admin-surface)]" />
              ))}
            </div>
          </>
        ) : (
          <p role={estado === "error" ? "alert" : "status"} className="text-[var(--page-bg-foreground)]/70">
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
