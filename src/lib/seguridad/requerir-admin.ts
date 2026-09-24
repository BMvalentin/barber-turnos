import { prisma } from "@/lib/prisma";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import type { Session } from "next-auth";
import type { RolPanel } from "@/types/usuario";

const DURACION_CACHE_ROL_MS = 60_000;

type EntradaCacheRol = {
  rol: RolPanel | "USER" | null;
  barberoId: string | null;
  expiraEn: number;
};

// Caché en módulo en lugar de unstable_cache: requerirAdmin se ejecuta dentro de
// Server Actions (contexto principal de uso), donde unstable_cache no está disponible.
const cacheRolPorUsuario = new Map<string, EntradaCacheRol>();

/**
 * Consulta el rol REAL del usuario en BD, con caché corta (60s) por usuario.
 * Devuelve null si el usuario fue eliminado de la BD.
 */
async function consultarUsuarioReal(userId: string): Promise<{ rol: EntradaCacheRol["rol"]; barberoId: string | null }> {
  const ahora = Date.now();
  const entrada = cacheRolPorUsuario.get(userId);
  if (entrada && entrada.expiraEn > ahora) {
    return { rol: entrada.rol, barberoId: entrada.barberoId };
  }

  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, barbero: { select: { id: true } } },
  });
  const rol = usuario?.role ?? null;
  const barberoId = usuario?.barbero?.id ?? null;
  cacheRolPorUsuario.set(userId, { rol, barberoId, expiraEn: ahora + DURACION_CACHE_ROL_MS });
  return { rol, barberoId };
}

export function invalidarCacheRol(userId: string): void {
  cacheRolPorUsuario.delete(userId);
}

async function asegurarPerfilBarbero(userId: string, email: string): Promise<string> {
  const perfil = await prisma.$transaction(async (tx) => {
    const perfilExistente = await tx.barbero.findFirst({
      where: { usuarioId: null, email },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (perfilExistente) {
      return tx.barbero.update({
        where: { id: perfilExistente.id },
        data: { usuarioId: userId, email },
        select: { id: true },
      });
    }

    return tx.barbero.upsert({
      where: { usuarioId: userId },
      update: { email },
      create: {
        nombre: "Sin nombre",
        email,
        usuarioId: userId,
        estado: true,
      },
      select: { id: true },
    });
  });

  return perfil.id;
}

export type ContextoPanel = {
  session: Session;
  rol: RolPanel;
  barberoId: string | null;
};

/**
 * Devuelve el contexto administrativo vigente en BD. El rol del JWT solo se
 * usa para identificar la sesión; nunca se usa como autorización definitiva.
 */
export async function requerirPanel(): Promise<ContextoPanel | null> {
  const session = await requerirSesion();
  if (!session) return null;

  const usuario = await consultarUsuarioReal(session.user.id);
  if (usuario.rol !== "ADMIN" && usuario.rol !== "EMPLEADO") return null;

  let barberoId = usuario.barberoId;
  if (!barberoId) {
    const cuenta = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (!cuenta) return null;
    try {
      barberoId = await asegurarPerfilBarbero(session.user.id, cuenta.email);
      invalidarCacheRol(session.user.id);
    } catch (error) {
      console.error("No se pudo asegurar el perfil de barbero:", error);
      return null;
    }
  }

  return {
    session: {
      ...session,
      user: { ...session.user, role: usuario.rol },
    },
    rol: usuario.rol,
    barberoId,
  };
}

/**
 * Devuelve la sesión solo si el usuario es ADMIN en BD, o null en caso contrario.
 * No confía en el rol del JWT (puede quedar desactualizado): consulta la BD.
 */
export async function requerirAdmin(): Promise<Session | null> {
  const contexto = await requerirPanel();
  return contexto?.rol === "ADMIN" ? contexto.session : null;
}
