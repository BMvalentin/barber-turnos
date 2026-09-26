import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { elegirColorTexto } from "@/lib/contraste/elegir-color-texto";
import { mezclarConBlanco } from "@/lib/contraste/mezclar-con-blanco";
import { obtenerTintaLejible } from "@/lib/contraste/obtener-tinta-lejible";
import type { ColoresEmail } from "@/emails/EmailTurno";

const COLOR_PRIMARIO_DEFECTO = "#d97706";
const COLOR_SECUNDARIO_DEFECTO = "#78350f";
const NOMBRE_BARBERIA_DEFECTO = "Tu Barbería";
const ERROR_ENVIO = "No se pudo enviar el correo";

type ConfiguracionCorreo = {
  barberiaNombre: string;
  moneda: string;
  colores: ColoresEmail;
};

type ContenidoCorreo = {
  asunto: string;
  html: string;
};

export async function enviarCorreo(
  destinatario: string,
  crearContenido: (configuracion: ConfiguracionCorreo) => Promise<ContenidoCorreo>,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY no configurada" };

  try {
    const config = await prisma.pageConfig.findFirst();
    const primario = config?.primaryColor ?? COLOR_PRIMARIO_DEFECTO;
    const secundario = config?.secondaryColor ?? COLOR_SECUNDARIO_DEFECTO;
    const barberiaNombre = config?.name ?? NOMBRE_BARBERIA_DEFECTO;
    const contenido = await crearContenido({
      barberiaNombre,
      moneda: config?.currency ?? "ARS",
      colores: {
        primario,
        textoPrimario: elegirColorTexto(primario),
        secundario,
        tintaSecundario: obtenerTintaLejible(secundario),
        primarioSuave: mezclarConBlanco(primario, 0.92),
      },
    });

    const resend = new Resend(apiKey);
    const respuesta = await resend.emails.send({
      from: `${barberiaNombre} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: destinatario,
      subject: contenido.asunto,
      html: contenido.html,
    });

    if (respuesta.error) return { success: false, error: ERROR_ENVIO };
    return { success: true };
  } catch {
    return { success: false, error: ERROR_ENVIO };
  }
}
