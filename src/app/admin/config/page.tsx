// app/admin/config/page.tsx
import { prisma } from "@/lib/prisma";
import GeneralConfigForm from "@/components/admin/config/GeneralConfigForm";

export default async function ConfigPage() {
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--page-primary)" }}
      >
        Configuración General
      </h1>
      
      <div 
        className="bg-black/40 p-6 rounded-xl transition-all"
        style={{
          border: "1px solid var(--page-secondary-40)",
        }}
      >
        <GeneralConfigForm initialData={config} />
      </div>
    </div>
  );
}