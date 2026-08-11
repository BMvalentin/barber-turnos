import { enviarEmailTurno } from "./enviar-email-turno";
import type { TurnoParaEmail } from "./tipos";

/** Envía el email de turno en modo fire-and-forget (nunca rechaza). */
export function enviarEmailTurnoSeguro(
  turno: TurnoParaEmail,
  estado: Parameters<typeof enviarEmailTurno>[1],
): void {
  enviarEmailTurno(turno, estado).catch((error) => {
    console.error("Error enviando email de turno:", error instanceof Error ? error.message : String(error));
  });
}
