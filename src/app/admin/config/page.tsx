import { prisma } from "@/lib/prisma";
import WhatsappForm from "@/components/admin/config/ContactForm";

export default async function ConfigPage() {
  const config = await prisma.pageConfig.findUnique({
    where: { id: 1 },
  });

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Configuración de Contacto</h1>
      
      <div className="bg-black/40 border border-amber-900/30 p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">WhatsApp para Mensajes</h2>
        <WhatsappForm initialValue={config?.whatsapp || ""} />
      </div>
    </div>
  );
}