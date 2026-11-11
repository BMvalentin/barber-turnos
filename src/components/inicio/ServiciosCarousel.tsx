"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { getServiciosCarrusel } from "@/actions/servicios/carrusel.actions";
import { construirSlidesServicios } from "@/lib/servicio-imagenes/construir-slides";
import { ImageCarousel } from "@/components/inicio/ImageCarousel";
import { guardarCachePublica, leerCachePublica } from "@/components/inicio/cache-contenido-publico";
import type { ServicioCarrusel } from "@/types/servicio";

const CLAVE_CACHE = "barber-servicios-carrusel-v1";
const DURACION_CACHE_MS = 60_000;
const esquemaServicios = z.array(z.object({
  id: z.string().max(191),
  nombre: z.string().max(500),
  descripcion: z.string().max(5000).nullable(),
  srcImage: z.string().max(2048).nullable(),
  precio: z.number().finite(),
  descuento: z.number().finite(),
  imagenes: z.array(z.string().max(2048)).max(3),
})).max(100);

function sonServiciosCarrusel(valor: unknown): valor is ServicioCarrusel[] {
  return esquemaServicios.safeParse(valor).success;
}

export function ServiciosCarousel() {
  const [servicios, setServicios] = useState<ServicioCarrusel[]>([]);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

  useEffect(() => {
    let vigente = true;
    let solicitudActual = 0;
    const cargarServicios = () => {
      const solicitud = ++solicitudActual;
      const cache = leerCachePublica(CLAVE_CACHE, sonServiciosCarrusel);
      if (cache) {
        setServicios(cache);
        setEstado("listo");
        return;
      }

      setEstado("cargando");
      void getServiciosCarrusel().then((resultado) => {
        if (!vigente || solicitud !== solicitudActual) return;
        if (!resultado.success || !sonServiciosCarrusel(resultado.data)) {
          setEstado("error");
          return;
        }
        const datos = resultado.data;
        setServicios(datos);
        setEstado("listo");
        guardarCachePublica(CLAVE_CACHE, datos, DURACION_CACHE_MS);
      }).catch(() => {
        if (vigente && solicitud === solicitudActual) setEstado("error");
      });
    };

    const alCambiarCache = (evento: StorageEvent) => {
      if (evento.key === CLAVE_CACHE) cargarServicios();
    };

    cargarServicios();
    window.addEventListener("storage", alCambiarCache);

    return () => {
      vigente = false;
      window.removeEventListener("storage", alCambiarCache);
    };
  }, []);

  if (estado !== "listo" || servicios.length === 0) {
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

  return <ImageCarousel slides={construirSlidesServicios(servicios)} />;
}
