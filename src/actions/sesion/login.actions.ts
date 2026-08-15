"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { crearLimitadorDeIntentos, MENSAJE_BLOQUEO } from "@/lib/seguridad/limitador-intentos";
import { obtenerIp } from "@/lib/seguridad/obtener-ip";
import type { ActionState } from "@/types/action-state";

const MAX_INTENTOS_LOGIN = 5;

const limitadorDeIntentos = crearLimitadorDeIntentos();

export const loginAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const data = Object.fromEntries(formData);
  const validated = loginSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos" };
  const clave = `login:${validated.data.email.toLowerCase()}`;
  const ip = await obtenerIp();
  if (limitadorDeIntentos.estaBloqueado(clave) || limitadorDeIntentos.estaBloqueado(ip)) return { error: MENSAJE_BLOQUEO };

  const user = await prisma.user.findUnique({ where: { email: validated.data.email } });
  if (user?.password && !user.emailVerified) {
    const esValida = await bcrypt.compare(validated.data.password, user.password);
    if (esValida) {
      return { error: "Debes verificar tu email antes de ingresar" };
    }
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
    for (const k of [clave, ip]) limitadorDeIntentos.limpiarIntentos(k);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      for (const k of [clave, ip]) limitadorDeIntentos.registrarIntento(k, MAX_INTENTOS_LOGIN);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas" };
        default:
          return { error: "Error de autenticación" };
      }
    }
    throw error;
  }
};
