import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = loginSchema
  .extend({
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
    confirmPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

/* Aceptación obligatoria de documentos legales en el registro con credenciales.
   Los checkbox no marcados no se envían en el FormData, por lo que la
   validación falla si falta el valor. */
export const aceptacionLegalSchema = z.object({
  aceptaTerminos: z
    .preprocess(
      (valor) => valor === "on" || valor === "true" || valor === true,
      z.boolean(),
    )
    .refine((valor) => valor === true, {
      message: "Debés aceptar los Términos y la Política de Privacidad",
    }),
});

export const restablecerPasswordSchema = z
  .object({
    token: z.string().min(1, "Token inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

/* Email normalizado para solicitar la recuperación de contraseña. */
export const solicitarRecuperacionSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
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
