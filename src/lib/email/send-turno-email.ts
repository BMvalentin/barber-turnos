import { createElement } from "react";
import { render } from "@react-email/render";
import { EmailTurno } from "@/emails/EmailTurno";
import type { DatosEmailTurno } from "./turno-datos-email";
import { enviarCorreo } from "./enviar-correo";

const ASUNTOS_CLIENTE: Record<DatosEmailTurno["estado"], string> = {
  CREADO: "Turno registrado",
  CONFIRMADO: "Turno Confirmado",
  ACTUALIZADO: "Turno Modificado",
  CANCELADO: "Turno Cancelado",
  NUEVA_RESERVA: "Nueva reserva registrada",
};

const ASUNTOS_BARBERO: Record<DatosEmailTurno["estado"], string> = {
  CREADO: "Nuevo Turno Reservado",
  CONFIRMADO: "Turno Confirmado",
  ACTUALIZADO: "Turno Modificado",
  CANCELADO: "Turno Cancelado",
  NUEVA_RESERVA: "Nueva reserva registrada",
};

const ASUNTOS_ADMINISTRADOR: Record<DatosEmailTurno["estado"], string> = {
  CREADO: "Turno registrado",
  CONFIRMADO: "Turno Confirmado",
  ACTUALIZADO: "Turno Modificado",
  CANCELADO: "Turno Cancelado",
  NUEVA_RESERVA: "Nueva reserva registrada",
};

export async function sendTurnoEmail(
  to: string,
  datos: DatosEmailTurno,
  destinatario: "cliente" | "barbero" | "administrador" = "cliente",
) {
  return enviarCorreo(to, async ({ barberiaNombre, moneda, colores }) => ({
    asunto: `${(destinatario === "barbero"
      ? ASUNTOS_BARBERO
      : destinatario === "administrador" ? ASUNTOS_ADMINISTRADOR : ASUNTOS_CLIENTE)[datos.estado]} - ${barberiaNombre}`,
    html: await render(
      createElement(EmailTurno, {
        datos,
        colores,
        barberiaNombre,
        moneda,
        destinatario,
      }),
    ),
  }));
}
