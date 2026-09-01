import { enviarEmailTurnoBarbero } from "./enviar-email-turno-barbero";
import type { TurnoParaEmail } from "./tipos";

function textoError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Envía el email al barbero en modo fire-and-forget (nunca rechaza) y loguea el fallo. */
export async function enviarEmailTurnoBarberoSeguro(
  turno: TurnoParaEmail,
  estado: "CREADO" | "CONFIRMADO",
): Promise<void> {
  if (!turno.barbero?.email) {
    console.error("No se envió email al barbero: el barbero no tiene email configurado.");
    return;
  }

  try {
    const resultado = await enviarEmailTurnoBarbero(turno, estado);
    if (!resultado.success) {
      console.error("Error enviando email al barbero:", textoError(resultado.error));
    }
  } catch (error) {
    console.error("Error enviando email al barbero:", textoError(error));
  }
}
