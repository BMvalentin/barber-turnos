import { createElement } from "react";
import { render } from "@react-email/render";
import { EmailVerificacion } from "@/emails/EmailVerificacion";
import { enviarCorreo } from "@/lib/email/enviar-correo";

export async function sendVerificacionEmail(
  to: string,
  nombre: string,
  urlVerificacion: string,
): Promise<{ success: boolean; error?: unknown }> {
  return enviarCorreo(to, async ({ barberiaNombre, colores }) => ({
    asunto: `Activá tu cuenta - ${barberiaNombre}`,
    html: await render(
      createElement(EmailVerificacion, {
        nombre,
        urlVerificacion,
        barberiaNombre,
        colores,
      }),
    ),
  }));
}
