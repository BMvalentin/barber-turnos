import "dotenv/config";

/**
 * Valida que las variables de entorno necesarias para OAuth estén presentes.
 * Lanza un error descriptivo si falta alguna.
 */
export function validarConfiguracionOAuthMP(): void {
  const errores: string[] = [];

  if (!process.env.MP_CLIENT_ID) {
    errores.push("MP_CLIENT_ID no está definido en el .env");
  }
  if (!process.env.MP_CLIENT_SECRET) {
    errores.push("MP_CLIENT_SECRET no está definido en el .env");
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errores.push("NEXT_PUBLIC_APP_URL no está definido en el .env");
  }

  if (errores.length > 0) {
    throw new Error(
      `Configuración incompleta para Mercado Pago OAuth:\n${errores.join("\n")}`,
    );
  }
}
