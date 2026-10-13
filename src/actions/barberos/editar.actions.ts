"use server";

import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import { updateBarberoSchema } from "@/lib/barbero-zod";
import type { ActionState } from "@/types/action-state";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import {
  actualizarBarberoEnTransaccion,
  BarberoNoEncontradoError,
} from "@/lib/barberos/actualizar-barbero";

/* Extrae el código de error de Prisma sin aserciones de tipo. */
function codigoError(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const codigo = Reflect.get(error, "code");
  return typeof codigo === "string" ? codigo : null;
}

function mensajeErrorActualizarBarbero(error: unknown): string {
  if (error instanceof BarberoNoEncontradoError) {
    return "El barbero no existe.";
  }

  const codigo = codigoError(error);
  if (codigo === "P2002") {
    return "Ya existe una asociación duplicada para este barbero.";
  }
  if (codigo === "P2025") {
    return "El barbero no existe.";
  }
  if (codigo === "P2028") {
    return "La operación tardó demasiado. Intentá nuevamente.";
  }
  return "Error al actualizar barbero";
}

async function updateBarberoBase(data: unknown): Promise<ActionState> {
  try {
    const contexto = await requerirPanel();
    if (!contexto) return { success: false, error: "No autorizado" };

    const parsed = updateBarberoSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Zod Validation Error:", parsed.error.flatten().fieldErrors);
      return {
        success: false,
        error: "Error de validación: Revisa los campos ingresados.",
      };
    }

    const { id, porcentajeGanancia } = parsed.data;

    if (contexto.rol === "EMPLEADO" && contexto.barberoId !== id) {
      return { success: false, error: "No autorizado" };
    }

    // Solo un administrador define la comisión; un empleado no puede fijarse la propia.
    if (contexto.rol !== "ADMIN" && porcentajeGanancia !== undefined) {
      return { success: false, error: "No autorizado" };
    }

    await actualizarBarberoEnTransaccion(parsed.data, {
      puedeEditarServicios:
        contexto.rol === "ADMIN" || contexto.barberoId === id,
      puedeEditarMargenes: contexto.rol === "ADMIN",
    });

    revalidarBarberos();
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar barbero:", error);
    return { success: false, error: mensajeErrorActualizarBarbero(error) };
  }
}

export const updateBarbero = updateBarberoBase;
