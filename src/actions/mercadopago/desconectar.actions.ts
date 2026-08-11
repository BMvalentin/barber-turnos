"use server";

import { revalidatePath } from "next/cache";
import { eliminarConfiguracionMP } from "@/lib/mercadopago/eliminar-config";
import { exigirAdmin } from "@/lib/seguridad/exigir-admin";

/** Desconecta la cuenta de MP. Falla si la configuración está bloqueada. */
async function desconectarMPBase() {
  try {
    await eliminarConfiguracionMP();
    revalidatePath("/admin/mercadopago");
    return { success: true };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error("Error al desconectar Mercado Pago:", detalle);
    return {
      success: false,
      error: detalle || "No se pudo desconectar la cuenta",
    };
  }
}

export const desconectarMP = exigirAdmin(desconectarMPBase);
