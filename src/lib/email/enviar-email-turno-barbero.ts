import type { TurnoParaEmail } from "./tipos";
import { construirDatosEmailTurno } from "./turno-datos-email";
import { sendTurnoEmail } from "./send-turno-email";

export async function enviarEmailTurnoBarbero(
  turno: TurnoParaEmail,
  estado: "CREADO" | "CONFIRMADO",
) {
  if (!turno.barbero?.email) {
    return { success: false, error: "El barbero no tiene email configurado" };
  }

  return sendTurnoEmail(
    turno.barbero.email,
    construirDatosEmailTurno(turno, estado),
    "barbero",
  );
}
