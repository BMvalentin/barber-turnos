"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/* =========================
   CREATE
========================= */
export async function crearBicicleta(formData: FormData) {
  const data = {
    marca: formData.get("marca") as string,
    modelo: formData.get("modelo") as string,
    rodado: Number(formData.get("rodado")),
    color: formData.get("color") as string,
  };

  console.log("🟢 crearBicicleta → recibe:", data);

  const bicicleta = await prisma.bicicleta.create({ data });

  console.log("✅ crearBicicleta → devuelve:", bicicleta);

  revalidatePath("/bicicletas");
}

/* =========================
   READ
========================= */
export async function obtenerBicicletas(params?: {
  search?: string;
  orderBy?: "marca" | "modelo" | "rodado" | "color";
  orderDir?: "asc" | "desc";
}) {
  console.log("🔵 obtenerBicicletas → params:", params);

  const where = params?.search
    ? {
        OR: [
          { marca: { contains: params.search } },
          { modelo: { contains: params.search } },
          { color: { contains: params.search } },
        ],
      }
    : undefined;

  const bicicletas = await prisma.bicicleta.findMany({
    where,
    orderBy: params?.orderBy
      ? { [params.orderBy]: params.orderDir ?? "asc" }
      : { creadaEn: "desc" },
  });

  console.log("📦 obtenerBicicletas → devuelve:", bicicletas);

  return bicicletas;
}



/* =========================
   DELETE
========================= */
export async function eliminarBicicleta(id: number) {
  console.log("🔴 eliminarBicicleta → id:", id);

  await prisma.bicicleta.delete({
    where: { id },
  });

  revalidatePath("/bicicletas");
}

/* =========================
   UPDATE
========================= */
export async function actualizarBicicleta(formData: FormData) {
  const data = {
    id: Number(formData.get("id")),
    marca: formData.get("marca") as string,
    modelo: formData.get("modelo") as string,
    rodado: Number(formData.get("rodado")),
    color: formData.get("color") as string,
  };

  console.log("🟡 actualizarBicicleta → recibe:", data);

  const bicicleta = await prisma.bicicleta.update({
    where: { id: data.id },
    data: {
      marca: data.marca,
      modelo: data.modelo,
      rodado: data.rodado,
      color: data.color,
    },
  });

  console.log("✅ actualizarBicicleta → devuelve:", bicicleta);

  revalidatePath("/bicicletas");
}
