import { createElement } from "react";
import { render } from "@react-email/render";
import { EmailTurno } from "@/emails/EmailTurno";
import type { DatosEmailTurno } from "./turno-datos-email";
import { enviarCorreo } from "./enviar-correo";

const ASUNTOS_CLIENTE: Record<DatosEmailTurno["estado"], string> = {
  CREADO: "Turno Confirmado",
  CONFIRMADO: "Turno Confirmado",
  ACTUALIZADO: "Turno Modificado",
  CANCELADO: "Turno Cancelado",
};

const ASUNTOS_BARBERO: Record<DatosEmailTurno["estado"], string> = {
  CREADO: "Nuevo Turno Reservado",
  CONFIRMADO: "Turno Confirmado",
  ACTUALIZADO: "Turno Modificado",
  CANCELADO: "Turno Cancelado",
};

export async function sendTurnoEmail(
  to: string,
  datos: DatosEmailTurno,
  destinatario: "cliente" | "barbero" = "cliente",
) {
  return enviarCorreo(to, async ({ barberiaNombre, moneda, colores }) => ({
    asunto: `${(destinatario === "barbero" ? ASUNTOS_BARBERO : ASUNTOS_CLIENTE)[datos.estado]} - ${barberiaNombre}`,
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
