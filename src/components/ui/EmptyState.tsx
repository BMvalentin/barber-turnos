"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  icono?: ReactNode;
  titulo?: ReactNode;
  mensaje?: ReactNode;
  accion?: ReactNode;
  horizontal?: boolean;
  claseContenedor?: string;
  estiloContenedor?: CSSProperties;
  claseIcono?: string;
  estiloIcono?: CSSProperties;
  claseTitulo?: string;
  claseMensaje?: string;
  estiloMensaje?: CSSProperties;
};

export default function EmptyState({
  icono,
  titulo,
  mensaje,
  accion,
  horizontal = false,
  claseContenedor,
  estiloContenedor,
  claseIcono,
  estiloIcono,
  claseTitulo = "text-lg font-semibold text-[var(--admin-texto-primario)]",
  claseMensaje = "text-sm text-[var(--admin-texto-secundario)]",
  estiloMensaje,
}: EmptyStateProps) {
  const estiloIconoFinal: CSSProperties = estiloIcono ?? {
    color: "var(--admin-texto-muted)",
  };

  if (horizontal) {
    return (
      <div className={cn("flex items-center gap-2", claseContenedor)} style={estiloContenedor}>
        {icono && (
          <span className={claseIcono} style={estiloIconoFinal}>
            {icono}
          </span>
        )}
        {mensaje && (
          <p className={claseMensaje} style={estiloMensaje}>
            {mensaje}
          </p>
        )}
        {accion}
      </div>
    );
  }

  return (
    <div className={cn("text-center", claseContenedor)} style={estiloContenedor}>
      {icono && (
        <div className={cn("mx-auto mb-4", claseIcono)} style={estiloIconoFinal}>
          {icono}
        </div>
      )}
      {titulo && <h3 className={claseTitulo}>{titulo}</h3>}
      {mensaje && (
        <p className={claseMensaje} style={estiloMensaje}>
          {mensaje}
        </p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
