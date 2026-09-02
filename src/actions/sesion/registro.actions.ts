"use server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { crearLimitadorDeIntentos, MENSAJE_BLOQUEO } from "@/lib/seguridad/limitador-intentos";
import { obtenerIp } from "@/lib/seguridad/obtener-ip";
import { crearTokenVerificacion } from "@/lib/crear-token-verificacion";
import { construirUrlVerificacion } from "@/lib/construir-url-verificacion";
import { sendVerificacionEmail } from "@/lib/email-verificacion";
import type { ActionState } from "@/types/action-state";

const MAX_REGISTROS_POR_IP = 5;

const limitadorDeIntentos = crearLimitadorDeIntentos();

export const registerAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const data = Object.fromEntries(formData);
  const validated = registerSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos. Revisa los campos." };
  const { email, password, name } = validated.data;
  const clave = `registro:${email.toLowerCase()}`;
  const ip = await obtenerIp();
  if (limitadorDeIntentos.estaBloqueado(clave) || limitadorDeIntentos.estaBloqueado(ip)) return { error: MENSAJE_BLOQUEO };
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      for (const k of [clave, ip]) limitadorDeIntentos.registrarIntento(k, MAX_REGISTROS_POR_IP);
      // No revelar si una dirección ya tiene una cuenta.
      return { success: true, email };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });
    const token = await crearTokenVerificacion(email);
    let aviso: string | undefined;
    if (token) {
      const enviado = await sendVerificacionEmail(email, name, construirUrlVerificacion(token));
      if (!enviado.success) {
        aviso = "No pudimos enviar el email. Usá el botón de reenviar.";
      }
    }
    for (const k of [clave, ip]) limitadorDeIntentos.limpiarIntentos(k);
    return { success: true, email, aviso };
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    return { error: "No se pudo completar el registro. Intentá de nuevo." };
  }
};
