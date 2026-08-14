import { sendTurnoEmail } from "./send-turno-email";
import { construirDatosEmailTurno, type TipoEstadoEmail } from "./turno-datos-email";
import type { TurnoParaEmail } from "./tipos";

export async function enviarEmailTurno(turno: TurnoParaEmail, estado: TipoEstadoEmail) {
  return sendTurnoEmail(turno.user.email, construirDatosEmailTurno(turno, estado));
}
