import { createElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { prisma } from "@/lib/prisma";
import { EmailVerificacion } from "@/emails/EmailVerificacion";
import type { ColoresEmail } from "@/emails/EmailTurno";
import { elegirColorTexto } from "@/lib/contraste/elegir-color-texto";
import { mezclarConBlanco } from "@/lib/contraste/mezclar-con-blanco";
import { obtenerTintaLejible } from "@/lib/contraste/obtener-tinta-lejible";

const COLOR_PRIMARIO_DEFECTO = "#d97706";
const COLOR_SECUNDARIO_DEFECTO = "#78350f";
const NOMBRE_BARBERIA_DEFECTO = "Tu Barbería";

function construirColores(primario: string, secundario: string): ColoresEmail {
  return {
    primario,
    textoPrimario: elegirColorTexto(primario),
    secundario,
    tintaSecundario: obtenerTintaLejible(secundario),
    primarioSuave: mezclarConBlanco(primario, 0.92),
  };
}

export async function sendVerificacionEmail(
  to: string,
  nombre: string,
  urlVerificacion: string,
): Promise<{ success: boolean; error?: unknown }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY no configurada" };
  }

  try {
    const config = await prisma.pageConfig.findFirst();
    const primario = config?.primaryColor ?? COLOR_PRIMARIO_DEFECTO;
    const secundario = config?.secondaryColor ?? COLOR_SECUNDARIO_DEFECTO;
    const barberiaNombre = config?.name ?? NOMBRE_BARBERIA_DEFECTO;
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const html = await render(
      createElement(EmailVerificacion, {
        nombre,
        urlVerificacion,
        barberiaNombre,
        colores: construirColores(primario, secundario),
      }),
    );

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: `${barberiaNombre} <${from}>`,
      to,
      subject: `Activá tu cuenta - ${barberiaNombre}`,
      html,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
