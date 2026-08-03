import { getServiciosCarrusel } from "@/actions/servicio-actions";
import { ImageCarousel } from "./ImageCarousel";
import { prisma } from "@/lib/prisma";

export async function ServiciosCarousel() {
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  const res = await getServiciosCarrusel();
  const servicios = res.success ? res.data : [];

  return <ImageCarousel servicios={servicios} config={config} />;
}