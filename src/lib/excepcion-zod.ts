import { z } from "zod";
import { esquemaNombre } from "@/lib/zod";

/* =========================
   VALIDACIÓN MOTIVO
========================= */
export const motivoSchema = esquemaNombre(
  "motivo",
  /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/,
  "El motivo solo puede contener letras"
);

/* =========================
   SCHEMA COMPLETO
========================= */
export const excepcionSchema = z.object({
  motivo: motivoSchema,
  desde: z.string().min(1, "La fecha desde es requerida"),
  hasta: z.string().min(1, "La fecha hasta es requerida"),
  estado: z.boolean().optional(),
  barberoId: z.string().optional().nullable(),
});