"use server";
import { prisma } from "@/lib/prisma";
import { crearTokenVerificacion } from "@/lib/crear-token-verificacion";
import { construirUrlVerificacion } from "@/lib/construir-url-verificacion";
import { sendVerificacionEmail } from "@/lib/email-verificacion";
import { crearLimitadorDeIntentos } from "@/lib/seguridad/limitador-intentos";
import { obtenerIp } from "@/lib/seguridad/obtener-ip";
import type { ActionState } from "@/types/action-state";
import { z } from "zod";

const esquemaEmail = z.string().trim().toLowerCase().email();
const DURACION_ESPERA_REENVIO_MS = 60_000;
const limitadorDeReenvios = crearLimitadorDeIntentos();
const RESPUESTA_REENVIO = {
  success: true,
  aviso: "Si la cuenta existe y todavía necesita verificación, recibirás un email en breve.",
} satisfies ActionState;

export async function reenviarVerificacion(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const emailCrudo = formData.get("email")?.toString() ?? "";
  const resultadoEmail = esquemaEmail.safeParse(emailCrudo);
  const email = resultadoEmail.success ? resultadoEmail.data : null;
  const ip = await obtenerIp();
  const claves = email ? [ip, `reenvio:${email}`] : [ip];

  if (claves.some((clave) => limitadorDeReenvios.estaBloqueado(clave))) {
    return RESPUESTA_REENVIO;
  }

  for (const clave of claves) {
    limitadorDeReenvios.registrarIntento(clave, 1, DURACION_ESPERA_REENVIO_MS);
  }

  if (!email) return RESPUESTA_REENVIO;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return RESPUESTA_REENVIO;

    const token = await crearTokenVerificacion(email);
    if (!token) return RESPUESTA_REENVIO;

    await sendVerificacionEmail(
      email,
      user.name || "Cliente",
      construirUrlVerificacion(token),
    );
  } catch (error) {
    console.error("Error al reenviar la verificación:", error);
  }

  return RESPUESTA_REENVIO;
}
