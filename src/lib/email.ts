import { createElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { prisma } from "@/lib/prisma";
import { EmailTurno, type ColoresEmail } from "@/emails/EmailTurno";
import type { DatosEmailTurno } from "@/lib/turno-datos-email";
import {
  elegirColorTexto,
  mezclarConBlanco,
  obtenerTintaLejible,
} from "@/lib/contraste";

const COLOR_PRIMARIO_DEFECTO = "#d97706";
const COLOR_SECUNDARIO_DEFECTO = "#78350f";
const NOMBRE_BARBERIA_DEFECTO = "Tu Barbería";

const ASUNTOS: Record<DatosEmailTurno["estado"], string> = {
  CREADO: "Turno Confirmado",
  ACTUALIZADO: "Turno Modificado",
  CANCELADO: "Turno Cancelado",
};

function construirColores(primario: string, secundario: string): ColoresEmail {
  return {
    primario,
    textoPrimario: elegirColorTexto(primario),
    secundario,
    tintaSecundario: obtenerTintaLejible(secundario),
    primarioSuave: mezclarConBlanco(primario, 0.92),
  };
}

export async function sendTurnoEmail(to: string, datos: DatosEmailTurno) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY no configurada" };
  }

  try {
    const config = await prisma.pageConfig.findFirst();
    const primario = config?.primaryColor ?? COLOR_PRIMARIO_DEFECTO;
    const secundario = config?.secondaryColor ?? COLOR_SECUNDARIO_DEFECTO;
    const barberiaNombre = config?.name ?? NOMBRE_BARBERIA_DEFECTO;
    const moneda = config?.currency ?? "ARS";
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const html = await render(
      createElement(EmailTurno, {
        datos,
        colores: construirColores(primario, secundario),
        barberiaNombre,
        moneda,
      }),
    );

    const resend = new Resend(process.env.RESEND_API_KEY);
    const asunto = `${ASUNTOS[datos.estado]} - ${barberiaNombre}`;

    await resend.emails.send({
      from: `${barberiaNombre} <${from}>`,
      to,
      bcc: process.env.NOTIFICATION_EMAIL,
      subject: asunto,
      html,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
