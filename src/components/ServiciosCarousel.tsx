import { getServiciosCarrusel } from "@/actions/servicio-actions";
import { ImageCarousel } from "./ImageCarousel";

export async function ServiciosCarousel() {
  const res = await getServiciosCarrusel();
  const servicios = res.success ? res.data : [];

  return <ImageCarousel servicios={servicios} />;
}