"use server";

import { prisma } from "@/lib/prisma";
import { crearTokenRestablecimiento } from "@/lib/crear-token-restablecimiento";
import { construirUrlRestablecimiento } from "@/lib/construir-url-restablecimiento";
import { obtenerUrlApp } from "@/lib/obtener-url-app";
import { sendRestablecimientoEmail } from "@/lib/email-restablecimiento";
import { crearLimitadorDeIntentos } from "@/lib/seguridad/limitador-intentos";
import { obtenerIp } from "@/lib/seguridad/obtener-ip";
import { solicitarRecuperacionSchema } from "@/lib/zod";
import type { ActionState } from "@/types/action-state";

/* Espera mínima entre solicitudes para una misma IP o correo. */
const DURACION_ESPERA_SOLICITUD_MS = 60_000;

const limitadorDeSolicitudes = crearLimitadorDeIntentos();

/* Respuesta única: nunca revela si el correo corresponde a una cuenta. */
const RESPUESTA_GENERICA = {
  success: true,
  aviso: "Si el correo pertenece a una cuenta, vas a recibir un enlace para restablecer tu contraseña.",
} satisfies ActionState;

/**
 * Inicia el restablecimiento de contraseña por autoservicio desde `/login`.
 * Aplica a cualquier cuenta existente, incluidas las creadas exclusivamente
 * con Google: `password` es nullable y asignarlo no altera la fila `account`
 * ni el resto de relaciones, por lo que el acceso con Google sigue vigente.
 */
export async function solicitarRecuperacion(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const resultado = solicitarRecuperacionSchema.safeParse(Object.fromEntries(formData));
  const email = resultado.success ? resultado.data.email : null;
  const ip = await obtenerIp();
  const claveIp = `recuperacion:ip:${ip}`;
  const claves = email ? [claveIp, `recuperacion:${email}`] : [claveIp];

  if (claves.some((clave) => limitadorDeSolicitudes.estaBloqueado(clave))) {
    return RESPUESTA_GENERICA;
  }

  for (const clave of claves) {
    limitadorDeSolicitudes.registrarIntento(clave, 1, DURACION_ESPERA_SOLICITUD_MS);
  }

  if (!email) return RESPUESTA_GENERICA;

  try {
    const usuario = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (!usuario) return RESPUESTA_GENERICA;

    // Se resuelve antes de generar el token para no crear un token que no
    // pueda enviarse por un enlace válido.
    const urlBase = obtenerUrlApp();

    const token = await crearTokenRestablecimiento(usuario.id);
    if (!token) return RESPUESTA_GENERICA;

    await sendRestablecimientoEmail(
      usuario.email,
      usuario.name || "Cliente",
      construirUrlRestablecimiento(token, urlBase),
    );
  } catch (error) {
    // El fallo se registra en el servidor; la respuesta al cliente es la misma
    // para no filtrar la existencia de la cuenta.
    console.error("Error al solicitar la recuperación de contraseña:", error);
  }

  return RESPUESTA_GENERICA;
}
