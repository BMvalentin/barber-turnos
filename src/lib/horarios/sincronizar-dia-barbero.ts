import type { Prisma } from "../../../generated/prisma/client";
import type { HorarioDiaBarbero } from "@/types/horarios";

type AsignacionExistente = {
  id: string;
  margenLaboralId: string;
  estado: boolean;
  margenLaboral: { desde: string; hasta: string; estado: boolean };
};

/* Sincroniza los rangos de un día del barbero con los márgenes y sus asignaciones. */
export async function sincronizarDiaBarbero(
  tx: Prisma.TransactionClient,
  barberoId: string,
  dia: HorarioDiaBarbero,
  asignacionesExistentes: AsignacionExistente[]
): Promise<void> {
  if (!dia.trabaja) {
    await tx.margen_laboral_barbero.deleteMany({
      where: { barberoId, diaId: dia.diaId },
    });
    return;
  }

  const margenesElegidos: string[] = [];
  const asignacionesPorMargen = new Map(
    asignacionesExistentes.map((asignacion) => [asignacion.margenLaboralId, asignacion]),
  );
  const asignacionesPorRango = new Map(
    asignacionesExistentes.map((asignacion) => [
      `${asignacion.margenLaboral.desde}\u0000${asignacion.margenLaboral.hasta}`,
      asignacion,
    ]),
  );

  for (const rango of dia.rangos) {
    const asignacionPorRango = asignacionesPorRango.get(`${rango.desde}\u0000${rango.hasta}`);
    if (asignacionPorRango) {
      const margenId = asignacionPorRango.margenLaboralId;
      margenesElegidos.push(margenId);
      if (!asignacionPorRango.margenLaboral.estado) {
        await tx.margen_laboral.update({ where: { id: margenId }, data: { estado: true } });
      }
      if (!asignacionPorRango.estado) {
        await tx.margen_laboral_barbero.update({
          where: { id: asignacionPorRango.id },
          data: { estado: true },
        });
      }
      continue;
    }

    const margen = await tx.margen_laboral.findFirst({
      where: { diaId: dia.diaId, desde: rango.desde, hasta: rango.hasta },
      select: { id: true, estado: true },
    });
    let margenId = margen?.id;
    if (!margenId) {
      margenId = (
        await tx.margen_laboral.create({
          data: { diaId: dia.diaId, desde: rango.desde, hasta: rango.hasta, estado: true },
          select: { id: true },
        })
      ).id;
    } else if (!margen?.estado) {
      await tx.margen_laboral.update({ where: { id: margenId }, data: { estado: true } });
    }
    margenesElegidos.push(margenId);

    const asignacionExistente = asignacionesPorMargen.get(margenId);
    if (asignacionExistente) {
      if (!asignacionExistente.estado) {
        await tx.margen_laboral_barbero.update({
          where: { id: asignacionExistente.id },
          data: { estado: true },
        });
      }
    } else {
      const nuevaAsignacion = await tx.margen_laboral_barbero.create({
        data: { barberoId, margenLaboralId: margenId, diaId: dia.diaId, estado: true },
        select: { id: true, margenLaboralId: true, estado: true },
      });
      asignacionesPorMargen.set(margenId, {
        ...nuevaAsignacion,
        margenLaboral: { desde: rango.desde, hasta: rango.hasta, estado: true },
      });
    }
  }

  await tx.margen_laboral_barbero.deleteMany({
    where: { barberoId, diaId: dia.diaId, margenLaboralId: { notIn: margenesElegidos } },
  });
}
