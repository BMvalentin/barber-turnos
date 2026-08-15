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
   CREATE BARBERO
========================= */
export const barberoSchema = z.object({
  nombre: esquemaNombre(
    "nombre",
    /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/,
    "El nombre no puede tener números ni caracteres especiales"
  ),

  srcImage: esquemaImagenOpcional,

  email: z.string().trim().email("El email no es válido").nullable().optional(),

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

  srcImage: esquemaImagenOpcional,

  email: z.string().trim().email("El email no es válido").nullable().optional(),

  estado: z.boolean().optional(),

  serviciosIds: z.array(z.string()).optional(),

  margenesIds: z.array(z.string()).optional(),
});