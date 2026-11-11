import { prisma } from "@/lib/prisma";
import { construirDatosEmailTurno } from "./turno-datos-email";
import { resolverDestinatariosUnicos } from "./resolver-destinatarios-nueva-reserva";
import { sendTurnoEmail } from "./send-turno-email";
import type { TurnoParaEmail } from "./tipos";

export async function enviarEmailNuevaReservaSeguro(turno: TurnoParaEmail): Promise<void> {
  try {
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
    const configuracion = resultadoConfiguracion.status === "fulfilled"
      ? resultadoConfiguracion.value
      : null;
    const administradores = resultadoAdministradores.status === "fulfilled"
      ? resultadoAdministradores.value
      : [];

    if (resultadoConfiguracion.status === "rejected" || resultadoAdministradores.status === "rejected") {
      console.error("No se pudieron consultar todas las direcciones administrativas para la nueva reserva.");
    }

    const candidatosAdmin = [
      { email: configuracion?.email, tipo: "administrador" as const },
      ...administradores.map((administrador) => ({
        email: administrador.email,
        tipo: "administrador" as const,
      })),
    ];
    const candidatoBarbero = { email: turno.barbero?.email, tipo: "barbero" as const };
    const existeDestinatarioAdmin = resolverDestinatariosUnicos(candidatosAdmin).length > 0;
    const emailBarberoValido = resolverDestinatariosUnicos([candidatoBarbero]).length > 0;
    const destinatarios = resolverDestinatariosUnicos([...candidatosAdmin, candidatoBarbero]);

    if (!existeDestinatarioAdmin) {
      console.error("No se enviará el aviso de nueva reserva: falta un correo administrativo válido.");
    }
    if (!emailBarberoValido) {
      console.error("No se enviará el aviso al barbero: falta un correo válido en el perfil asignado.");
    }

    const datos = construirDatosEmailTurno(turno, "NUEVA_RESERVA");
    const envios = await Promise.allSettled(destinatarios.map(async (destinatario) => {
      const resultado = await sendTurnoEmail(destinatario.email, datos, destinatario.tipo);
      if (!resultado.success) {
        console.error(`No se pudo enviar el aviso de nueva reserva al rol ${destinatario.tipo}.`);
      }
    }));

    for (const envio of envios) {
      if (envio.status === "rejected") {
        console.error("Falló un envío del aviso de nueva reserva.");
      }
    }
  } catch (error) {
    console.error(
      "No se pudieron resolver los destinatarios del aviso de nueva reserva:",
      error instanceof Error ? error.name : "Error desconocido",
    );
  }
}
