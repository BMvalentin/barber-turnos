import nodemailer from "nodemailer";
import { obtenerPlantillaEmail, type TurnoEmailData } from "@/lib/plantilla-email";

const esSeguro = Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === "true";

const transportador = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: esSeguro,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const remitentePorDefecto =
  process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || `"Tu Barbería" <${process.env.SMTP_USER}>`;

export async function sendTurnoEmail(to: string, data: TurnoEmailData) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: false, error: "SMTP no configurado" };
  }

  try {
    let subject = "Detalles de tu turno";
    if (data.estado === "CREADO") subject = "Turno Confirmado - Tu Barbería";
    if (data.estado === "ACTUALIZADO") subject = "Turno Modificado - Tu Barbería";
    if (data.estado === "CANCELADO") subject = "Turno Cancelado - Tu Barbería";

    const info = await transportador.sendMail({
      from: remitentePorDefecto,
      to,
      bcc: process.env.NOTIFICATION_EMAIL,
      subject,
      html: obtenerPlantillaEmail(data),
    });

    return { success: true, data: info };
  } catch (error) {
    return { success: false, error };
  }
}
