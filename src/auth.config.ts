import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user){
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.telefono = (user as any).telefono;
        token.image = (user as any).image;
      } 
      if (trigger === "update" && session) {
        token.name = session.name;
        token.telefono = session.telefono;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user){
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.telefono = token.telefono as string | null;
        session.user.image = token.image as string | null;
      } 

      return session;
    },
  },
} satisfies NextAuthConfig;