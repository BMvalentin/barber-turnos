// app/admin/config/page.tsx
import { prisma } from "@/lib/prisma";
import GeneralConfigForm from "@/components/admin/config/GeneralConfigForm";

export default async function ConfigPage() {
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  const primaryColor = config?.primaryColor ?? "#3b82f6";
  const secondaryColor = config?.secondaryColor ?? "#1e3a8a";

  return (
    <div className="container mx-auto p-6 max-w-3xl mt-12 mb-12">
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: primaryColor }}
      >
        Configuración General
      </h1>
      
      <div 
        className="bg-black/40 p-6 rounded-xl transition-all"
        style={{
          border: `1px solid ${secondaryColor}40`,
        }}
      >
        <GeneralConfigForm initialData={config} />
      </div>
    </div>
  );
}