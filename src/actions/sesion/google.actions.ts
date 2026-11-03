"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { aceptacionLegalSchema } from "@/lib/zod";
import { emitirIntencionConsentimiento } from "@/lib/legal/intencion-cookies";

/* Ingreso/registro con Google para usuarios que ya tienen cuenta. Si la cuenta
   no existe, el callback `signIn` de Auth.js exige una intención de
   consentimiento previa; sin ella, redirige a /register. */
export const googleLoginAction = async () =>
  signIn("google", { redirectTo: "/dashboard?redireccion=post-login" });

/* Registro con Google con aceptación previa: valida la casilla, emite la
   intención firmada y recién entonces inicia el flujo de OAuth. */
export const googleLoginConAceptacionAction = async (formData: FormData) => {
  const parsed = aceptacionLegalSchema.safeParse({
    aceptaTerminos: formData.get("aceptaTerminos"),
  });
  if (!parsed.success) {
    redirect("/register?consentimiento=requerido");
  }

  await emitirIntencionConsentimiento();
  await signIn("google", { redirectTo: "/dashboard?redireccion=post-login" });
};
