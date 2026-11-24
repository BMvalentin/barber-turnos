import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerCapacidadHoraria, obtenerDisponibilidad } from "./disponibilidad";
import { filtrarHorariosPorDuracion } from "@/lib/turnos/capacidad-horaria";

const consultas = vi.hoisted(() => ({
  barbero: vi.fn(),
  horarios: vi.fn(),
  turnos: vi.fn(),
  excepciones: vi.fn(),
  servicio: vi.fn(),
  asignacion: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    barbero: { findUnique: consultas.barbero },
    margen_laboral_barbero: { findMany: consultas.horarios },
    turno: { findMany: consultas.turnos },
    excepcion_laboral: { findMany: consultas.excepciones },
    servicio: { findUnique: consultas.servicio },
    servicioxbarbero: { findUnique: consultas.asignacion },
  },
}));

const fecha = "2026-11-23";
const horaUtc = (hora: string) => `${fecha}T${hora}:00.000Z`;

function margen(desde: string, hasta: string) {
  return { margenLaboral: { estado: true, desde, hasta, dia: { estado: true, dia: "Lunes" } } };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(horaUtc("11:55")));
  consultas.barbero.mockResolvedValue({ estado: true });
  consultas.horarios.mockResolvedValue([margen("09:00", "12:00"), margen("13:10", "14:10")]);
  consultas.turnos.mockResolvedValue([
    { horarioReservado: new Date(horaUtc("13:00")), servicio: { duracion: 30 } },
  ]);
  consultas.excepciones.mockResolvedValue([
    { desde: new Date(horaUtc("14:15")), hasta: new Date(horaUtc("14:45")) },
  ]);
  consultas.servicio.mockResolvedValue({ estado: true, duracion: 45 });
  consultas.asignacion.mockResolvedValue({ id: "asignacion" });
});

afterEach(() => vi.useRealTimers());

describe("capacidad de la agenda", () => {
  it("permite cambiar entre duraciones más cortas y largas con la misma lectura", async () => {
    const capacidad = await obtenerCapacidadHoraria("barbero", fecha, fecha);

    expect(filtrarHorariosPorDuracion(capacidad, 15)[fecha]).toEqual([
      "12:15", "12:30", "12:45", "13:30", "13:45", "16:10", "16:25", "16:40", "16:55",
    ].map(horaUtc));
    expect(filtrarHorariosPorDuracion(capacidad, 45)[fecha]).toEqual(["12:15", "16:10", "16:25"].map(horaUtc));
    expect(filtrarHorariosPorDuracion(capacidad, 60)[fecha]).toEqual([horaUtc("16:10")]);
    expect(consultas.turnos).toHaveBeenCalledTimes(1);
    expect(consultas.servicio).not.toHaveBeenCalled();
  });

  it("revisa la anticipación al reutilizar la capacidad después de que avanza el reloj", async () => {
    const capacidad = await obtenerCapacidadHoraria("barbero", fecha, fecha);
    const inicios = filtrarHorariosPorDuracion(capacidad, 30, Date.parse(horaUtc("12:20")))[fecha];

    expect(inicios).not.toContain(horaUtc("12:30"));
    expect(inicios).toContain(horaUtc("13:30"));
  });

  it("mantiene la exclusión del turno en edición y el filtro por servicio en la lectura diaria", async () => {
    const horarios = await obtenerDisponibilidad("servicio", "barbero", fecha, fecha, "turno-editado");

    expect(horarios[fecha]).toContain(horaUtc("16:10"));
    expect(consultas.turnos).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ barberoId: "barbero", id: { not: "turno-editado" } }),
    }));

    consultas.asignacion.mockResolvedValueOnce(null);
    expect(await obtenerDisponibilidad("otro", "barbero", fecha, fecha)).toEqual({});
  });
});
