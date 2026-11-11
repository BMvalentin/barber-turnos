import { prisma } from "@/lib/prisma";
import { construirDatosEmailTurno, type CanceladoPor } from "./turno-datos-email";
import { resolverDestinatariosUnicos } from "./resolver-destinatarios-nueva-reserva";
import { sendTurnoEmail } from "./send-turno-email";
import type { TurnoParaEmail } from "./tipos";

function obtenerEmailCliente(turno: TurnoParaEmail): string | null {
  return turno.clienteEmail ?? (
    turno.user.esInvitado ? turno.user.emailContacto ?? null : turno.user.email
  );
}

/** Envía avisos de cancelación sin propagar errores al flujo que persistió el cambio. */
export async function enviarEmailCancelacionTurnoSeguro(
  turno: TurnoParaEmail,
  canceladoPor: CanceladoPor,
): Promise<void> {
  try {
    const turnoCancelado = { ...turno, estado: "CANCELADO" as const };
    const [resultadoConfiguracion, resultadoAdministradores] = await Promise.allSettled([
      prisma.pageConfig.findUnique({
        where: { id: 1 },
        select: { email: true },
      }),
      prisma.user.findMany({
        where: { role: "ADMIN", esInvitado: false },
        select: { email: true },
      }),
    ]);

    if (resultadoConfiguracion.status === "rejected" || resultadoAdministradores.status === "rejected") {
      console.error("No se pudieron consultar todas las direcciones administrativas para la cancelación.");
    }

    const configuracion = resultadoConfiguracion.status === "fulfilled"
      ? resultadoConfiguracion.value
      : null;
    const administradores = resultadoAdministradores.status === "fulfilled"
      ? resultadoAdministradores.value
      : [];
    const destinatariosAdministrativos = resolverDestinatariosUnicos([
      { email: configuracion?.email, tipo: "administrador" },
      ...administradores.map(({ email }) => ({ email, tipo: "administrador" as const })),
    ]);
    const destinatarios = resolverDestinatariosUnicos([
      ...destinatariosAdministrativos,
      { email: turno.barbero.email, tipo: "barbero" },
    ]);
    const correoBarberoValido = resolverDestinatariosUnicos([
      { email: turno.barbero.email, tipo: "barbero" },
    ]).length > 0;

    if (destinatariosAdministrativos.length === 0) {
      console.error("No se enviará el aviso de cancelación: falta un correo administrativo válido.");
    }
    if (!correoBarberoValido) {
      console.error("No se enviará el aviso al barbero: el perfil asignado no tiene un correo válido.");
    }

    const datos = construirDatosEmailTurno(turnoCancelado, "CANCELADO", canceladoPor);
    const correoCliente = obtenerEmailCliente(turnoCancelado);
    const envios = await Promise.allSettled([
      ...(correoCliente
        ? [sendTurnoEmail(correoCliente, datos, "cliente")]
        : []),
      ...destinatarios.map(({ email, tipo }) => sendTurnoEmail(email, datos, tipo)),
    ]);

    for (const envio of envios) {
      if (envio.status === "rejected" || !envio.value.success) {
        console.error("Falló un envío de notificación de cancelación.");
      }
    }
  } catch (error) {
    console.error(
      "No se pudieron enviar las notificaciones de cancelación:",
      error instanceof Error ? error.name : "Error desconocido",
    );
  }
}
