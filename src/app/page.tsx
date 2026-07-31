import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient"; // O donde tengas tu HomeClient

export default async function Page() {
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  return <HomeClient config={config} />;
}