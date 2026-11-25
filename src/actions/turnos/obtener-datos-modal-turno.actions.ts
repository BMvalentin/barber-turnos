"use server";

import { prisma } from "@/lib/prisma";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import type { ActionState } from "@/types/action-state";
import type { DatosCatalogoTurno } from "@/types/turno";

export async function obtenerDatosModalTurno(vistaAdministrativa: boolean): Promise<ActionState<DatosCatalogoTurno>> {
  try {
    if (typeof vistaAdministrativa !== "boolean") {
      return { success: false, error: "No se pudo identificar el tipo de reserva." };
    }

    if (!vistaAdministrativa) {
      if (!(await requerirSesion())) return { success: false, error: "Iniciá sesión para reservar un turno." };
      const catalogo = await obtenerDatosReserva({ soloPerfilesCompletos: true });
      return { success: true, data: { ...catalogo, usuarios: [] } };
    }

    const contexto = await requerirPanel();
    if (!contexto) return { success: false, error: "Tu sesión no tiene acceso al formulario de turnos." };
    const [catalogo, clientes] = await Promise.all([
      obtenerDatosReserva(),
      prisma.user.findMany({
        where: { OR: [{ esInvitado: false }, { turno: { some: {} } }] },
        select: { id: true, name: true, email: true, esInvitado: true, emailContacto: true },
        orderBy: { name: "asc" },
      }),
    ]);
    const usuarios = clientes.map((usuario) => ({
      ...usuario,
      email: usuario.esInvitado ? null : usuario.email,
    }));
    if (contexto.rol === "ADMIN") return { success: true, data: { ...catalogo, usuarios } };

    const barberos = catalogo.barberos.filter(({ id }) => id === contexto.barberoId);
    const relaciones = catalogo.relaciones.filter(({ barberoId }) => barberoId === barberos[0]?.id);
    const serviciosAsignados = new Set(relaciones.map(({ servicioId }) => servicioId));
    const servicios = catalogo.servicios.filter(({ id }) => serviciosAsignados.has(id));
    return { success: true, data: { barberos, relaciones, servicios, usuarios } };
  } catch (error) {
    console.error("Error al cargar los datos del turno:", error instanceof Error ? error.name : "desconocido");
    return { success: false, error: "No pudimos cargar los datos del turno." };
  }
}
