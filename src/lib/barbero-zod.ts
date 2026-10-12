import { z } from "zod";
import { esquemaNombre, esquemaImagenOpcional } from "@/lib/zod";

/* =========================
   VALIDACIÓN NOMBRE
   (solo letras y espacios)
========================= */
const nombreSchema = esquemaNombre(
  "nombre",
  /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  "El nombre solo puede contener letras"
);

/* =========================
   UPDATE BARBERO
========================= */
export const updateBarberoSchema = z.object({
  id: z.string().min(1, "ID requerido"),

  nombre: nombreSchema,

  srcImage: esquemaImagenOpcional,

  estado: z.boolean().optional(),

  porcentajeGanancia: z
    .number({ message: "El porcentaje debe ser un número" })
    .min(0, "El porcentaje no puede ser negativo")
    .max(100, "El porcentaje no puede superar 100")
    .refine(
      (valor) => Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-6,
      "El porcentaje admite como máximo dos decimales"
    )
    .optional(),

  serviciosIds: z.array(z.string()).optional(),

  margenesIds: z.array(z.string()).optional(),
});
