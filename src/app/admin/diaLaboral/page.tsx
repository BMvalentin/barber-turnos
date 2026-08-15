import { Suspense } from "react";
import { DiaLaboralClient } from "@/components/diaLaboral/diaLaboralClient";
import { getDiasLaborales } from "@/actions/horarios/listar.actions";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DiaLaboralPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
          Días Laborales
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Configurá los horarios de atención de cada día.
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DiaLaboralContent />
      </Suspense>
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
          className="bg-[var(--admin-surface)] rounded-xl p-6 space-y-4 animate-pulse"
          style={{ border: "1px solid var(--admin-border)" }}
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