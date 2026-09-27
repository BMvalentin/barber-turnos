import { getServiciosCarrusel } from "@/actions/servicios/carrusel.actions";
import { construirSlidesServicios } from "@/lib/servicio-imagenes/construir-slides";
import { ImageCarousel } from "@/components/inicio/ImageCarousel";

export async function ServiciosCarousel() {
  const res = await getServiciosCarrusel();
  const servicios = res.success ? (res.data ?? []) : [];
  const slides = construirSlidesServicios(servicios);

  return <ImageCarousel slides={slides} />;
}