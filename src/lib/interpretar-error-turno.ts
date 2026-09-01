const MENSAJE_OCUPADO = "Horario ocupado";
const MENSAJE_LOCKED =
  "Este horario está siendo seleccionado por otro usuario en este momento. Intentá con otro horario.";
const MENSAJE_CERRADO = "El negocio está cerrado ese día";
const MENSAJE_FUERA_DE_RANGO = "Horario fuera del rango laboral";

function esErrorPrismaConCodigo(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

/**
 * Convierte un error lanzado dentro de la transacción SERIALIZABLE de creación
 * de turno en el mensaje amigable que ve el cliente. Devuelve `null` para
 * errores inesperados (que se loguean en el servidor con mensaje genérico).
 */
export function interpretarErrorTurno(error: unknown): string | null {
  if (esErrorPrismaConCodigo(error) && (error.code === "P2002" || error.code === "P2034")) {
    return MENSAJE_OCUPADO;
  }
  if (error instanceof Error) {
    if (error.message === "TURNO_OCUPADO") return MENSAJE_OCUPADO;
    if (error.message === "TURNO_LOCKED") return MENSAJE_LOCKED;
    if (error.message === "CERRADO") return MENSAJE_CERRADO;
    if (error.message === "FUERA_DE_RANGO") return MENSAJE_FUERA_DE_RANGO;
    if (error.message.startsWith("EXCEPCION:")) return error.message.slice("EXCEPCION:".length);
  }
  return null;
}
