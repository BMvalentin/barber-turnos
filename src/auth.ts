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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // OAuth funciona mejor con JWT en NextAuth v5 si no quieres sesiones en DB
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
