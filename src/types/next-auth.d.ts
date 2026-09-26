import type { DefaultSession } from "next-auth";
import type { RolUsuario } from "@/types/usuario";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RolUsuario;
      telefono?: string | null;
      image?: string | null; 
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: RolUsuario;
    telefono?: string | null;
    image?: string | null; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: RolUsuario;
  }
}
