export type TurnoEmailData = {
  clienteNombre: string;
  servicioNombre: string;
  barberoNombre: string;
  fechaSemana: string;
  fechaHora: string;
  estado: "CREADO" | "ACTUALIZADO" | "CANCELADO";
};

const CONFIG_POR_ESTADO: Record<
  TurnoEmailData["estado"],
  { titulo: string; colorAcento: string; mensaje: string }
> = {
  CREADO: { titulo: "Turno Confirmado", colorAcento: "#10b981", mensaje: "Tu turno ha sido agendado exitosamente. ¡Te esperamos!" },
  ACTUALIZADO: { titulo: "Turno Modificado", colorAcento: "#f59e0b", mensaje: "Los detalles de tu turno han sido actualizados." },
  CANCELADO: { titulo: "Turno Cancelado", colorAcento: "#ef4444", mensaje: "Tu turno ha sido cancelado." },
};

function escaparHtml(texto: string | null | undefined): string {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function obtenerPlantillaEmail(data: TurnoEmailData) {
  const { clienteNombre, servicioNombre, barberoNombre, fechaSemana, fechaHora } = data;
  const { titulo, colorAcento, mensaje } = CONFIG_POR_ESTADO[data.estado];
  return `
    <!DOCTYPE html><html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escaparHtml(titulo)}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #09090b; color: #fafafa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; min-height: 100vh; background-color: #09090b; padding: 40px 20px; box-sizing: border-box; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
        .header { background-color: #27272a; padding: 30px; text-align: center; border-bottom: 2px solid ${colorAcento}; }
        .header h1 { margin: 0; font-size: 24px; color: ${colorAcento}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 40px 30px; }
        .content h2 { margin-top: 0; font-size: 20px; font-weight: 400; color: #fafafa; }
        .message { color: #a1a1aa; font-size: 16px; margin-bottom: 30px; line-height: 1.5; }
        .details-card { background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .detail-item { margin-bottom: 15px; }
        .detail-item:last-child { margin-bottom: 0; }
        .detail-label { font-size: 13px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
        .detail-value { font-size: 16px; color: #fafafa; font-weight: 500; }
        .footer { text-align: center; padding: 30px; border-top: 1px solid #27272a; color: #71717a; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>${escaparHtml(titulo)}</h1>
          </div>
          <div class="content">
            <h2>Hola, ${escaparHtml(clienteNombre)}</h2>
            <p class="message">${escaparHtml(mensaje)}</p>
            <div class="details-card">
              <div class="detail-item"><span class="detail-label">Servicio</span><span class="detail-value">${escaparHtml(servicioNombre)}</span></div>
              <div class="detail-item"><span class="detail-label">Barbero</span><span class="detail-value">${escaparHtml(barberoNombre)}</span></div>
              <div class="detail-item"><span class="detail-label">Día</span><span class="detail-value" style="text-transform: capitalize;">${escaparHtml(fechaSemana)}</span></div>
              <div class="detail-item"><span class="detail-label">Hora</span><span class="detail-value">${escaparHtml(fechaHora)}</span></div>
            </div>
            <p class="message" style="font-size: 14px;">Si tienes alguna duda o necesitas hacer un cambio adicional, por favor ingresa a tu perfil o contáctanos.</p>
          </div>
          <div class="footer">
            Atentamente,<br>
            <strong>Tu Barbería</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
