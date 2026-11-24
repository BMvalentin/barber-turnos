import { getCachedData } from "@/lib/cache";
import { ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";
import { obtenerServiciosPopulares } from "@/lib/consultas/obtener-servicios-populares";
import { obtenerVentasPorBarbero, sumarVentas } from "@/lib/consultas/obtener-ventas-panel";
import { obtenerPeriodoVentas, type PeriodoVentas } from "@/lib/consultas/periodo-ventas-panel";
import { calcularGananciaEmpleado } from "@/lib/ganancias/calcular-ganancia-empleado";
import { prisma } from "@/lib/prisma";
import type { ContextoPanel } from "@/lib/seguridad/requerir-admin";

const LIMITE_AGENDA = 4;

export async function obtenerEstadisticasPanel(
  { rol, barberoId }: Pick<ContextoPanel, "rol" | "barberoId">,
  periodo: PeriodoVentas,
  ahora: Date,
) {
  const esEmpleado = rol === "EMPLEADO";
  const perfil = barberoId ? await prisma.barbero.findUnique({
    where: { id: barberoId },
    select: {
      id: true,
      estado: true,
      porcentajeGanancia: true,
      servicios: {
        where: { servicio: { estado: true } },
        select: { servicioId: true },
        take: 1,
      },
    },
  }) : null;

  if (esEmpleado && !perfil) return null;

  // Un perfil se crea al entrar al panel. Para ofrecer turnos necesita un servicio activo.
  const perfilPropio = perfil && (esEmpleado || (perfil.estado && perfil.servicios.length > 0)) ? perfil : null;
  const alcancePersonal = perfilPropio?.id;
  const alcanceVentas = esEmpleado ? alcancePersonal : undefined;
  const { hoy, inicio, inicioHoy, finExclusivo } = obtenerPeriodoVentas(periodo, ahora);
  const [ventasPorBarbero, agenda, serviciosPopulares] = await Promise.all([
    getCachedData(
      ["admin-dashboard-ventas", periodo, hoy, alcanceVentas ?? "todos"],
      ["admin-dashboard", "turnos-global"],
      () => obtenerVentasPorBarbero(inicio, finExclusivo, alcanceVentas),
      30,
    ),
    getCachedData(
      ["admin-dashboard-agenda", hoy, alcancePersonal ?? "todos"],
      ["admin-dashboard", "barberos", "servicios", "turnos-global"],
      async () => {
        const where = {
          barberoId: alcancePersonal,
          horarioReservado: { gte: inicioHoy, lt: finExclusivo },
          estado: { in: [...ESTADOS_TURNO_ACTIVOS] },
        };
        const [turnos, total] = await Promise.all([
          prisma.turno.findMany({
            where,
            select: {
              id: true,
              estado: true,
              horarioReservado: true,
              clienteNombre: true,
              clienteApellido: true,
              user: { select: { name: true } },
              servicio: { select: { nombre: true } },
              barbero: { select: { nombre: true } },
            },
            orderBy: [{ horarioReservado: "asc" }, { id: "asc" }],
            take: LIMITE_AGENDA,
          }),
          prisma.turno.count({ where }),
        ]);
        return { turnos, total };
      },
      30,
    ),
    getCachedData(
      ["admin-dashboard-servicios-populares-v2", alcancePersonal ?? "todos"],
      ["admin-dashboard", "servicios", "turnos-global"],
      () => obtenerServiciosPopulares(alcancePersonal),
      30,
    ),
  ]);

  const ventasPropias = sumarVentas(ventasPorBarbero.filter(({ id }) => id === alcancePersonal));
  const ventasEquipo = ventasPorBarbero.filter(({ id }) => id !== alcancePersonal);
  const equipo = esEmpleado ? null : {
    ventas: sumarVentas(ventasEquipo),
    empleados: await obtenerDetalleEquipo(ventasEquipo),
  };

  return {
    agenda,
    serviciosPopulares,
    equipo,
    propio: perfilPropio ? {
      ventas: ventasPropias,
      ganancia: calcularGananciaEmpleado(ventasPropias.importeCompletado, Number(perfilPropio.porcentajeGanancia)),
    } : null,
  };
}

async function obtenerDetalleEquipo(ventas: Awaited<ReturnType<typeof obtenerVentasPorBarbero>>) {
  if (ventas.length === 0) return [];

  const empleados = await prisma.barbero.findMany({
    where: { id: { in: ventas.map(({ id }) => id) } },
    select: { id: true, nombre: true },
  });
  const nombres = new Map(empleados.map(({ id, nombre }) => [id, nombre]));

  return ventas.map(({ id, cobrado, completados }) => ({
    id,
    nombre: nombres.get(id) ?? "Empleado sin nombre",
    cobrado,
    completados,
  })).sort((a, b) => b.cobrado - a.cobrado || b.completados - a.completados || a.nombre.localeCompare(b.nombre, "es-AR"));
}
