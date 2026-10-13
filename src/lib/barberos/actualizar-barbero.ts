import { prisma } from "@/lib/prisma";
import { updateBarberoSchema } from "@/lib/barbero-zod";
import type { z } from "zod";

export type DatosActualizarBarbero = z.infer<typeof updateBarberoSchema>;

export type OpcionesActualizarBarbero = {
  puedeEditarServicios: boolean;
  puedeEditarMargenes: boolean;
};

/* La transacción interactiva ejecuta las consultas en serie; con una base
   remota cada viaje cuesta cientos de milisegundos. Se deja un timeout holgado
   sobre la medición real (ver informe) en lugar del default de 5 s. */
const MAX_WAIT_TRANSACCION_MS = 10_000;
const TIMEOUT_TRANSACCION_MS = 15_000;

export class BarberoNoEncontradoError extends Error {
  constructor() {
    super("BARBERO_NO_ENCONTRADO");
    this.name = "BarberoNoEncontradoError";
  }
}

/* Sincroniza las relaciones por diferencias: conserva las asociaciones que no
   cambiaron, elimina las ausentes y agrega solo las nuevas. Nunca se usan
   `skipDuplicates` ni reconstrucciones totales, para que una restricción única
   siga delatando datos inesperados. */
export async function actualizarBarberoEnTransaccion(
  data: DatosActualizarBarbero,
  opciones: OpcionesActualizarBarbero,
): Promise<void> {
  const {
    id,
    nombre,
    srcImage,
    estado,
    porcentajeGanancia,
    serviciosIds,
    margenesIds,
  } = data;

  const editaServicios =
    opciones.puedeEditarServicios && serviciosIds !== undefined;
  const editaMargenes =
    opciones.puedeEditarMargenes && margenesIds !== undefined;

  // Lookups inmutables fuera de la transacción: resuelven configuración que la
  // transacción no modifica. En este dominio `servicio` y `margen_laboral` no
  // se eliminan desde la aplicación, por lo que no pueden dejar asociaciones
  // huérfanas al resolverlos antes de abrir la transacción.
  const [barbero, margenesDeseados, serviciosValidos] = await Promise.all([
    prisma.barbero.findUnique({
      where: { id },
      select: { id: true, estado: true, usuario: { select: { email: true } } },
    }),
    editaMargenes
      ? prisma.margen_laboral.findMany({
          where: { id: { in: [...new Set(margenesIds ?? [])] } },
          select: { id: true, diaId: true },
        })
      : Promise.resolve([] as Array<{ id: string; diaId: string }>),
    editaServicios
      ? prisma.servicio.findMany({
          where: { id: { in: [...new Set(serviciosIds ?? [])] } },
          select: { id: true },
        })
      : Promise.resolve([] as Array<{ id: string }>),
  ]);

  if (!barbero) throw new BarberoNoEncontradoError();

  await prisma.$transaction(
    async (tx) => {
      await tx.barbero.update({
        where: { id },
        data: {
          nombre,
          // El correo se deriva siempre de la cuenta asociada; nunca del formulario.
          email: barbero.usuario?.email ?? null,
          srcImage: srcImage || null,
          estado: estado ?? barbero.estado,
          ...(porcentajeGanancia !== undefined && { porcentajeGanancia }),
          updatedAt: new Date(),
        },
        select: { id: true },
      });

      if (editaServicios) {
        const deseados = new Set(serviciosValidos.map((s) => s.id));
        const existentes = await tx.servicioxbarbero.findMany({
          where: { barberoId: id },
          select: { servicioId: true },
        });
        const setExistentes = new Set(existentes.map((r) => r.servicioId));

        const aEliminar = [...setExistentes].filter((sId) => !deseados.has(sId));
        const aAgregar = [...deseados].filter((sId) => !setExistentes.has(sId));

        if (aEliminar.length) {
          await tx.servicioxbarbero.deleteMany({
            where: { barberoId: id, servicioId: { in: aEliminar } },
          });
        }
        if (aAgregar.length) {
          await tx.servicioxbarbero.createMany({
            data: aAgregar.map((sId) => ({ barberoId: id, servicioId: sId })),
          });
        }
      }

      if (editaMargenes) {
        const clave = (margenLaboralId: string, diaId: string) =>
          `${margenLaboralId}\u0000${diaId}`;

        const deseadas = new Map(
          margenesDeseados.map((m) => [clave(m.id, m.diaId), m]),
        );
        const existentes = await tx.margen_laboral_barbero.findMany({
          where: { barberoId: id },
          select: {
            id: true,
            margenLaboralId: true,
            diaId: true,
            estado: true,
          },
        });
        const existentesPorClave = new Set(
          existentes.map((r) => clave(r.margenLaboralId, r.diaId)),
        );

        // La clave deseada usa el diaId real del margen: las asignaciones
        // antiguas con un diaId obsoleto se consideran distintas y se eliminan.
        const aEliminar = existentes
          .filter((r) => !deseadas.has(clave(r.margenLaboralId, r.diaId)))
          .map((r) => r.id);
        const aAgregar = [...deseadas.entries()]
          .filter(([claveMargen]) => !existentesPorClave.has(claveMargen))
          .map(([, m]) => ({
            barberoId: id,
            margenLaboralId: m.id,
            diaId: m.diaId,
          }));
        // Una asignación conservada pero desactivada no habilita reservas;
        // si el usuario la mantiene seleccionada, se vuelve a activar.
        const aReactivar = existentes
          .filter(
            (r) =>
              !r.estado && deseadas.has(clave(r.margenLaboralId, r.diaId)),
          )
          .map((r) => r.id);

        if (aEliminar.length) {
          await tx.margen_laboral_barbero.deleteMany({
            where: { id: { in: aEliminar } },
          });
        }
        if (aAgregar.length) {
          await tx.margen_laboral_barbero.createMany({ data: aAgregar });
        }
        if (aReactivar.length) {
          await tx.margen_laboral_barbero.updateMany({
            where: { id: { in: aReactivar } },
            data: { estado: true },
          });
        }
      }
    },
    { maxWait: MAX_WAIT_TRANSACCION_MS, timeout: TIMEOUT_TRANSACCION_MS },
  );
}
