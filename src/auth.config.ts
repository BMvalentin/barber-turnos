import type { NextAuthConfig } from "next-auth";
import { obtenerAmbitoBaseDatos } from "@/lib/conexion-base-datos";
import { ROLES_USUARIO, type RolUsuario } from "@/types/usuario";

function esRolUsuario(valor: unknown): valor is RolUsuario {
  return typeof valor === "string" && ROLES_USUARIO.some((rol) => rol === valor);
}

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger }) {
      const ambito = await obtenerAmbitoBaseDatos();
      if (!ambito) return null;

      if (user) {
        token.ambitoBaseDatos = ambito;
        token.id = user.id;
        token.role = user.role;
        token.telefono = user.telefono;
        token.image = user.image;
      }
      if (token.ambitoBaseDatos !== ambito) return null;

      // El payload de useSession().update() viene del cliente: se recargan los
      // datos del perfil desde la BD en lugar de incorporarlos al JWT.
      if (
        typeof token.id === "string" &&
        (trigger === "update" || token.telefono === undefined) &&
        process.env.NEXT_RUNTIME !== "edge"
      ) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const usuario = await prisma.user.findUnique({
            where: { id: token.id },
            select: { name: true, telefono: true },
          });
          if (trigger === "update") token.name = usuario?.name ?? null;
          token.telefono = usuario?.telefono ?? null;
        } catch (error) {
          console.error("No se pudo hidratar el teléfono del token:", error);
        }
      }
      return token;
    },
    session({ session, token }) {
      // Los renders de servidor no renuevan la cookie aunque Auth.js calcule otro `expires`.
      if (typeof token.exp === "number") session.venceEn = token.exp * 1000;

      if (session.user){
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = esRolUsuario(token.role) ? token.role : "USER";
        session.user.telefono = typeof token.telefono === "string" ? token.telefono : null;
        session.user.image = typeof token.image === "string" ? token.image : null;
      } 

      return session;
    },
  },
} satisfies NextAuthConfig;
