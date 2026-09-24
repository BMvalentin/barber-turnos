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

export type BarberoOpcionUsuario = {
  id: string;
  nombre: string;
  email: string | null;
  usuarioId: string | null;
};

export type DatosUsuariosAdministrables = {
  usuarios: UsuarioAdministrable[];
  empleados: UsuarioAdministrable[];
  administradores: UsuarioAdministrable[];
  barberos: BarberoOpcionUsuario[];
};

export async function listarUsuarios(): Promise<ActionState<DatosUsuariosAdministrables>> {
  try {
    if (!(await requerirAdmin())) return { success: false, error: "No autorizado" };

    const [usuarios, barberos] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          barbero: { select: { id: true, nombre: true, email: true } },
        },
        orderBy: [{ role: "asc" }, { email: "asc" }],
      }),
      prisma.barbero.findMany({
        select: { id: true, nombre: true, email: true, usuarioId: true },
        orderBy: { nombre: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        usuarios: usuarios.filter((usuario) => usuario.role === "USER"),
        empleados: usuarios.filter((usuario) => usuario.role === "EMPLEADO"),
        administradores: usuarios.filter((usuario) => usuario.role === "ADMIN"),
        barberos,
      },
    };
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return { success: false, error: "No se pudieron cargar los usuarios" };
  }
}
