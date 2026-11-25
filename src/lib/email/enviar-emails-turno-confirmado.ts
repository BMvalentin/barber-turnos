import type { TurnoParaEmail } from "./tipos";
import { enviarEmailTurnoSeguro } from "./enviar-email-turno-seguro";
import { enviarEmailTurnoBarberoSeguro } from "./enviar-email-turno-barbero-seguro";

export async function enviarEmailsTurnoConfirmado(turno: TurnoParaEmail): Promise<void> {
  await Promise.all([
    enviarEmailTurnoSeguro(turno, "CONFIRMADO"),
    enviarEmailTurnoBarberoSeguro(turno, "CONFIRMADO"),
  ]);
}
