import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PagoStatusPage from "@/app/pago/status/page";
import PagoSuccessPage from "@/app/pago/success/page";
import { POST } from "./route";

const dobles = vi.hoisted(() => ({
  after: vi.fn<(tarea: () => Promise<void>) => void>(),
  buscarTurno: vi.fn(),
  buscarPago: vi.fn(),
  actualizarTurno: vi.fn(),
  enviarAlCliente: vi.fn(),
  enviarAlBarbero: vi.fn(),
  enviarPush: vi.fn(),
  revalidar: vi.fn(),
  propietarioOAdmin: vi.fn(),
  sesion: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/server")>(),
  after: dobles.after,
}));
vi.mock("mercadopago", () => ({ Payment: class { get = dobles.buscarPago; } }));
vi.mock("@/lib/mercadopago/obtener-cliente", () => ({ obtenerClienteMP: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { turno: { findUnique: dobles.buscarTurno, updateMany: dobles.actualizarTurno } },
}));
vi.mock("@/lib/revalidar/revalidar-cache-turno", () => ({ revalidarCacheTurno: dobles.revalidar }));
vi.mock("@/lib/email/enviar-email-turno-seguro", () => ({ enviarEmailTurnoSeguro: dobles.enviarAlCliente }));
vi.mock("@/lib/email/enviar-email-turno-barbero-seguro", () => ({ enviarEmailTurnoBarberoSeguro: dobles.enviarAlBarbero }));
vi.mock("@/lib/notificaciones/enviar-aviso-push-turno", () => ({ enviarAvisoPushTurno: dobles.enviarPush }));
vi.mock("@/lib/seguridad/requerir-sesion", () => ({ requerirSesion: dobles.sesion }));
vi.mock("@/lib/seguridad/requerir-propietario", () => ({ requerirPropietarioOAdmin: dobles.propietarioOAdmin }));
vi.mock("@/lib/obtener-config-cacheada", () => ({ obtenerConfigCacheada: vi.fn() }));

const secreto = "secreto-sintetico";
const pago = { id: 123, status: "approved", external_reference: "turno-1", transaction_amount: 200, metadata: { tipoPago: "SEÑA" } };
const horarioReservado = new Date("2099-03-20T14:00:00.000Z");
const turnoInicial = {
  id: pago.external_reference,
  userId: "cliente-1",
  barberoId: "barbero-1",
  estado: "PENDIENTE",
  estadoPago: "PENDIENTE",
  tipoPago: "SEÑA",
  metodoPago: "MERCADO_PAGO",
  mpPaymentId: null as string | null,
  claveSlot: `barbero-1|${horarioReservado.toISOString()}` as string | null,
  horarioReservado,
  precioCongelado: 1000,
  seniaCongelada: 200,
};
const sesion = { user: { id: turnoInicial.userId } };
type Turno = typeof turnoInicial;

