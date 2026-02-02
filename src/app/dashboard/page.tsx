import { auth } from "@/auth";
import DashboardPanel from "@/components/dashboard/DashboardPanel";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) return null; // El middleware ya protege, pero TypeScript lo agradece

  return (
  <>
    {session?.user && <DashboardPanel user={session.user} />}
  </>
  );
}