import { z } from "zod";

/* =========================
   VALIDACIÓN MOTIVO
========================= */
export const motivoSchema = z
  .string()
  .min(3, "El motivo debe tener al menos 3 caracteres")
  .max(100, "El motivo es demasiado largo")
  .regex(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, {
    message: "El motivo solo puede contener letras",
  });

/* =========================
   SCHEMA COMPLETO
========================= */
export const excepcionSchema = z.object({
  motivo: motivoSchema,
  desde: z.string().min(1, "La fecha desde es requerida"),
  hasta: z.string().min(1, "La fecha hasta es requerida"),
  estado: z.boolean().optional(),
});