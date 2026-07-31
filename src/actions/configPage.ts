// app/actions/config.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface PageConfigData {
  name?: string;
  description?: string;
  slogan?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  whatsapp?: string;
}

export async function updateWhatsappConfig(whatsapp: string) {
  const cleanNumber = whatsapp.replace(/\D/g, "");

  await prisma.pageConfig.upsert({
    where: { id: 1 },
    update: { whatsapp: cleanNumber },
    create: { id: 1, name: "Mi Barbería", whatsapp: cleanNumber },
  });

  revalidatePath("/admin/config");
  return { success: true };
}

export async function updatePageConfig(data: PageConfigData) {
  try {
    const cleanWhatsapp = data.whatsapp ? data.whatsapp.replace(/\D/g, "") : undefined;

    await prisma.pageConfig.upsert({
      where: { id: 1 },
      update: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.slogan !== undefined && { slogan: data.slogan }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.favicon !== undefined && { favicon: data.favicon }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
        ...(cleanWhatsapp !== undefined && { whatsapp: cleanWhatsapp }),
      },
      create: {
        id: 1,
        name: data.name || "Mi Barbería",
        description: data.description || "",
        slogan: data.slogan || "",
        logo: data.logo || "",
        favicon: data.favicon || "",
        primaryColor: data.primaryColor || "#000000",
        secondaryColor: data.secondaryColor || "#ffffff",
        whatsapp: cleanWhatsapp || "",
      },
    });

    revalidatePath("/admin/config");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la configuración:", error);
    return { success: false, error: "No se pudo actualizar la configuración." };
  }
}

export async function getPageConfig() {
  try {
    // Buscamos la configuración (asumiendo que usas un registro único o con ID 1)
    const config = await prisma.pageConfig.findFirst() || await prisma.pageConfig.findUnique({
      where: { id: 1 },
    });

    return config;
  } catch (error) {
    console.error("Error al obtener la configuración de la página:", error);
    return null;
  }
}