import { createElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { prisma } from "@/lib/prisma";
import { EmailTurno, type ColoresEmail } from "@/emails/EmailTurno";
import type { DatosEmailTurno } from "./turno-datos-email";
import { elegirColorTexto } from "@/lib/contraste/elegir-color-texto";
import { mezclarConBlanco } from "@/lib/contraste/mezclar-con-blanco";
import { obtenerTintaLejible } from "@/lib/contraste/obtener-tinta-lejible";

const COLOR_PRIMARIO_DEFECTO = "#d97706";
const COLOR_SECUNDARIO_DEFECTO = "#78350f";
const NOMBRE_BARBERIA_DEFECTO = "Tu Barbería";

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

function construirColores(primario: string, secundario: string): ColoresEmail {
  return {
    primario,
    textoPrimario: elegirColorTexto(primario),
    secundario,
    tintaSecundario: obtenerTintaLejible(secundario),
    primarioSuave: mezclarConBlanco(primario, 0.92),
  };
}

export async function sendTurnoEmail(
  to: string,
  datos: DatosEmailTurno,
  destinatario: "cliente" | "barbero" = "cliente",
) {
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
        destinatario,
      }),
    );

    const resend = new Resend(process.env.RESEND_API_KEY);
    const asunto = `${(destinatario === "barbero" ? ASUNTOS_BARBERO : ASUNTOS_CLIENTE)[datos.estado]} - ${barberiaNombre}`;

    await resend.emails.send({
      from: `${barberiaNombre} <${from}>`,
      to,
      subject: asunto,
      html,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
