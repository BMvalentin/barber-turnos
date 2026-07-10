import { getServiciosCarrusel } from "@/actions/servicio-actions";
import { ImageCarousel } from "./ImageCarousel";

export async function ServiciosCarousel() {
  const res = await getServiciosCarrusel(); // ✅ Aquí SÍ puedes usar await
  const servicios = res.success ? res.data : [];

  // Pasamos los datos al componente de cliente
  return <ImageCarousel servicios={servicios} />;
}