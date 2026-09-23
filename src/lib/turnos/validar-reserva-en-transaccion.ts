import { toZonedTime } from "date-fns-tz";
import { Prisma } from "../../../generated/prisma/client";
import {
  ESTADOS_TURNO_ACTIVOS,
  MAPA_DIA_SEMANA_DB,
  ZONA_HORARIA,
} from "@/lib/constants";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { obtenerRangoDelDia } from "@/lib/utils/obtener-rango-del-dia";

type ParametrosValidacionReserva = {
  servicioId: string;
  barberoId: string;
  userId: string;
  inicio: Date;
  idUsuarioActual: string;
  turnoIdAExcluir?: string;
};

export type ReservaValidada = {
  duracion: number;
  precio: Prisma.Decimal;
  senia: Prisma.Decimal;
  user: {
    id: string;
    name: string | null;
    email: string;
    telefono: string | null;
  };
  barbero: {
    id: string;
    srcImage: string | null;
    nombre: string;
    email: string | null;
    usuarioId: string | null;
    estado: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  servicio: {
    id: string;
    descripcion: string | null;
    nombre: string;
    srcImage: string | null;
    estado: boolean;
    createdAt: Date;
    updatedAt: Date;
    descuento: Prisma.Decimal;
    duracion: number;
    precio: Prisma.Decimal;
    senia: Prisma.Decimal;
  };
};

type ValorBooleanoDb = boolean | number | string | bigint;

type FilaValidacionReserva = {
  usuarioId: string;
  usuarioNombre: string | null;
  usuarioEmail: string;
  usuarioTelefono: string | null;
  barberoId: string;
  barberoImagen: string | null;
  barberoNombre: string;
  barberoEmail: string | null;
  barberoUsuarioId: string | null;
  servicioEstado: ValorBooleanoDb;
  barberoEstado: ValorBooleanoDb;
  barberoCreado: Date;
  barberoActualizado: Date;
  relacionId: string | null;
  servicioId: string;
  servicioDescripcion: string | null;
  servicioNombre: string;
  servicioImagen: string | null;
  servicioCreado: Date;
  servicioActualizado: Date;
  descuento: Prisma.Decimal | string | number;
  duracion: number;
  precio: Prisma.Decimal | string | number;
  senia: Prisma.Decimal | string | number;
  diaLaboralExiste: ValorBooleanoDb;
  margenValido: ValorBooleanoDb;
  excepcionMotivo: string | null;
  hayChoque: ValorBooleanoDb;
  hayLockAjeno: ValorBooleanoDb;
};

function esVerdaderoDb(valor: ValorBooleanoDb): boolean {
  return valor === true || String(valor) === "1";
}

/** Valida en la transacción que la reserva sea posible con los datos actuales. */
export async function validarReservaEnTransaccion(
  tx: Prisma.TransactionClient,
  parametros: ParametrosValidacionReserva,
): Promise<ReservaValidada> {
  const inicioZonado = toZonedTime(parametros.inicio, ZONA_HORARIA);
  const minutosInicio = inicioZonado.getHours() * 60 + inicioZonado.getMinutes();
  const diaSemana = MAPA_DIA_SEMANA_DB[inicioZonado.getDay()];
  const fechaSolo = obtenerFechaSola(parametros.inicio);
  const { inicio: inicioDia, fin: finDia } = obtenerRangoDelDia(fechaSolo);
  const ahora = new Date();
  const filtroTurnoExcluido = parametros.turnoIdAExcluir
    ? Prisma.sql`AND t.id <> ${parametros.turnoIdAExcluir}`
    : Prisma.empty;

  /*
   * Todas estas comprobaciones dependen del mismo snapshot y se ejecutan después
   * de tomar el bloqueo de la agenda del barbero. Además se recuperan las
   * relaciones que necesita la respuesta para evitar otra lectura posterior.
   */
  const filas = await tx.$queryRaw<FilaValidacionReserva[]>(Prisma.sql`
    SELECT
      u.id AS usuarioId,
      u.name AS usuarioNombre,
      u.email AS usuarioEmail,
      u.telefono AS usuarioTelefono,
      b.id AS barberoId,
      b.srcImage AS barberoImagen,
      b.nombre AS barberoNombre,
      b.email AS barberoEmail,
      b.usuarioId AS barberoUsuarioId,
      s.estado AS servicioEstado,
      b.estado AS barberoEstado,
      b.createdAt AS barberoCreado,
      b.updatedAt AS barberoActualizado,
      sx.id AS relacionId,
      s.id AS servicioId,
      s.descripcion AS servicioDescripcion,
      s.nombre AS servicioNombre,
      s.srcImage AS servicioImagen,
      s.createdAt AS servicioCreado,
      s.updatedAt AS servicioActualizado,
      s.descuento,
      s.duracion,
      s.precio,
      s.senia,
      EXISTS(
        SELECT 1
        FROM dia_laboral dl
        WHERE dl.dia = ${diaSemana}
          AND dl.estado = TRUE
      ) AS diaLaboralExiste,
      EXISTS(
        SELECT 1
        FROM dia_laboral dl
        INNER JOIN margen_laboral ml ON ml.diaId = dl.id
        INNER JOIN margen_laboral_barbero mlb
          ON mlb.margenLaboralId = ml.id
          AND mlb.diaId = dl.id
        WHERE dl.dia = ${diaSemana}
          AND dl.estado = TRUE
          AND ml.estado = TRUE
          AND mlb.estado = TRUE
          AND mlb.barberoId = ${parametros.barberoId}
          AND TIME_TO_SEC(ml.desde) <= ${minutosInicio * 60}
          AND TIME_TO_SEC(ml.hasta) >= ((${minutosInicio} + s.duracion) * 60)
      ) AS margenValido,
      (
        SELECT ex.motivo
        FROM excepcion_laboral ex
        WHERE ex.estado = TRUE
          AND ex.desde <= DATE_ADD(${parametros.inicio}, INTERVAL s.duracion MINUTE)
          AND ex.hasta >= ${parametros.inicio}
          AND (ex.barberoId = ${parametros.barberoId} OR ex.barberoId IS NULL)
        ORDER BY ex.desde ASC
        LIMIT 1
      ) AS excepcionMotivo,
      EXISTS(
        SELECT 1
        FROM turno t
        INNER JOIN servicio st ON st.id = t.servicioId
        WHERE t.barberoId = ${parametros.barberoId}
          AND t.estado IN (${Prisma.join([...ESTADOS_TURNO_ACTIVOS])})
          AND t.horarioReservado >= ${inicioDia}
          AND t.horarioReservado <= ${finDia}
          AND t.horarioReservado < DATE_ADD(${parametros.inicio}, INTERVAL s.duracion MINUTE)
          AND DATE_ADD(t.horarioReservado, INTERVAL st.duracion MINUTE) > ${parametros.inicio}
          ${filtroTurnoExcluido}
      ) AS hayChoque,
      EXISTS(
        SELECT 1
        FROM SlotLock sl
        WHERE sl.barberoId = ${parametros.barberoId}
          AND sl.horarioReservado = ${parametros.inicio}
          AND sl.expiresAt > ${ahora}
          AND sl.userId <> ${parametros.idUsuarioActual}
      ) AS hayLockAjeno
    FROM barbero b
    CROSS JOIN servicio s
    CROSS JOIN \`user\` u
    LEFT JOIN servicioxbarbero sx
      ON sx.barberoId = b.id
      AND sx.servicioId = s.id
    WHERE b.id = ${parametros.barberoId}
      AND s.id = ${parametros.servicioId}
      AND u.id = ${parametros.userId}
    LIMIT 1
  `);

  const fila = filas[0];
  if (!fila || !esVerdaderoDb(fila.servicioEstado)) {
    throw new Error("SERVICIO_NO_DISPONIBLE");
  }
  if (!esVerdaderoDb(fila.barberoEstado)) throw new Error("BARBERO_NO_DISPONIBLE");
  if (!fila.relacionId) throw new Error("SERVICIO_NO_ASIGNADO");
  if (fila.excepcionMotivo) throw new Error(`EXCEPCION:${fila.excepcionMotivo}`);
  if (!esVerdaderoDb(fila.diaLaboralExiste)) throw new Error("CERRADO");
  if (!esVerdaderoDb(fila.margenValido)) throw new Error("FUERA_DE_RANGO");
  if (esVerdaderoDb(fila.hayChoque)) throw new Error("TURNO_OCUPADO");
  if (esVerdaderoDb(fila.hayLockAjeno)) throw new Error("TURNO_LOCKED");

  const precio = new Prisma.Decimal(fila.precio);
  const senia = new Prisma.Decimal(fila.senia);
  return {
    duracion: fila.duracion,
    precio,
    senia,
    user: {
      id: fila.usuarioId,
      name: fila.usuarioNombre,
      email: fila.usuarioEmail,
      telefono: fila.usuarioTelefono,
    },
    barbero: {
      id: fila.barberoId,
      srcImage: fila.barberoImagen,
      nombre: fila.barberoNombre,
      email: fila.barberoEmail,
      usuarioId: fila.barberoUsuarioId,
      estado: esVerdaderoDb(fila.barberoEstado),
      createdAt: fila.barberoCreado,
      updatedAt: fila.barberoActualizado,
    },
    servicio: {
      id: fila.servicioId,
      descripcion: fila.servicioDescripcion,
      nombre: fila.servicioNombre,
      srcImage: fila.servicioImagen,
      estado: esVerdaderoDb(fila.servicioEstado),
      createdAt: fila.servicioCreado,
      updatedAt: fila.servicioActualizado,
      descuento: new Prisma.Decimal(fila.descuento),
      duracion: fila.duracion,
      precio,
      senia,
    },
  };
}
