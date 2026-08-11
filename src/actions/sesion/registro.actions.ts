"use server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { crearLimitadorDeIntentos, MENSAJE_BLOQUEO } from "@/lib/seguridad/limitador-intentos";
import { obtenerIp } from "@/lib/seguridad/obtener-ip";
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
      return { error: "El usuario ya existe" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });
    for (const k of [clave, ip]) limitadorDeIntentos.limpiarIntentos(k);
    return { success: true };
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    return { error: "No se pudo completar el registro. Intentá de nuevo." };
  }
};
