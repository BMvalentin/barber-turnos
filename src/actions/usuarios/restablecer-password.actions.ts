"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";
import { crearLimitadorDeIntentos, MENSAJE_BLOQUEO } from "@/lib/seguridad/limitador-intentos";
import { obtenerIp } from "@/lib/seguridad/obtener-ip";
import { crearTokenRestablecimiento } from "@/lib/crear-token-restablecimiento";
import { restablecerPasswordConToken } from "@/lib/validar-token-restablecimiento";
import { construirUrlRestablecimiento } from "@/lib/construir-url-restablecimiento";
import { sendRestablecimientoEmail } from "@/lib/email-restablecimiento";
import { restablecerPasswordSchema } from "@/lib/zod";
import type { ActionState } from "@/types/action-state";

const COSTO_BCRYPT = 10;
const MAX_INTENTOS_RESTABLECER = 5;

const limitadorDeIntentos = crearLimitadorDeIntentos();

const esquemaUsuarioId = z.string().min(1, "Usuario inválido");

/**
 * Inicia el restablecimiento para un empleado. Solo administradores y solo
 * sobre cuentas con rol EMPLEADO (validado en el servidor, no en el cliente).
 * No devuelve ni registra el token: se envía por correo.
 */
export async function solicitarRestablecimiento(userId: string): Promise<ActionState> {
  try {
    const sesionAdmin = await requerirAdmin();
    if (!sesionAdmin) return { success: false, error: "No autorizado" };

    const parsed = esquemaUsuarioId.safeParse(userId);
    if (!parsed.success) return { success: false, error: "Usuario inválido" };

    const usuario = await prisma.user.findUnique({
      where: { id: parsed.data },
      select: { id: true, role: true, email: true, name: true },
    });
    if (!usuario || usuario.role !== "EMPLEADO") {
      return { success: false, error: "El usuario no es un empleado válido" };
    }

    const token = await crearTokenRestablecimiento(usuario.id);
    if (!token) return { success: false, error: "No se pudo iniciar el restablecimiento" };

    const enviado = await sendRestablecimientoEmail(
      usuario.email,
      usuario.name || "Empleado",
      construirUrlRestablecimiento(token),
    );

    if (!enviado.success) {
      return {
        success: true,
        aviso: "El enlace se generó, pero no pudimos enviar el correo. Revisá la configuración de Resend.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error al solicitar el restablecimiento de contraseña:", error);
    return { success: false, error: "No se pudo iniciar el restablecimiento" };
  }
}

/**
 * Confirma el cambio de contraseña a partir de un token de un solo uso.
 * Se ejecuta al enviar el formulario (POST), nunca al abrir el enlace.
 */
export async function restablecerPassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ip = await obtenerIp();
  const claveBloqueo = `restablecer:${ip}`;
  if (limitadorDeIntentos.estaBloqueado(claveBloqueo)) {
    return { success: false, error: MENSAJE_BLOQUEO };
  }

  const validated = restablecerPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { success: false, error: "Datos inválidos. Revisá los campos." };
  }

  try {
    const passwordHash = await bcrypt.hash(validated.data.password, COSTO_BCRYPT);
    const restablecido = await restablecerPasswordConToken(validated.data.token, passwordHash);

    if (!restablecido) {
      limitadorDeIntentos.registrarIntento(claveBloqueo, MAX_INTENTOS_RESTABLECER);
      return { success: false, error: "El enlace es inválido o venció. Pedí uno nuevo." };
    }

    limitadorDeIntentos.limpiarIntentos(claveBloqueo);
    return { success: true };
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    return { success: false, error: "No se pudo restablecer la contraseña. Intentá de nuevo." };
  }
}
