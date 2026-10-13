import { createElement } from "react";
import { render } from "@react-email/render";
import { EmailRestablecimiento } from "@/emails/EmailRestablecimiento";
import { enviarCorreo } from "@/lib/email/enviar-correo";

export async function sendRestablecimientoEmail(
  to: string,
  nombre: string,
  urlRestablecimiento: string,
): Promise<{ success: boolean; error?: string }> {
  return enviarCorreo(to, async ({ barberiaNombre, colores }) => ({
    asunto: `Restablecé tu contraseña - ${barberiaNombre}`,
    html: await render(
      createElement(EmailRestablecimiento, {
        nombre,
        urlRestablecimiento,
        barberiaNombre,
        colores,
      }),
    ),
  }));
}
