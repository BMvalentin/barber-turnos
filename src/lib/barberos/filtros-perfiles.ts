import type { Prisma } from "../../../generated/prisma/client";
import { obtenerNombreProfesional } from "./nombre-profesional";

export const filtroBarberoDelEquipo = {
  usuario: { role: { in: ["ADMIN", "EMPLEADO"] } },
} satisfies Prisma.barberoWhereInput;

export const seleccionarActividadProfesional = {
  _count: { select: { servicios: true, horarios: true } },
} satisfies Prisma.barberoSelect;

type PerfilConActividad = {
  id: string;
  nombre: string;
  _count: { servicios: number; horarios: number };
};

export function filtrarPerfilesDelEquipo<T extends PerfilConActividad>(
  perfiles: T[],
  perfilPropio?: string | null,
): Omit<T, "_count">[] {
  // Un perfil provisional solo se ofrece cuando ya tiene configuración laboral.
  return perfiles.flatMap(({ _count, ...perfil }) => {
    const visible = perfil.id === perfilPropio
      || Boolean(obtenerNombreProfesional(perfil.nombre))
      || _count.servicios > 0
      || _count.horarios > 0;

    return visible ? [perfil] : [];
  });
}

export const filtroBarberoActivo = { estado: true, usuarioId: { not: null } } satisfies Prisma.barberoWhereInput;

export const filtroHorarioBarberoActivo = {
  estado: true,
  margenLaboral: { estado: true, dia: { estado: true } },
} satisfies Prisma.margen_laboral_barberoWhereInput;

export const filtroBarberoReservable = {
  ...filtroBarberoActivo,
  servicios: { some: { servicio: { estado: true } } },
} satisfies Prisma.barberoWhereInput;

export const filtroBarberoParaAgenda = {
  ...filtroBarberoReservable,
  usuario: { role: "EMPLEADO" },
} satisfies Prisma.barberoWhereInput;
