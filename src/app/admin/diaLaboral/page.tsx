import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { DiaLaboralClient } from "@/components/diaLaboral/diaLaboralClient";
import { getDiasLaborales } from "@/actions/diaLaboral.actions";
import { getPageConfig} from "@/actions/configPage";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DiaLaboralPage() {
  // 1. Obtenemos los colores configurados desde la base de datos
  const config = await getPageConfig(); 
  const primaryColor = config?.primaryColor || "#3b82f6"; // Ejemplo: color hexadecimal de la BD
  const secondaryColor = config?.secondaryColor || "#1e3a8a";

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl border-2"
              style={{ 
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}40` 
              }}
            >
              <Calendar className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Días Laborales
              </h1>
              <p className="text-white/70">
                Configura los horarios de cada día de la semana
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingSkeleton secondaryColor={secondaryColor} />}>
          <DiaLaboralContent primaryColor={primaryColor} secondaryColor={secondaryColor} />
        </Suspense>
      </div>
    </div>
  );
}

async function DiaLaboralContent({ primaryColor, secondaryColor }: { primaryColor: string; secondaryColor: string }) {
  const diasLaborales = await getDiasLaborales();

  return <DiaLaboralClient initialData={diasLaborales} primaryColor={primaryColor} secondaryColor={secondaryColor} />;
}

function LoadingSkeleton({ secondaryColor }: { secondaryColor: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i} 
          className="bg-black/40 backdrop-blur-lg rounded-xl p-6 space-y-4 animate-pulse"
          style={{ border: `1px solid ${secondaryColor}30` }}
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-2 h-12 rounded-full bg-white/10" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-32 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 bg-white/10" />
          <Skeleton className="h-10 w-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}