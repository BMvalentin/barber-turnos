import { describe, expect, it } from "vitest";
import { construirDatosEmailTurno } from "./turno-datos-email";

const turnoBase = {
  clienteNombre: "Valentín",
  clienteApellido: "Méndez",
  clienteTelefono: "2231234567",
  estado: "PENDIENTE" as const,
  estadoPago: "PENDIENTE" as const,
  metodoPago: "MERCADO_PAGO",
  tipoPago: "SEÑA",
  horarioReservado: new Date("2026-12-10T15:00:00.000Z"),
  precioCongelado: 1000,
  seniaCongelada: 200,
  user: { name: "Valentín Méndez", telefono: "2231234567" },
  servicio: { nombre: "Corte" },
  barbero: { nombre: "Julian", email: "barbero@example.com" },
};

describe("construirDatosEmailTurno", () => {
  it("marca una reserva pendiente sin abono y conserva el importe de seña pendiente", () => {
    const datos = construirDatosEmailTurno(turnoBase, "NUEVA_RESERVA");

    expect(datos.estado).toBe("NUEVA_RESERVA");
    expect(datos.estadoTurno).toBe("PENDIENTE");
    expect(datos.estadoPago).toBe("PENDIENTE");
    expect(datos.montoPagado).toBe(0);
    expect(datos.señaPendiente).toBe(200);
    expect(datos.saldoPendiente).toBe(1000);
  });

  it("no considera acreditada una transferencia que sigue en revisión", () => {
    const datos = construirDatosEmailTurno({
      ...turnoBase,
      metodoPago: "TRANSFERENCIA",
      estadoPago: "EN_ACREDITACION",
    }, "NUEVA_RESERVA");

    expect(datos.estadoPago).toBe("EN_ACREDITACION");
    expect(datos.metodoPago).toBe("TRANSFERENCIA");
    expect(datos.montoPagado).toBe(0);
    expect(datos.señaPendiente).toBe(200);
  });

  it("calcula seña acreditada y saldo restante", () => {
    const datos = construirDatosEmailTurno({
      ...turnoBase,
      estado: "CONFIRMADO",
      estadoPago: "SEÑADO",
    }, "CONFIRMADO");

    expect(datos.montoPagado).toBe(200);
    expect(datos.señaPendiente).toBe(0);
    expect(datos.saldoPendiente).toBe(800);
  });

  it.each([
    { estadoPago: "PAGADO" as const, tipoPago: "TOTAL" },
    { estadoPago: "APROBADO" as const, tipoPago: "TOTAL" },
  ])("no muestra saldo pendiente cuando el pago total está acreditado ($estadoPago)", ({ estadoPago, tipoPago }) => {
    const datos = construirDatosEmailTurno({
      ...turnoBase,
      estado: "CONFIRMADO",
      estadoPago,
      tipoPago,
    }, "CONFIRMADO");

    expect(datos.montoPagado).toBe(1000);
    expect(datos.señaPendiente).toBe(0);
    expect(datos.saldoPendiente).toBe(0);
  });
});
