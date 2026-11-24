import { getCachedData } from "@/lib/cache";
import { ESTADOS_TURNO_ACTIVOS } from "@/lib/constants";
import { obtenerServiciosPopulares } from "@/lib/consultas/obtener-servicios-populares";
import { obtenerVentasPorBarbero, sumarVentas } from "@/lib/consultas/obtener-ventas-panel";
import { obtenerPeriodoVentas, type PeriodoVentas } from "@/lib/consultas/periodo-ventas-panel";
import { calcularGananciaEmpleado } from "@/lib/ganancias/calcular-ganancia-empleado";
import { prisma } from "@/lib/prisma";
import type { ContextoPanel } from "@/lib/seguridad/requerir-admin";

const LIMITE_AGENDA = 4;

function obtenerPerfilPanel(barberoId: string) {
  return getCachedData(
    ["admin-dashboard-perfil", barberoId],
    ["barberos", "servicios"],
    async () => {
      const perfil = await prisma.barbero.findUnique({
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
      });
      return perfil ? {
        id: perfil.id,
        estado: perfil.estado,
        porcentajeGanancia: Number(perfil.porcentajeGanancia),
        tieneServicioActivo: perfil.servicios.length > 0,
      } : null;
    },
  );
}

export async function obtenerEstadisticasPanel(
  { rol, barberoId }: Pick<ContextoPanel, "rol" | "barberoId">,
  periodo: PeriodoVentas,
  ahora: Date,
) {
  const esEmpleado = rol === "EMPLEADO";
  const perfil = barberoId ? await obtenerPerfilPanel(barberoId) : null;

  if (esEmpleado && !perfil) return null;

  // Un perfil se crea al entrar al panel. Para ofrecer turnos necesita un servicio activo.
  const perfilPropio = perfil && (esEmpleado || (perfil.estado && perfil.tieneServicioActivo)) ? perfil : null;
  const alcancePersonal = perfilPropio?.id;
  const alcanceVentas = esEmpleado ? alcancePersonal : undefined;
  const { hoy, inicio, inicioHoy, finExclusivo } = obtenerPeriodoVentas(periodo, ahora);
  const [ventasPorBarbero, agenda, serviciosPopulares, empleados] = await Promise.all([
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
      ["admin-dashboard-servicios-populares-v3", alcancePersonal ?? "todos"],
      ["servicios"],
      () => obtenerServiciosPopulares(alcancePersonal),
      300,
    ),
    esEmpleado ? [] : getCachedData(
      ["admin-dashboard-nombres"],
      ["barberos"],
      () => prisma.barbero.findMany({ select: { id: true, nombre: true } }),
    ),
  ]);

  const ventasPropias = sumarVentas(ventasPorBarbero.filter(({ id }) => id === alcancePersonal));
  const ventasEquipo = ventasPorBarbero.filter(({ id }) => id !== alcancePersonal);
  const equipo = esEmpleado ? null : {
    ventas: sumarVentas(ventasEquipo),
    empleados: obtenerDetalleEquipo(ventasEquipo, empleados),
  };

  return {
    agenda,
    serviciosPopulares,
    equipo,
    propio: perfilPropio ? {
      ventas: ventasPropias,
      ganancia: calcularGananciaEmpleado(ventasPropias.importeCompletado, perfilPropio.porcentajeGanancia),
    } : null,
  };
}

function obtenerDetalleEquipo(
  ventas: Awaited<ReturnType<typeof obtenerVentasPorBarbero>>,
  empleados: { id: string; nombre: string }[],
) {
  const nombres = new Map(empleados.map(({ id, nombre }) => [id, nombre]));

  return ventas.map(({ id, cobrado, completados }) => ({
    id,
    nombre: nombres.get(id) ?? "Empleado sin nombre",
    cobrado,
    completados,
  })).sort((a, b) => b.cobrado - a.cobrado || b.completados - a.completados || a.nombre.localeCompare(b.nombre, "es-AR"));
}
