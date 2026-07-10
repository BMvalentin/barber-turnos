import nodemailer from "nodemailer";

const isSecure = Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === "true";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const defaultFrom =
  process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || `"Tu Barbería" <${process.env.SMTP_USER}>`;

export type TurnoEmailData = {
  clienteNombre: string;
  servicioNombre: string;
  barberoNombre: string;
  fechaSemana: string;
  fechaHora: string;
  estado: "CREADO" | "ACTUALIZADO" | "CANCELADO";
};

const getEmailTemplate = (data: TurnoEmailData) => {
  const { clienteNombre, servicioNombre, barberoNombre, fechaSemana, fechaHora, estado } = data;

  let title = "";
  let accentColor = "";
  let infoMessage = "";

  if (estado === "CREADO") {
    title = "Turno Confirmado";
    accentColor = "#10b981"; // Emerald green
    infoMessage = "Tu turno ha sido agendado exitosamente. ¡Te esperamos!";
  } else if (estado === "ACTUALIZADO") {
    title = "Turno Modificado";
    accentColor = "#f59e0b"; // Amber
    infoMessage = "Los detalles de tu turno han sido actualizados.";
  } else if (estado === "CANCELADO") {
    title = "Turno Cancelado";
    accentColor = "#ef4444"; // Red
    infoMessage = "Tu turno ha sido cancelado.";
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #09090b; color: #fafafa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; min-height: 100vh; background-color: #09090b; padding: 40px 20px; box-sizing: border-box; }
        .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
        .header { background-color: #27272a; padding: 30px; text-align: center; border-bottom: 2px solid ${accentColor}; }
        .header h1 { margin: 0; font-size: 24px; color: ${accentColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
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
            <h1>${title}</h1>
          </div>
          <div class="content">
            <h2>Hola, ${clienteNombre}</h2>
            <p class="message">${infoMessage}</p>
            
            <div class="details-card">
              <div class="detail-item">
                <span class="detail-label">Servicio</span>
                <span class="detail-value">${servicioNombre}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Barbero</span>
                <span class="detail-value">${barberoNombre}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Día</span>
                <span class="detail-value" style="text-transform: capitalize;">${fechaSemana}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Hora</span>
                <span class="detail-value">${fechaHora}</span>
              </div>
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
};

export async function sendTurnoEmail(to: string, data: TurnoEmailData) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Faltan variables de entorno SMTP. Saltando envío a:", to);
    return { success: false, error: "SMTP no configurado" };
  }

  try {
    let subject = "Detalles de tu turno";
    if (data.estado === "CREADO") subject = "Turno Confirmado - Tu Barbería";
    if (data.estado === "ACTUALIZADO") subject = "Turno Modificado - Tu Barbería";
    if (data.estado === "CANCELADO") subject = "Turno Cancelado - Tu Barbería";

    const info = await transporter.sendMail({
      from: defaultFrom,
      to,
      bcc: process.env.NOTIFICATION_EMAIL,
      subject,
      html: getEmailTemplate(data),
    });

    console.log("Mensaje enviado: %s", info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error("Excepción al enviar email:", error);
    return { success: false, error };
  }
}
