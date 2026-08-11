// src/components/test-mp/tipos.ts

import type { TurnoPruebaMp } from "@/types/turno";

/* DTO aplanado del panel de testing (derivado del turno con relaciones). */
export type Turno = TurnoPruebaMp;

export type LogEntry = {
  id: string;
  ts: string;
  type: "info" | "success" | "error" | "warn" | "request" | "response";
  label: string;
  payload?: unknown;
};