import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTurno, reservarTurnoPropio } from "./crear.actions";

const dependencias = vi.hoisted(() => ({
  requerirSesion: vi.fn(),
  requerirPanel: vi.fn(),
  requerirAdmin: vi.fn(),
  buscarUsuario: vi.fn(),
  crearTurnoEnTransaccion: vi.fn(),
  serializarTurnoConDetalle: vi.fn(),
  after: vi.fn<(tarea: () => Promise<void>) => void>(),
  enviarPush: vi.fn(),
}));

vi.mock("next/server", () => ({ after: dependencias.after }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: dependencias.buscarUsuario },
    slotLock: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
  },
}));
vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: dependencias.requerirSesion }));
vi.mock("@/lib/seguridad/requerir-admin", () => ({
  requerirAdmin: dependencias.requerirAdmin,
  requerirPanel: dependencias.requerirPanel,
}));
vi.mock("@/lib/email/enviar-email-turno-seguro", () => ({ enviarEmailTurnoSeguro: vi.fn() }));
vi.mock("@/lib/email/enviar-email-turno-barbero-seguro", () => ({ enviarEmailTurnoBarberoSeguro: vi.fn() }));
vi.mock("@/lib/email/enviar-email-nueva-reserva-seguro", () => ({ enviarEmailNuevaReservaSeguro: vi.fn() }));
vi.mock("@/lib/notificaciones/enviar-aviso-push-turno", () => ({ enviarAvisoPushTurno: dependencias.enviarPush }));
vi.mock("@/lib/turnos/revalidar-disponibilidad-turno", () => ({ revalidarDisponibilidadTurno: vi.fn() }));
vi.mock("@/lib/serializar-turno-con-detalle", () => ({ serializarTurnoConDetalle: dependencias.serializarTurnoConDetalle }));
vi.mock("@/lib/crear-turno-transaccion", () => ({ crearTurnoEnTransaccion: dependencias.crearTurnoEnTransaccion }));

function formulario() {
  const datos = new FormData();
  datos.set("servicioId", "servicio");
  datos.set("barberoId", "barbero");
  datos.set("horarioReservado", new Date(Date.now() + 60 * 60 * 1000).toISOString());
  return datos;
}

beforeEach(() => {
  vi.resetAllMocks();
  dependencias.buscarUsuario.mockResolvedValue({ telefono: "+54 9 1100000000" });
  dependencias.crearTurnoEnTransaccion.mockResolvedValue({
    ok: true,
    creado: true,
    turno: { userId: "cuenta" },
  });
  dependencias.serializarTurnoConDetalle.mockReturnValue({ id: "turno" });
});

describe("reserva personal", () => {
  it.each(["USER", "ADMIN", "EMPLEADO"])("reserva para la sesión %s aunque el formulario incluya datos de gestión", async (role) => {
    dependencias.requerirSesion.mockResolvedValue({ user: { id: "cuenta", role } });
    const datos = formulario();
    datos.set("userId", "nuevo");
    datos.set("estadoPago", "PAGADO");

    const resultado = await reservarTurnoPropio({}, datos);

    expect(resultado).toEqual({ success: true, data: { id: "turno" } });
    expect(dependencias.requerirPanel).not.toHaveBeenCalled();
    expect(dependencias.crearTurnoEnTransaccion).toHaveBeenCalledWith(expect.objectContaining({
      userId: "cuenta",
      clienteNuevo: undefined,
      estadoPago: "PENDIENTE",
      confirmarSinSeña: true,
    }));
  });

  it("requiere sesión y teléfono también para una cuenta del personal", async () => {
    await expect(reservarTurnoPropio({}, formulario())).resolves.toMatchObject({ success: false, error: "Iniciá sesión para reservar un turno" });
    dependencias.requerirSesion.mockResolvedValue({ user: { id: "cuenta", role: "ADMIN" } });
    dependencias.buscarUsuario.mockResolvedValue({ telefono: null });

    await expect(reservarTurnoPropio({}, formulario())).resolves.toMatchObject({ success: false, error: expect.stringContaining("teléfono") });
    expect(dependencias.crearTurnoEnTransaccion).not.toHaveBeenCalled();
    expect(dependencias.after).not.toHaveBeenCalled();
  });

  it("mantiene la elección de cliente desde el panel con autorización", async () => {
    const sesion = { user: { id: "cuenta", role: "ADMIN" } };
    dependencias.requerirSesion.mockResolvedValue(sesion);
    dependencias.requerirPanel.mockResolvedValue({ rol: "ADMIN" });
    dependencias.requerirAdmin.mockResolvedValue(sesion);
    const datos = formulario();
    datos.set("userId", "otro-cliente");

    await expect(createTurno({}, datos)).resolves.toMatchObject({ success: true });
    expect(dependencias.crearTurnoEnTransaccion).toHaveBeenCalledWith(expect.objectContaining({
      userId: "otro-cliente",
      confirmarSinSeña: false,
    }));
  });
});

describe("avisos push al reservar", () => {
  it.each([
    { creado: true, estado: "PENDIENTE", avisos: ["NUEVO_BARBERO"] },
    { creado: true, estado: "CONFIRMADO", avisos: ["NUEVO_BARBERO", "CONFIRMADO"] },
    { creado: false, estado: "CONFIRMADO", avisos: [] },
  ])("agenda $avisos con creado=$creado y estado $estado", async ({ creado, estado, avisos }) => {
    dependencias.requerirSesion.mockResolvedValue({ user: { id: "cuenta" } });
    const turno = {
      id: "turno", userId: "cuenta", barberoId: "barbero", estado,
      horarioReservado: new Date(Date.now() + 60 * 60 * 1000),
    };
    dependencias.crearTurnoEnTransaccion.mockResolvedValue({ ok: true, creado, turno });

    await expect(reservarTurnoPropio({}, formulario())).resolves.toMatchObject({ success: true });
    expect(dependencias.enviarPush).not.toHaveBeenCalled();
    await dependencias.after.mock.lastCall?.[0]();

    expect(dependencias.enviarPush.mock.calls).toEqual(avisos.map((aviso) => [turno, aviso]));
  });
});
