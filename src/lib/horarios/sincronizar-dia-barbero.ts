import type { Prisma } from "../../../generated/prisma/client";
import type { HorarioDiaBarbero } from "@/types/horarios";

type AsignacionExistente = { id: string; margenLaboralId: string };

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

  for (const rango of dia.rangos) {
    const margen = await tx.margen_laboral.findFirst({
      where: { diaId: dia.diaId, desde: rango.desde, hasta: rango.hasta },
      select: { id: true },
    });
    let margenId = margen?.id;
    if (!margenId) {
      margenId = (
        await tx.margen_laboral.create({
          data: { diaId: dia.diaId, desde: rango.desde, hasta: rango.hasta, estado: true },
          select: { id: true },
        })
      ).id;
    } else {
      await tx.margen_laboral.update({ where: { id: margenId }, data: { estado: true } });
    }
    margenesElegidos.push(margenId);

    const asignacionExistente = asignacionesExistentes.find(
      (a) => a.margenLaboralId === margenId
    );
    if (asignacionExistente) {
      await tx.margen_laboral_barbero.update({
        where: { id: asignacionExistente.id },
        data: { estado: true },
      });
    } else {
      await tx.margen_laboral_barbero.create({
        data: { barberoId, margenLaboralId: margenId, diaId: dia.diaId, estado: true },
      });
    }
  }

  await tx.margen_laboral_barbero.deleteMany({
    where: { barberoId, diaId: dia.diaId, margenLaboralId: { notIn: margenesElegidos } },
  });
}
