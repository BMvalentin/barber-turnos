import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google"; // <--- Importar Google
import { loginSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any, 
  session: { strategy: "jwt" }, // OAuth funciona mejor con JWT en NextAuth v5 si no quieres sesiones en DB
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Esto permite que si alguien se registró con email, pueda luego entrar con Google si es el mismo correo
      allowDangerousEmailAccountLinking: true, 
    }),
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = await loginSchema.parseAsync(credentials);
        
        const user = await prisma.user.findUnique({ where: { email } });
        // Verificamos si tiene password (si entró con Google antes, no tendrá password)
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      },
    }),
  ],
});