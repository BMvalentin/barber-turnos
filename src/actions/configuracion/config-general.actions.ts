"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";
import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";
import type { PageConfigData } from "@/types/page-config";

const esquemaColor = z
  .string()
  .refine(esColorHexValido, "Formato de color inválido. Usá #RRGGBB (ej.: #d97706).");

async function updatePageConfigBase(
  data: PageConfigData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.primaryColor !== undefined && !esquemaColor.safeParse(data.primaryColor).success)
      return { success: false, error: "Formato de color inválido. Usá #RRGGBB (ej.: #d97706)." };
    if (data.secondaryColor !== undefined && !esquemaColor.safeParse(data.secondaryColor).success)
      return { success: false, error: "Formato de color inválido. Usá #RRGGBB (ej.: #d97706)." };
    if (data.bgColor !== undefined && !esquemaColor.safeParse(data.bgColor).success)
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
        ...(data.bgColor !== undefined && { bgColor: data.bgColor }),
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
        bgColor: data.bgColor || "#09090b",
        whatsapp: cleanWhatsapp || "",
        mapsUrl: data.mapsUrl || "",
        address: data.address || "",
      },
    });

    revalidateTag("page-config");
    revalidatePath("/admin/config");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la configuración:", error);
    return { success: false, error: "No se pudo actualizar la configuración." };
  }
}

export const updatePageConfig = exigirAdmin(updatePageConfigBase);
