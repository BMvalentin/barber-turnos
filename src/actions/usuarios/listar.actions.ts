"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import type { Prisma } from "../../../generated/prisma/client";
import type { ActionState } from "@/types/action-state";

const TAMANO_PAGINA = 20;
const esquemaConsulta = z.object({
  lista: z.enum(["todos", "usuarios", "empleados", "administradores"]).default("todos"),
  busqueda: z.string().trim().max(100).default(""),
  pagina: z.number().int().min(1).max(10_000).default(1),
});

export type ConsultaUsuarios = z.infer<typeof esquemaConsulta>;

export type UsuarioAdministrable = {
  id: string;
  name: string | null;
  email: string;
  telefono: string | null;
  cantidadTurnos: number;
  role: "USER" | "ADMIN" | "EMPLEADO";
  barbero: { id: string; nombre: string; email: string | null } | null;
};

export type DatosUsuariosAdministrables = {
  registros: UsuarioAdministrable[];
  contadores: { todos: number; usuarios: number; empleados: number; administradores: number } | null;
  pagina: number;
  totalPaginas: number;
  totalResultados: number;
};

const ROL_POR_LISTA = {
  usuarios: "USER",
  empleados: "EMPLEADO",
  administradores: "ADMIN",
} as const;

export async function listarUsuarios(
  consulta: unknown = {},
  incluirContadores: boolean = true,
): Promise<ActionState<DatosUsuariosAdministrables>> {
  try {
    if (!(await requerirAdmin())) return { success: false, error: "No autorizado" };

    const validacion = esquemaConsulta.safeParse(consulta);
    if (!validacion.success) return { success: false, error: "Consulta de usuarios inválida" };
    if (typeof incluirContadores !== "boolean") return { success: false, error: "Consulta de usuarios inválida" };

    const { lista, busqueda, pagina } = validacion.data;
    const where: Prisma.userWhereInput = {
      esInvitado: false,
      ...(lista !== "todos" ? { role: ROL_POR_LISTA[lista] } : {}),
      ...(busqueda ? {
        OR: [
          { email: { contains: busqueda } },
          { name: { contains: busqueda } },
          { telefono: { contains: busqueda } },
        ],
      } : {}),
    };

    const [grupos, totalResultados] = await Promise.all([
      incluirContadores ? prisma.user.groupBy({
        by: ["role"],
        where: { esInvitado: false },
        _count: { _all: true },
      }) : Promise.resolve(null),
      prisma.user.count({ where }),
    ]);

    const cantidades = grupos ? {
      usuarios: grupos.find((grupo) => grupo.role === "USER")?._count._all ?? 0,
      empleados: grupos.find((grupo) => grupo.role === "EMPLEADO")?._count._all ?? 0,
      administradores: grupos.find((grupo) => grupo.role === "ADMIN")?._count._all ?? 0,
    } : null;
    const totalPaginas = Math.max(1, Math.ceil(totalResultados / TAMANO_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);

    const usuarios = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        telefono: true,
        role: true,
        barbero: { select: { id: true, nombre: true, email: true } },
        _count: { select: { turno: true } },
      },
      orderBy: [{ role: "asc" }, { email: "asc" }, { id: "asc" }],
      skip: (paginaActual - 1) * TAMANO_PAGINA,
      take: TAMANO_PAGINA,
    });

    return {
      success: true,
      data: {
        registros: usuarios.map(({ _count, ...usuario }) => ({
          ...usuario,
          cantidadTurnos: _count.turno,
        })),
        contadores: cantidades && {
          ...cantidades,
          todos: cantidades.usuarios + cantidades.empleados + cantidades.administradores,
        },
        pagina: paginaActual,
        totalPaginas,
        totalResultados,
      },
    };
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return { success: false, error: "No se pudieron cargar los usuarios" };
  }
}
