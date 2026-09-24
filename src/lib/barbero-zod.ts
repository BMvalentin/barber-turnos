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

  serviciosIds: z.array(z.string()).optional(),

  margenesIds: z.array(z.string()).optional(),
});
