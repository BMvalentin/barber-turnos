import { prisma } from "@/lib/prisma";
import FormConfiguracionMP  from "./FormConfiguracionMP";
import { ShieldCheck } from "lucide-react";

export default async function ConfiguracionPage() {
  const config = await prisma.configuracion.findUnique({
    where: { id: "global" },
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 mt-10">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="text-amber-500 h-6 w-6" />
          Configuración de Pagos
        </h1>
        <p className="text-xs text-amber-200/60 mt-1">
          Vinculá la cuenta de Mercado Pago del negocio para automatizar el cobro de señas.
        </p>
      </div>

      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 shadow-xl">
        <FormConfiguracionMP configInicial={config} />
      </div>
    </div>
  );
}