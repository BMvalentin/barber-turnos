"use server";

import { prisma } from "@/lib/prisma";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import type { ActionState } from "@/types/action-state";

export type UsuarioAdministrable = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "EMPLEADO";
  barbero: { id: string; nombre: string; email: string | null } | null;
};

export type DatosUsuariosAdministrables = {
  usuarios: UsuarioAdministrable[];
  empleados: UsuarioAdministrable[];
  administradores: UsuarioAdministrable[];
};

export async function listarUsuarios(): Promise<ActionState<DatosUsuariosAdministrables>> {
  try {
    if (!(await requerirAdmin())) return { success: false, error: "No autorizado" };

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        barbero: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: [{ role: "asc" }, { email: "asc" }],
    });

    return {
      success: true,
      data: {
        usuarios: usuarios.filter((usuario) => usuario.role === "USER"),
        empleados: usuarios.filter((usuario) => usuario.role === "EMPLEADO"),
        administradores: usuarios.filter((usuario) => usuario.role === "ADMIN"),
      },
    };
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return { success: false, error: "No se pudieron cargar los usuarios" };
  }
}
