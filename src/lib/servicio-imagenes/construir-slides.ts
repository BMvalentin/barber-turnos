import type { ServicioCarrusel } from "@/types/servicio";
import { MAX_IMAGENES_SERVICIO } from "./constantes";

/* Un item del carrusel del Home: un servicio + UNA de sus imágenes.
   Si `imagen` es null, debe renderizarse el fallback del servicio. */
export type ServicioSlide = {
  servicio: ServicioCarrusel;
  imagen: string | null;
};

/* Transforma los servicios en una colección plana de slides, intercalando por rondas:
   1 imagen = 1 slide. Las imágenes del mismo servicio NO van consecutivas.
   Ronda 0: primera imagen de cada servicio.
   Ronda 1: segunda imagen de cada servicio que tenga una segunda.
   Ronda 2: tercera imagen de cada servicio que tenga una tercera.
   Los servicios sin imágenes generan un único slide (imagen = null) vía fallback.
   Es determinista (sin random) para evitar hydration issues. */
export function construirSlidesServicios(servicios: ServicioCarrusel[]): ServicioSlide[] {
  const slides: ServicioSlide[] = [];

  for (let ronda = 0; ronda < MAX_IMAGENES_SERVICIO; ronda++) {
    for (const servicio of servicios) {
      const imagenes = servicio.imagenes ?? [];
      const imagen = imagenes[ronda];

      if (imagen) {
        slides.push({ servicio, imagen });
        continue;
      }

      // Servicio sin imágenes: un único item con fallback en la primera ronda.
      if (ronda === 0 && imagenes.length === 0) {
        slides.push({ servicio, imagen: null });
      }
    }
  }

  return slides;
}
