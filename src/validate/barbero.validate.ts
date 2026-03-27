import { z } from "zod";

export const BarberoV = z.object({
  nombre: z
    .string()
    .min(2, "El nombre es obligatorio")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras y espacios")
    .max(50, "Máximo 50 caracteres"),

  srcImage: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),

  serviciosIds: z.array(z.string()).min(1, "Seleccioná al menos un servicio"),

  margenesIds: z.array(z.string()).optional(),
});

export const UpdateBarberoV = z.object({
  id: z.string().min(1, "ID requerido"),
  nombre: z.string().min(2, "El nombre es obligatorio").optional(),
  srcImage: z.string().url().optional().or(z.literal("")),
});