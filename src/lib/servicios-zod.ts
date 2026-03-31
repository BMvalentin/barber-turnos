import { z } from "zod";

/**
 * Esquema de validación para los servicios de la barbería.
 * Maneja la conversión automática de tipos (coerción) para datos de FormData.
 */
export const servicioSchema = z.object({
  id: z.string().optional(),
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo"),
  descripcion: z.string().max(500, "La descripción no puede exceder los 500 caracteres").optional().nullable(),
  srcImage: z.string()
    .url("La URL de la imagen no es válida")
    .optional()
    .nullable()
    .or(z.literal("")),
  duracion: z.coerce.number()
    .int("La duración debe ser un número entero (minutos)")
    .positive("La duración debe ser mayor a 0"),
  precio: z.coerce.number()
    .min(0, "El precio no puede ser negativo"),
  descuento: z.coerce.number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor al 100%"),
  senia: z.coerce.number()
    .min(0, "La seña no puede ser negativa"),
  estado: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
}).refine((data) => data.senia <= data.precio, {
  message: "El monto de la seña no puede superar el precio base del servicio",
  path: ["senia"],
});