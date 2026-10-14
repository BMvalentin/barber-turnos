import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { getUserTurnos } from "@/actions/sesion/listar-turnos-usuario.actions";
import { prisma } from "@/lib/prisma";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { obtenerDatosTransferencia } from "@/lib/pagos/obtener-datos-transferencia";
import { obtenerDestinoPostLogin } from "@/lib/seguridad/resolver-destino-post-login";
import { redirect } from "next/navigation";

type PropiedadesPaginaDashboard = {
  searchParams: Promise<{ redireccion?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: PropiedadesPaginaDashboard) {
  const [session, parametros] = await Promise.all([requerirSesion(), searchParams]);

  if (!session) return null; // El middleware ya protege, pero TypeScript lo agradece

  // Al volver de un inicio de sesión, resolver el destino con datos persistidos.
  // Si falta el teléfono, `obtenerDestinoPostLogin` devuelve null y se renderiza
  // el panel (modal de teléfono), por lo que no hay bucle de redirección.
  if (parametros.redireccion === "post-login") {
    const destino = await obtenerDestinoPostLogin(session.user.id);
    if (destino) redirect(destino);
  }

  const [dbUser, resultadoTurnos, config] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    getUserTurnos(session.user.id),
    obtenerConfigCacheada(),
  ]);
  const paginaTurnos = resultadoTurnos.data;

  return (
    <>
      <DashboardPanel
        user={dbUser || session.user}
        turnos={paginaTurnos?.turnos ?? []}
        paginaTurnosInicial={paginaTurnos?.paginaActual ?? 1}
        totalPaginasTurnos={paginaTurnos?.totalPaginas ?? 1}
        session={session}
        whatsappPhone={config?.whatsapp || ""}
        datosTransferencia={obtenerDatosTransferencia(config)}
      />
    </>
  );
}
