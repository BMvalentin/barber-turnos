import nodemailer from "nodemailer";
import { toZonedTime } from "date-fns-tz";
import { obtenerPlantillaEmail, type TurnoEmailData } from "@/lib/plantilla-email";

const isSecure = Number(process.env.SMTP_PORT) === 465 || process.env.SMTP_SECURE === "true";

const TIMEZONE = "America/Argentina/Buenos_Aires";

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

export type TurnoParaEmail = {
  horarioReservado: Date;
  user: { email: string; name: string | null };
  servicio: { nombre: string };
  barbero: { nombre: string };
};

export async function enviarEmailTurno(turno: TurnoParaEmail, estado: TurnoEmailData["estado"]) {
  const zoned = toZonedTime(turno.horarioReservado, TIMEZONE);
  const fechaSemana = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(zoned);
  const fechaHora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(zoned);

  return sendTurnoEmail(turno.user.email, {
    clienteNombre: turno.user.name || "Cliente",
    servicioNombre: turno.servicio.nombre,
    barberoNombre: turno.barbero.nombre,
    fechaSemana,
    fechaHora,
    estado,
  });
}

export async function sendTurnoEmail(to: string, data: TurnoEmailData) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
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
      html: obtenerPlantillaEmail(data),
    });

    return { success: true, data: info };
  } catch (error) {
    return { success: false, error };
  }
}