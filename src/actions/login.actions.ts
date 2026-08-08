"use server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import type { ActionState } from "@/types/action-state";

export async function loginAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const validated = loginSchema.safeParse(data);

  if (!validated.success) {
    return { error: "Datos inválidos" };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.password && !user.emailVerified) {
    const esValida = await bcrypt.compare(password, user.password);
    if (esValida) {
      return { error: "Debes verificar tu email antes de ingresar" };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas" };
        default:
          return { error: "Error de autenticación" };
      }
    }
    throw error;
  }
}
