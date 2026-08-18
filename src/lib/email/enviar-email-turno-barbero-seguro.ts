import { enviarEmailTurnoBarbero } from "./enviar-email-turno-barbero";
import type { TurnoParaEmail } from "./tipos";

/** Envía el email al barbero en modo fire-and-forget (nunca rechaza). */
export function enviarEmailTurnoBarberoSeguro(
  turno: TurnoParaEmail,
  estado: "CREADO" | "CONFIRMADO",
): void {
  if (!turno.barbero?.email) {
    return;
  }

  enviarEmailTurnoBarbero(turno, estado).catch((error) => {
    console.error("Error enviando email al barbero:", error instanceof Error ? error.message : String(error));
  });
}
