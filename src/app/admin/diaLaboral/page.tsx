import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { DiaLaboralClient } from "@/components/diaLaboral/diaLaboralClient";
import { getDiasLaborales } from "@/actions/diaLaboral.actions";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DiaLaboralPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl border-2"
              style={{ 
                backgroundColor: "var(--page-primary-20)",
                borderColor: "var(--page-primary-40)" 
              }}
            >
              <Calendar className="h-8 w-8" style={{ color: "var(--page-primary)" }} />
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

        <Suspense fallback={<LoadingSkeleton />}>
          <DiaLaboralContent />
        </Suspense>
      </div>
    </div>
  );
}

async function DiaLaboralContent() {
  const diasLaborales = await getDiasLaborales();

  return <DiaLaboralClient initialData={diasLaborales} />;
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(7)].map((_, i) => (
        <div 
          key={i} 
          className="bg-black/40 backdrop-blur-lg rounded-xl p-6 space-y-4 animate-pulse"
          style={{ border: "1px solid var(--page-secondary-30)" }}
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