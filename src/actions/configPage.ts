// app/actions/config.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const esquemaColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Formato de color inválido. Usá #RRGGBB (ej.: #d97706).");
interface PageConfigData {
  name?: string;
  description?: string;
  slogan?: string;
  logo?: string;
  favicon?: string;
  backgroundImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  whatsapp?: string;
  mapsUrl?: string;
  address?: string;
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

export async function updatePageConfig(
  data: PageConfigData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.primaryColor !== undefined && !esquemaColor.safeParse(data.primaryColor).success)
      return { success: false, error: "Formato de color inválido. Usá #RRGGBB (ej.: #d97706)." };
    if (data.secondaryColor !== undefined && !esquemaColor.safeParse(data.secondaryColor).success)
      return { success: false, error: "Formato de color inválido. Usá #RRGGBB (ej.: #d97706)." };

    const cleanWhatsapp = data.whatsapp ? data.whatsapp.replace(/\D/g, "") : undefined;
    await prisma.pageConfig.upsert({
      where: { id: 1 },
      update: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.slogan !== undefined && { slogan: data.slogan }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.favicon !== undefined && { favicon: data.favicon }),
        ...(data.backgroundImage !== undefined && { backgroundImage: data.backgroundImage }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
        ...(data.mapsUrl !== undefined && { mapsUrl: data.mapsUrl }),
        ...(data.address !== undefined && { address: data.address }),
        ...(cleanWhatsapp !== undefined && { whatsapp: cleanWhatsapp }),
      },
      create: {
        id: 1,
        name: data.name || "Mi Barbería",
        description: data.description || "",
        slogan: data.slogan || "",
        logo: data.logo || "",
        favicon: data.favicon || "",
        backgroundImage: data.backgroundImage || "",
        primaryColor: data.primaryColor || "#000000",
        secondaryColor: data.secondaryColor || "#ffffff",
        whatsapp: cleanWhatsapp || "",
        mapsUrl: data.mapsUrl || "",
        address: data.address || "",
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
    const config = await prisma.pageConfig.findFirst() || await prisma.pageConfig.findUnique({
      where: { id: 1 },
    });

    return config;
  } catch (error) {
    console.error("Error al obtener la configuración de la página:", error);
    return null;
  }
}