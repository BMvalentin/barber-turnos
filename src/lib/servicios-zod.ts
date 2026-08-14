import { z } from "zod";
import { esquemaNombre, esquemaImagenOpcional } from "@/lib/zod";

/**
 * Esquema de validación para los servicios de la barbería.
 * Maneja la conversión automática de tipos (coerción) para datos de FormData.
 */
export const servicioSchema = z.object({
  id: z.string().optional(),
  nombre: esquemaNombre("nombre"),
  descripcion: z.string().max(500, "La descripción no puede exceder los 500 caracteres").optional().nullable(),
  srcImage: esquemaImagenOpcional,
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