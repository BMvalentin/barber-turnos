import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { getUserTurnos } from "@/actions/sesion/listar-turnos-usuario.actions";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await requerirSesion();

  if (!session) return null; // El middleware ya protege, pero TypeScript lo agradece

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const turnos = await getUserTurnos(session.user.id as string);

  return (
    <>
      <DashboardPanel user={dbUser || session.user} turnos={turnos} session={session} />
    </>
  );
}