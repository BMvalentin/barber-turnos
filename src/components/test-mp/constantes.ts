// src/components/test-mp/constantes.ts

import type { LogEntry } from "./tipos";

export const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:  "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  CONFIRMADO: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  CANCELADO:  "text-red-400 border-red-400/30 bg-red-400/5",
  COMPLETADO: "text-blue-400 border-blue-400/30 bg-blue-400/5",
};

export const ESTADO_DOT: Record<string, string> = {
  PENDIENTE:  "bg-yellow-400",
  CONFIRMADO: "bg-emerald-400",
  CANCELADO:  "bg-red-400",
  COMPLETADO: "bg-blue-400",
};

export const LOG_COLOR: Record<LogEntry["type"], string> = {
  info:     "text-zinc-400",
  success:  "text-emerald-400",
  error:    "text-red-400",
  warn:     "text-yellow-400",
  request:  "text-sky-400",
  response: "text-violet-400",
};

export const LOG_PREFIX: Record<LogEntry["type"], string> = {
  info:     "●",
  success:  "✓",
  error:    "✗",
  warn:     "⚠",
  request:  "→",
  response: "←",
};