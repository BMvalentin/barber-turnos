import { z } from "zod";

/* =========================
   VALIDACIÓN NOMBRE
   (solo letras y espacios)
========================= */
const nombreSchema = z
  .string()
  .min(3, "El nombre debe tener al menos 3 caracteres")
  .max(100, "El nombre es demasiado largo")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: "El nombre solo puede contener letras",
  });

/* =========================
   CREATE BARBERO
========================= */
export const barberoSchema = z.object({
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, "El nombre no puede tener números ni caracteres especiales"),

  srcImage: z.string()
    .url("La URL de la imagen no es válida")
    .optional()
    .nullable()
    .or(z.literal("")),

  serviciosIds: z.array(z.string()).optional(),

  margenesIds: z.array(z.string()).optional(),

  estado: z.boolean().optional(),
});

/* =========================
   UPDATE BARBERO
========================= */
export const updateBarberoSchema = z.object({
  id: z.string().min(1, "ID requerido"),

  nombre: nombreSchema,

  srcImage: z
    .string()
    .url("La URL de la imagen no es válida")
    .optional()
    .nullable()
    .or(z.literal("")),

  estado: z.boolean().optional(),

  serviciosIds: z.array(z.string()).optional(),

  margenesIds: z.array(z.string()).optional(),
});