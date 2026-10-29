"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { revalidarBarberos } from "@/lib/revalidar/revalidar-barberos";
import type { ActionState } from "@/types/action-state";

/* Los campos opcionales vacíos se guardan como null para no persistir cadenas vacías. */
const textoOpcional = (esquema: z.ZodString) =>
  z.preprocess(
    (valor) => (typeof valor === "string" && valor.trim() === "" ? null : valor),
    esquema.nullable(),
  );

const esquemaEdicionUsuario = z.object({
  userId: z.string().min(1, "Usuario inválido"),
  name: textoOpcional(z.string().trim().max(100, "El nombre es demasiado largo")),
  email: z.string().trim().toLowerCase().max(191, "El correo es demasiado largo").email("Correo inválido"),
  telefono: textoOpcional(
    z.string().trim().regex(/^\+?[0-9][0-9\s().-]{5,31}$/, "Ingresá un celular válido"),
  ),
});

export type DatosEdicionUsuario = {
  name: string;
  email: string;
  telefono: string;
};

function codigoError(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  const codigo = Reflect.get(error, "code");
  return typeof codigo === "string" ? codigo : null;
}

/**
 * Permite al administrador corregir nombre, correo y celular de una cuenta.
 * El correo del perfil de barbero vinculado se sincroniza en la misma transacción.
 */
export async function editarDatosUsuario(
  userId: string,
  datos: DatosEdicionUsuario,
): Promise<ActionState> {
  try {
    if (!(await requerirAdmin())) return { success: false, error: "No autorizado" };

    const parsed = esquemaEdicionUsuario.safeParse({ userId, ...datos });
    if (!parsed.success) {
      return {
        success: false,
        error: "Revisá los datos ingresados",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    const { email, name, telefono } = parsed.data;

    const usuario = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, esInvitado: true },
    });
    if (!usuario || usuario.esInvitado) return { success: false, error: "Usuario no encontrado" };

    const correoEnUso = await prisma.user.findFirst({
      where: { email, id: { not: usuario.id } },
      select: { id: true },
    });
    if (correoEnUso) {
      return { success: false, error: "Ya existe otra cuenta con ese correo", errors: { email: ["Correo en uso"] } };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: usuario.id },
        data: { name, email, telefono },
      });
      await tx.barbero.updateMany({
        where: { usuarioId: usuario.id },
        data: { email },
      });
    }, { maxWait: 10000, timeout: 15000 });

    revalidatePath("/admin/usuarios");
    revalidarBarberos();
    return { success: true };
  } catch (error) {
    if (codigoError(error) === "P2002") {
      return { success: false, error: "Ya existe otra cuenta con ese correo", errors: { email: ["Correo en uso"] } };
    }
    if (codigoError(error) === "P2025") {
      return { success: false, error: "Usuario no encontrado" };
    }
    if (codigoError(error) === "P2028") {
      return { success: false, error: "La operación tardó demasiado. Intentá nuevamente." };
    }
    console.error("Error al editar los datos del usuario:", codigoError(error) ?? "desconocido");
    return { success: false, error: "No se pudieron guardar los cambios" };
  }
}
