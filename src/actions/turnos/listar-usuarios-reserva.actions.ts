"use server";

import { prisma } from "@/lib/prisma";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import type { ActionState } from "@/types/action-state";
import type { UsuarioData } from "@/types/turno";

/** Carga los clientes cuando el personal abre el formulario de una reserva. */
export async function listarUsuariosParaReserva(): Promise<ActionState<UsuarioData[]>> {
  try {
    if (!(await requerirPanel())) return { success: false, error: "No autorizado" };

    const usuarios = await prisma.user.findMany({
      where: { OR: [{ esInvitado: false }, { turno: { some: {} } }] },
      select: {
        id: true,
        name: true,
        email: true,
        esInvitado: true,
        emailContacto: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: usuarios.map((usuario) => ({
        ...usuario,
        email: usuario.esInvitado ? null : usuario.email,
      })),
    };
  } catch (error) {
    console.error("Error al cargar clientes para una reserva:", error instanceof Error ? error.name : "desconocido");
    return { success: false, error: "No se pudo cargar la lista de clientes" };
  }
}
