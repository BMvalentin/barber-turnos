import { sendTurnoEmail } from "./send-turno-email";
import { construirDatosEmailTurno, type TipoEstadoEmail } from "./turno-datos-email";
import type { TurnoParaEmail } from "./tipos";

export async function enviarEmailTurno(turno: TurnoParaEmail, estado: TipoEstadoEmail) {
  const email = turno.clienteEmail ?? (
    turno.user.esInvitado ? turno.user.emailContacto : turno.user.email
  );
  if (!email) return { success: true };
  return sendTurnoEmail(email, construirDatosEmailTurno(turno, estado));
}
