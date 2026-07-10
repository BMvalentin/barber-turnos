import { Suspense } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { DiaLaboralClient } from "@/components/diaLaboral/diaLaboralClient";
import { getDiasLaborales } from "@/actions/diaLaboral.actions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { auth } from "@/auth";

export default async function DiaLaboralPage() {
  const session = await auth();

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl mt-20">
        {/* Header con flecha de regreso */}
        <div className="mb-8 flex items-center gap-4">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="p-2 hover:bg-amber-600/20 rounded-lg transition-all group"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="h-6 w-6 text-amber-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
            </Link>
          )}

          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl border-2 border-amber-500/30">
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Días Laborales
              </h1>
              <p className="text-amber-200/70">
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
        <div key={i} className="border border-amber-900/30 bg-black/40 backdrop-blur-lg rounded-xl p-6 space-y-4 animate-pulse">
          <div className="flex items-start gap-3">
            <Skeleton className="w-2 h-12 rounded-full bg-amber-950/20" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-32 bg-amber-950/20" />
              <Skeleton className="h-3 w-24 bg-amber-950/20" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 bg-amber-950/20" />
          <Skeleton className="h-10 w-full bg-amber-950/20" />
        </div>
      ))}
    </div>
  );
}