function diferir<T>() {
  let resolver!: (valor: T) => void;
  const promesa = new Promise<T>((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

function notificacion({ segundos = false, firmaInvalida = false, id = pago.id } = {}) {
  const requestId = "notificacion-prueba";
  const ts = String(segundos ? Math.floor(Date.now() / 1000) : Date.now());
  const firma = createHmac("sha256", firmaInvalida ? "distinto" : secreto)
    .update(`id:${id};request-id:${requestId};ts:${ts};`)
    .digest("hex");
  return new NextRequest(`http://localhost/api/mercadopago/webhook?data.id=${id}&type=payment`, {
    method: "POST",
    headers: { "x-signature": `ts=${ts},v1=${firma}`, "x-request-id": requestId, "content-type": "application/json" },
    body: JSON.stringify({ type: "payment", data: { id: String(id) }, id: 1 }),
  });
}

const retorno = (paymentId = String(pago.id)) => ({
  searchParams: Promise.resolve({ turnoId: turnoInicial.id, payment_id: paymentId, status: "approved" }),
});

describe("retorno y webhook de Mercado Pago", () => {
  let turno: Turno;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("MP_WEBHOOK_SECRET", secreto);
    vi.stubGlobal("React", React);
    turno = { ...turnoInicial };
    dobles.sesion.mockResolvedValue(sesion);
    dobles.propietarioOAdmin.mockResolvedValue(sesion);
    dobles.buscarPago.mockResolvedValue(pago);
    dobles.buscarTurno.mockImplementation(async ({ where }: { where: { id: string } }) =>
      where.id === turno.id ? { ...turno } : null);
    dobles.actualizarTurno.mockImplementation(async ({ where, data }: {
      where: { id: string; estado: string | { in: string[] }; mpPaymentId?: string };
      data: Partial<Turno>;
    }) => {
      const estados = typeof where.estado === "string" ? [where.estado] : where.estado.in;
      if (where.id !== turno.id || !estados.includes(turno.estado) ||
          (where.mpPaymentId !== undefined && where.mpPaymentId !== turno.mpPaymentId)) {
        return { count: 0 };
      }
      turno = { ...turno, ...data };
      return { count: 1 };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("consulta Mercado Pago una vez entre el webhook y las dos páginas de retorno", async () => {
    const consulta = diferir<typeof pago>();
    const inicioConsulta = diferir<void>();
    dobles.buscarPago.mockImplementationOnce(() => {
      inicioConsulta.resolver();
      return consulta.promesa;
    });
    const webhook = POST(notificacion({ segundos: true }));
    await inicioConsulta.promesa;

    try {
      expect(renderToStaticMarkup(await PagoSuccessPage(retorno()))).toContain("Pago en revisión");
      expect(renderToStaticMarkup(await PagoStatusPage(retorno()))).toContain("Actualizar estado");
      expect(dobles.buscarPago.mock.calls).toEqual([[{ id: String(pago.id) }]]);
      expect(dobles.actualizarTurno).not.toHaveBeenCalled();
    } finally {
      consulta.resolver(pago);
    }

    expect((await webhook).status).toBe(200);
    expect(turno).toMatchObject({ estado: "CONFIRMADO", estadoPago: "SEÑADO", mpPaymentId: String(pago.id) });
    expect(renderToStaticMarkup(await PagoSuccessPage(retorno()))).toContain("¡Seña pagada!");
    expect(renderToStaticMarkup(await PagoStatusPage(retorno("456")))).toContain("Pago en revisión");
    expect(dobles.buscarPago).toHaveBeenCalledTimes(1);

    const reintentos = await Promise.all([POST(notificacion()), POST(notificacion())]);
    expect(reintentos.map((respuesta) => respuesta.status)).toEqual([200, 200]);
    expect(dobles.actualizarTurno).toHaveBeenCalledTimes(1);
    expect(dobles.after).toHaveBeenCalledTimes(1);
    await dobles.after.mock.lastCall?.[0]();
    const aviso = [expect.objectContaining({ estado: "CONFIRMADO" }), "CONFIRMADO"];
    expect(dobles.enviarAlCliente.mock.calls).toEqual([aviso]);
    expect(dobles.enviarAlBarbero.mock.calls).toEqual([aviso]);
    expect(dobles.enviarPush.mock.calls).toEqual([aviso]);
  });

  it("envía avisos una vez cuando dos webhooks leen el turno como pendiente", async () => {
    const lecturas = diferir<void>();
    const leerTurnoPendiente = async () => {
      const copia = { ...turno };
      await lecturas.promesa;
      return copia;
    };
    dobles.buscarTurno.mockImplementationOnce(leerTurnoPendiente).mockImplementationOnce(() => {
      const copia = leerTurnoPendiente();
      lecturas.resolver();
      return copia;
    });

    const respuestas = await Promise.all([POST(notificacion()), POST(notificacion())]);

    expect(respuestas.map((respuesta) => respuesta.status)).toEqual([200, 200]);
    expect(turno.estado).toBe("CONFIRMADO");
    expect(dobles.actualizarTurno).toHaveBeenCalledTimes(2);
    expect(dobles.revalidar).toHaveBeenCalledTimes(1);
    expect(dobles.after).toHaveBeenCalledTimes(1);
    await dobles.after.mock.lastCall?.[0]();
    expect(dobles.enviarAlCliente).toHaveBeenCalledTimes(1);
    expect(dobles.enviarAlBarbero).toHaveBeenCalledTimes(1);
    expect(dobles.enviarPush).toHaveBeenCalledTimes(1);
  });

  it("procesa acreditación y devolución posteriores del mismo pago", async () => {
    dobles.buscarPago.mockResolvedValueOnce({ ...pago, status: "pending" });
    expect((await POST(notificacion())).status).toBe(200);
    expect(renderToStaticMarkup(await PagoStatusPage(retorno()))).toContain("Pago pendiente");
    expect(dobles.after).not.toHaveBeenCalled();

    expect((await POST(notificacion())).status).toBe(200);
    expect(renderToStaticMarkup(await PagoStatusPage(retorno()))).toContain("¡Seña pagada!");

    dobles.buscarPago.mockResolvedValueOnce({ ...pago, status: "refunded" });
    expect((await POST(notificacion())).status).toBe(200);
    expect(turno).toMatchObject({ estado: "CANCELADO", estadoPago: "CANCELADO", claveSlot: null });
    expect(renderToStaticMarkup(await PagoStatusPage(retorno()))).toContain("Pago no acreditado");
    expect(dobles.after).toHaveBeenCalledTimes(1);
  });

  it("rechaza una notificación sin firma válida y oculta el turno a otra cuenta", async () => {
    expect((await POST(notificacion({ firmaInvalida: true }))).status).toBe(401);
    dobles.propietarioOAdmin.mockResolvedValue(null);
    expect(renderToStaticMarkup(await PagoSuccessPage(retorno()))).toContain("Error en la solicitud");
    expect(dobles.buscarPago).not.toHaveBeenCalled();
    expect(dobles.actualizarTurno).not.toHaveBeenCalled();
    expect(dobles.after).not.toHaveBeenCalled();
  });

  it("verifica el monto de Mercado Pago y admite reintentos ante un fallo de la API", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    dobles.buscarPago.mockResolvedValueOnce({ ...pago, transaction_amount: 100 });
    dobles.buscarPago.mockRejectedValueOnce(new Error("API fuera de servicio"));

    expect((await POST(notificacion())).status).toBe(400);
    expect((await POST(notificacion())).status).toBe(500);
    expect(turno.estado).toBe("PENDIENTE");
    expect(dobles.after).not.toHaveBeenCalled();

    expect((await POST(notificacion())).status).toBe(200);
    expect(turno.estado).toBe("CONFIRMADO");
    expect(dobles.after).toHaveBeenCalledTimes(1);
  });
});
