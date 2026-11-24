import { prisma } from "@/lib/prisma";
import { asegurarPerfilBarbero } from "@/lib/barberos/asegurar-perfil-barbero";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import type { Session } from "next-auth";
import type { RolPanel } from "@/types/usuario";
import { cache } from "react";

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

export type ContextoPanel = {
  session: Session;
  rol: RolPanel;
  barberoId: string | null;
};

/**
 * Devuelve el contexto administrativo vigente en BD. El rol del JWT solo se
 * usa para identificar la sesión; nunca se usa como autorización definitiva.
 * Comparte la consulta entre layout y página durante un mismo render.
 */
export const requerirPanel = cache(async (): Promise<ContextoPanel | null> => {
  const session = await requerirSesion();
  if (!session) return null;

  const usuario = await consultarUsuarioReal(session.user.id);
  if (usuario.rol !== "ADMIN" && usuario.rol !== "EMPLEADO") return null;

  let barberoId = usuario.barberoId;
  if (!barberoId) {
    try {
      const perfil = await prisma.$transaction(async (tx) => {
        // Comparte el bloqueo de la cuenta con el cambio de rol.
        await tx.$queryRaw`SELECT id FROM \`user\` WHERE id = ${session.user.id} FOR UPDATE`;
        const cuenta = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, role: true, email: true },
        });
        if (!cuenta || cuenta.role !== usuario.rol) return null;
        return asegurarPerfilBarbero(tx, cuenta);
      });
      invalidarCacheRol(session.user.id);
      if (!perfil) return null;
      barberoId = perfil.id;
    } catch {
      console.error("No se pudo asegurar el perfil de barbero.");
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
});

/**
 * Devuelve la sesión solo si el usuario es ADMIN en BD, o null en caso contrario.
 * No confía en el rol del JWT (puede quedar desactualizado): consulta la BD.
 */
export async function requerirAdmin(): Promise<Session | null> {
  const contexto = await requerirPanel();
  return contexto?.rol === "ADMIN" ? contexto.session : null;
}
