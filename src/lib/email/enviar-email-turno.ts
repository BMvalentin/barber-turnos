import { toZonedTime } from "date-fns-tz";
import type { TurnoEmailData } from "@/lib/plantilla-email";
import { ZONA_HORARIA } from "@/lib/constants";
import { sendTurnoEmail } from "./send-turno-email";
import type { TurnoParaEmail } from "./tipos";

export async function enviarEmailTurno(turno: TurnoParaEmail, estado: TurnoEmailData["estado"]) {
  const zoned = toZonedTime(turno.horarioReservado, ZONA_HORARIA);
  const fechaSemana = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(zoned);
  const fechaHora = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(zoned);

  return sendTurnoEmail(turno.user.email, {
    clienteNombre: turno.user.name || "Cliente",
    servicioNombre: turno.servicio.nombre,
    barberoNombre: turno.barbero.nombre,
    fechaSemana,
    fechaHora,
    estado,
  });
}
