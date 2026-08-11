"use server";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import type { ActionState } from "@/types/action-state";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
// Limitador en memoria por instancia (primera capa; sin infraestructura nueva).
const VENTANA_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos
const MAX_INTENTOS_LOGIN = 5;
const MAX_REGISTROS_POR_IP = 5;
const MENSAJE_BLOQUEO = "Demasiados intentos. Intentá de nuevo más tarde.";
const intentos = new Map<string, { cantidad: number; bloqueadoHasta: number }>();
function estaBloqueado(clave: string): boolean {
  const registro = intentos.get(clave);
  if (!registro) return false;
  if (Date.now() < registro.bloqueadoHasta) return true;
  intentos.delete(clave);
  return false;
}
function registrarIntento(clave: string, maximo: number): void {
  const registro = intentos.get(clave) ?? { cantidad: 0, bloqueadoHasta: 0 };
  registro.cantidad += 1;
  if (registro.cantidad >= maximo) registro.cantidad = 0;
  registro.bloqueadoHasta = Date.now() + VENTANA_BLOQUEO_MS;
  intentos.set(clave, registro);
}
function limpiarIntentos(clave: string): void {
  intentos.delete(clave);
}
async function obtenerIp(): Promise<string> {
  const encabezados = await headers();
  const reenviada = encabezados.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0].trim();
  return encabezados.get("x-real-ip") ?? "desconocida";
}

export const loginAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const data = Object.fromEntries(formData);
  const validated = loginSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos" };
  const clave = `login:${validated.data.email.toLowerCase()}`;
  const ip = await obtenerIp();
  if (estaBloqueado(clave) || estaBloqueado(ip)) return { error: MENSAJE_BLOQUEO };
  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });
    for (const k of [clave, ip]) limpiarIntentos(k);
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      for (const k of [clave, ip]) registrarIntento(k, MAX_INTENTOS_LOGIN);
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

export const registerAction = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  const data = Object.fromEntries(formData);
  const validated = registerSchema.safeParse(data);
  if (!validated.success) return { error: "Datos inválidos. Revisa los campos." };
  const { email, password, name } = validated.data;
  const clave = `registro:${email.toLowerCase()}`;
  const ip = await obtenerIp();
  if (estaBloqueado(clave) || estaBloqueado(ip)) return { error: MENSAJE_BLOQUEO };
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      for (const k of [clave, ip]) registrarIntento(k, MAX_REGISTROS_POR_IP);
      return { error: "El usuario ya existe" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });
    for (const k of [clave, ip]) limpiarIntentos(k);
    return { success: true };
  } catch (error) {
    console.error("Error en el registro de usuario:", error instanceof Error ? error.message : String(error));
    return { error: "No se pudo completar el registro. Intentá de nuevo." };
  }
};

export const googleLoginAction = async () => signIn("google", { redirectTo: "/dashboard" });
