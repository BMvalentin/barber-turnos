import { prisma } from "@/lib/prisma";
import { getCachedData } from "@/lib/cache";
import { ESTADOS_TURNO_ACTIVOS, ESTADOS_TURNO } from "@/lib/constants";
import { obtenerBarberosConTurnosHoy } from "@/lib/consultas/obtener-barberos-con-turnos-hoy";
import { obtenerServiciosPopulares } from "@/lib/consultas/obtener-servicios-populares";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";

export async function obtenerEstadisticasPanel(barberoId?: string) {
  const claveDia = obtenerFechaSola(new Date());
  const { inicio: inicioDia, fin: finDia } = obtenerRangoDelDia(claveDia);

  const [
    totalBarberos,
    totalServicios,
    totalTurnos,
    turnosPendientes,
    serviciosPopulares,
    barberosConActividadHoy,
  ] = await Promise.all([
    getCachedData(
      ["admin-dashboard-total-barberos", barberoId ?? "todos"],
      ["admin-dashboard", "barberos"],
      () => prisma.barbero.count({ where: { estado: true, ...(barberoId ? { id: barberoId } : {}) } }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-total-servicios", barberoId ?? "todos"],
      ["admin-dashboard", "servicios"],
      () => prisma.servicio.count({ where: { estado: true, ...(barberoId ? { servicios: { some: { barberoId } } } : {}) } }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-total-turnos", barberoId ?? "todos"],
      ["admin-dashboard", "turnos-global"],
      () => prisma.turno.count({ where: barberoId ? { barberoId } : undefined }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-turnos-pendientes", barberoId ?? "todos"],
      ["admin-dashboard", "turnos-global"],
      () =>
        prisma.turno.count({
          where: { estado: { in: [...ESTADOS_TURNO_ACTIVOS] }, ...(barberoId ? { barberoId } : {}) },
        }),
      30,
    ),
    getCachedData(
      ["admin-dashboard-servicios-populares", barberoId ?? "todos"],
      ["admin-dashboard", "servicios", "turnos-global"],
      () => obtenerServiciosPopulares(barberoId),
      30,
    ),
    getCachedData(
      ["admin-dashboard-actividad-hoy-por-barbero", claveDia, barberoId ?? "todos"],
      ["admin-dashboard", "barberos", "turnos-global"],
      () => obtenerBarberosConTurnosHoy(inicioDia, finDia, barberoId),
      30,
    ),
  ]);

  const barberos = barberosConActividadHoy.slice(0, 5).map((barbero) => ({
    id: barbero.id,
    nombre: barbero.nombre,
    _count: barbero._count,
  }));
  const turnosHoyPorBarbero = barberosConActividadHoy.map((barbero) => ({
    id: barbero.id,
    nombre: barbero.nombre,
    turnos: barbero.turnos.filter((turno) =>
      (ESTADOS_TURNO_ACTIVOS as readonly string[]).includes(turno.estado),
    ),
  }));
  const rendimientoHoyPorBarbero = barberosConActividadHoy.map((barbero) => ({
    id: barbero.id,
    nombre: barbero.nombre,
    turnos: barbero.turnos
      .filter((turno) => turno.estado === ESTADOS_TURNO[2])
      .map((turno) => ({ precioCongelado: turno.precioCongelado })),
  }));

  return {
    totalBarberos,
    totalServicios,
    totalTurnos,
    turnosPendientes,
    barberos,
    serviciosPopulares,
    turnosHoyPorBarbero,
    rendimientoHoyPorBarbero,
  };
}
