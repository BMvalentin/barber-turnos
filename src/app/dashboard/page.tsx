import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { getUserTurnos } from "@/actions/sesion/listar-turnos-usuario.actions";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requerirSesion();

  if (!session) return null; // El middleware ya protege, pero TypeScript lo agradece

  const [dbUser, resultadoTurnos] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    getUserTurnos(session.user.id),
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
      />
    </>
  );
}
