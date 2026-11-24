import { ESTADOS_PAGO_ACREDITADOS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

// Se acumula en centavos. Un turno puede tener una seña o un pago total vigente.
export type TotalesVentas = {
  cobrado: number;
  senas: number;
  saldo: number;
  completados: number;
  importeCompletado: number;
};

function ventasVacias(): TotalesVentas {
  return { cobrado: 0, senas: 0, saldo: 0, completados: 0, importeCompletado: 0 };
}

export function sumarVentas(ventas: readonly TotalesVentas[]): TotalesVentas {
  return ventas.reduce((total, venta) => ({
    cobrado: total.cobrado + venta.cobrado,
    senas: total.senas + venta.senas,
    saldo: total.saldo + venta.saldo,
    completados: total.completados + venta.completados,
    importeCompletado: total.importeCompletado + venta.importeCompletado,
  }), ventasVacias());
}

export async function obtenerVentasPorBarbero(inicio: Date, finExclusivo: Date, barberoId?: string) {
  const grupos = await prisma.turno.groupBy({
    by: ["barberoId", "estado", "estadoPago", "tipoPago", "precioCongelado", "seniaCongelada"],
    where: {
      barberoId,
      horarioReservado: { gte: inicio, lt: finExclusivo },
      OR: [{ estado: "COMPLETADO" }, {
        estado: { not: "CANCELADO" },
        estadoPago: { in: [...ESTADOS_PAGO_ACREDITADOS] },
      }],
    },
    _count: { _all: true },
  });

  const porBarbero = new Map<string, TotalesVentas>();
  for (const grupo of grupos) {
    const total = porBarbero.get(grupo.barberoId) ?? ventasVacias();
    const cantidad = grupo._count._all;
    const precio = Math.round(Number(grupo.precioCongelado) * 100);
    const sena = Math.round(Number(grupo.seniaCongelada) * 100);
    const pagoTotal = grupo.estadoPago === "PAGADO"
      || (grupo.estadoPago === "APROBADO" && grupo.tipoPago === "TOTAL");
    const pagoSena = grupo.estadoPago === "SEÑADO"
      || (grupo.estadoPago === "APROBADO" && grupo.tipoPago === "SEÑA");
    const cobrado = pagoTotal ? precio : pagoSena ? Math.min(precio, sena) : 0;
    if (cobrado === 0 && grupo.estado !== "COMPLETADO") continue;

    total.cobrado += cobrado * cantidad;
    if (pagoSena) total.senas += cobrado * cantidad;
    if (grupo.estado === "COMPLETADO") {
      total.completados += cantidad;
      total.importeCompletado += precio * cantidad;
      total.saldo += (precio - cobrado) * cantidad;
    }
    porBarbero.set(grupo.barberoId, total);
  }
  // La caché de Next almacena resultados serializables.
  return Array.from(porBarbero, ([id, ventas]) => ({ id, ...ventas }));
}
