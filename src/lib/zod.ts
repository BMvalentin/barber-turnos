import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z
    .string()
    .min(2, "Nombre requerido")
    .max(100, "El nombre es demasiado largo")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .\-']+$/,
      "Nombre inválido: solo letras, números, espacios, puntos, guiones y apóstrofes"
    ),
});

/* Esquema base de nombre (mín. 3, máx. 100) con regex opcional */
export function esquemaNombre(
  etiqueta: string,
  regex?: RegExp,
  mensajeRegex?: string
) {
  const texto = z
    .string()
    .min(3, `El ${etiqueta} debe tener al menos 3 caracteres`)
    .max(100, `El ${etiqueta} es demasiado largo`);
  return regex ? texto.regex(regex, mensajeRegex) : texto;
}

/* URL de imagen opcional (vacía o nula permitida) */
export const esquemaImagenOpcional = z
  .string()
  .url("La URL de la imagen no es válida")
  .optional()
  .nullable()
  .or(z.literal(""));