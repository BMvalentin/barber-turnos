"use server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { crearTokenVerificacion } from "@/lib/crear-token-verificacion";
import { construirUrlVerificacion } from "@/lib/construir-url-verificacion";
import { sendVerificacionEmail } from "@/lib/email-verificacion";
import type { ActionState } from "@/types/action-state";

export async function registerAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validated = registerSchema.safeParse(data);

  if (!validated.success) {
    const mensajes = validated.error.issues.map((issue) => issue.message);
    return { error: mensajes.join(" · ") };
  }

  const { email, password, name } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return { error: "El usuario ya existe" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: "USER" },
    });

    const token = await crearTokenVerificacion(email);
    if (token) {
      const urlVerificacion = construirUrlVerificacion(token);
      const enviado = await sendVerificacionEmail(email, name, urlVerificacion);

      if (!enviado.success) {
        return {
          success: true,
          email,
          aviso: "No pudimos enviar el email. Usá el botón de reenviar.",
        };
      }
    }

    return { success: true, email };
  } catch (error) {
    console.error("ERROR FATAL EN REGISTER:", error);
    return { error: "Error interno al crear la cuenta" };
  }
}
