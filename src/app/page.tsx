import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/inicio/HomeClient";

export default async function Page() {
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  return <HomeClient config={config} />;
}