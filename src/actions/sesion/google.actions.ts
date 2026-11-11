"use server";

import { signIn } from "@/auth";

/* Inicia el flujo de Google. El callback valida la aceptación legal firmada
   que se solicita al visitante en su primera visita. */
export const googleLoginAction = async () =>
  signIn("google", { redirectTo: "/dashboard?redireccion=post-login" });
