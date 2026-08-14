"use server";
import { prisma } from "@/lib/prisma";
import { crearTokenVerificacion } from "@/lib/crear-token-verificacion";
import { construirUrlVerificacion } from "@/lib/construir-url-verificacion";
import { sendVerificacionEmail } from "@/lib/email-verificacion";
import type { ActionState } from "@/types/action-state";

export async function reenviarVerificacion(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!email) {
    return { error: "Ingresá un email válido" };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "No encontramos una cuenta con ese email" };
  }

  if (user.emailVerified) {
    return { aviso: "Tu cuenta ya está verificada. Podés iniciar sesión." };
  }

  const token = await crearTokenVerificacion(email);
  if (!token) {
    return { error: "No pudimos generar el link de verificación" };
  }

  const urlVerificacion = construirUrlVerificacion(token);
  const enviado = await sendVerificacionEmail(
    email,
    user.name || "Cliente",
    urlVerificacion,
  );

  if (!enviado.success) {
    return { error: "No pudimos enviar el email. Intentá de nuevo." };
  }

  return { success: true, email };
}
