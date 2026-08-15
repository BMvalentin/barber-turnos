import type { TurnoParaEmail } from "./tipos";
import { enviarEmailTurnoSeguro } from "./enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "./enviar-email-turno-barbero-seguro";

export function enviarEmailsTurnoConfirmado(turno: TurnoParaEmail): void {
  enviarEmailTurnoSeguro(turno, "CONFIRMADO");
  enviarEmailTurnoBarberoSeguro(turno, "CONFIRMADO");
}
