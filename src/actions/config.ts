"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionState } from "./mercadopago-actions";

export async function guardarConfiguracionMP(formData: FormData): Promise<ActionState> {
  try {
    const mpAccessToken = formData.get("mpAccessToken") as string;
    const mpPublicKey = formData.get("mpPublicKey") as string;

    if (!mpAccessToken) {
      return { success: false, error: "El Access Token es obligatorio" };
    }

    await prisma.configuracion.upsert({
      where: { id: "global" },
      update: {
        mpAccessToken: mpAccessToken.trim(),
        mpPublicKey: mpPublicKey.trim() || null,
      },
      create: {
        id: "global",
        mpAccessToken: mpAccessToken.trim(),
        mpPublicKey: mpPublicKey.trim() || null,
      },
    });

    revalidatePath("/configuraciones");
    revalidatePath("/turno");

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error al guardar la configuración de MP:", error);
    return { success: false, error: "No se pudo guardar la configuración." };
  }
}