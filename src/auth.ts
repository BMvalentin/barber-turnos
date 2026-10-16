import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/zod";
import { vincularTurnosInvitadoDesdeGoogle } from "@/lib/turnos/vincular-turnos-invitado";
import { registrarConsentimientosEnTransaccion } from "@/lib/legal/registrar-consentimiento";
import { decidirIngresoGoogle } from "@/lib/legal/gate-google";
import {
  leerIntencionConsentimiento,
  limpiarIntencionConsentimiento,
} from "@/lib/legal/intencion-cookies";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // OAuth funciona mejor con JWT en NextAuth v5 si no quieres sesiones en DB
  callbacks: {
    ...authConfig.callbacks,
    /* Aceptación previa obligatoria para cuentas nuevas con Google. Este
       callback corre antes de `createUser` (ver @auth/core handle-login), por
       lo que devolver un string/false impide la creación de la cuenta. */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      // Cuenta de Google ya vinculada: usuario existente, sin consentimiento retroactivo.
      let cuentaExistente = false;
      if (account.providerAccountId) {
        const cuenta = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          select: { userId: true },
        });
        cuentaExistente = Boolean(cuenta);
      }

      const correo =
        typeof profile?.email === "string"
          ? profile.email
          : typeof user.email === "string"
            ? user.email
            : null;
      let usuarioPorCorreo = false;
      if (correo) {
        const usuario = await prisma.user.findUnique({
          where: { email: correo },
          select: { id: true },
        });
        usuarioPorCorreo = Boolean(usuario);
      }

      // Cuenta nueva: se exige una intención de consentimiento vigente y firmada.
      const intencion = await leerIntencionConsentimiento();
      const decision = decidirIngresoGoogle({
        cuentaExistente,
        usuarioPorCorreo,
        tieneIntencion: intencion !== null,
      });
      return decision.permitir ? true : decision.redirigir;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Persiste la aceptación de un usuario nuevo de Google usando la
      // intención ya validada por el callback `signIn`.
      if (account?.provider === "google" && isNewUser && user.id) {
        try {
          const intencion = await leerIntencionConsentimiento();
          if (!intencion) {
            console.error("Ingreso con Google sin intención de consentimiento verificable.");
          } else {
            await prisma.$transaction(async (tx) => {
              await registrarConsentimientosEnTransaccion(tx, {
                userId: user.id,
                metodo: "google",
                aceptadas: intencion.aceptadas,
              });
            });
            await limpiarIntencionConsentimiento();
          }
        } catch (error) {
          console.error(
            "No se pudo registrar el consentimiento de Google:",
            error instanceof Error ? error.name : "desconocido",
          );
        }
      }

      if (
        account?.provider !== "google" ||
        profile?.email_verified !== true ||
        typeof profile.email !== "string" ||
        !user.id ||
        !user.email ||
        profile.email.trim().toLowerCase() !== user.email.trim().toLowerCase()
      ) return;
      try {
        await vincularTurnosInvitadoDesdeGoogle(user.id, profile.email);
      } catch {
        // El turno puede vincularse en un siguiente ingreso; no interrumpir el acceso.
        console.error("No se pudieron vincular los turnos del cliente.");
      }
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        
        const user = await prisma.user.findUnique({ where: { email } });
        // Verificamos si tiene password (si entró con Google antes, no tendrá password)
        if (!user || !user.password) return null;

        // Esta comprobación debe vivir en el provider: la ruta estándar de
        // Auth.js no pasa por la Server Action del formulario de inicio.
        // Devolver null conserva el mismo error genérico de credenciales.
        if (!user.emailVerified) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          telefono: user.telefono,
        };
      },
    }),
  ],
});
