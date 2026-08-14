import { getServiciosCarrusel } from "@/actions/servicios/carrusel.actions";
import { ImageCarousel } from "@/components/inicio/ImageCarousel";

export async function ServiciosCarousel() {
  const res = await getServiciosCarrusel();
  const servicios = res.success ? (res.data ?? []) : [];

  return <ImageCarousel servicios={servicios} />;
}