import type { NextAuthConfig } from "next-auth";
import { ROLES_USUARIO, type RolUsuario } from "@/types/usuario";

function esRolUsuario(valor: unknown): valor is RolUsuario {
  return typeof valor === "string" && ROLES_USUARIO.some((rol) => rol === valor);
}

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user){
        token.id = user.id;
        token.role = user.role;
        token.telefono = user.telefono;
        token.image = user.image;
      } 
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
