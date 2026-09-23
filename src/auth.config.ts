import type { NextAuthConfig } from "next-auth";
import { ROLES_USUARIO, type RolUsuario } from "@/types/usuario";

function esRolUsuario(valor: unknown): valor is RolUsuario {
  return typeof valor === "string" && ROLES_USUARIO.some((rol) => rol === valor);
}

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user){
        token.id = user.id;
        token.role = user.role;
        token.telefono = user.telefono;
        token.image = user.image;
      } 
      if (trigger === "update" && session) {
        token.name = session.name;
        token.telefono = session.telefono;
      }
      // Hidrata el teléfono desde la BD si el token quedó viejo (runtime Node únicamente; Edge salta este bloque).
      if (
        token.id &&
        token.telefono === undefined &&
        process.env.NEXT_RUNTIME !== "edge"
      ) {
        try {
          const { prisma } = await import("@/lib/prisma");
          const usuario = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { telefono: true },
          });
          // Guardar también `null` evita repetir esta consulta en cada lectura
          // del JWT cuando el usuario todavía no cargó un teléfono.
          token.telefono = usuario?.telefono ?? null;
        } catch (error) {
          console.error("No se pudo hidratar el teléfono del token:", error);
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user){
        session.user.id = token.id as string;
        session.user.role = esRolUsuario(token.role) ? token.role : "USER";
        session.user.telefono = token.telefono as string | null;
        session.user.image = token.image as string | null;
      } 

      return session;
    },
  },
} satisfies NextAuthConfig;
