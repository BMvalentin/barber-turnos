import { enviarEmailTurno } from "./enviar-email-turno";
import type { TurnoParaEmail } from "./tipos";

function textoError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Envía el email de turno en modo fire-and-forget (nunca rechaza) y loguea el fallo. */
export async function enviarEmailTurnoSeguro(
  turno: TurnoParaEmail,
  estado: Parameters<typeof enviarEmailTurno>[1],
): Promise<void> {
  try {
    const resultado = await enviarEmailTurno(turno, estado);
    if (!resultado.success) {
      console.error("Error enviando email de turno:", textoError(resultado.error));
    }
  } catch (error) {
    console.error("Error enviando email de turno:", textoError(error));
  }
}
