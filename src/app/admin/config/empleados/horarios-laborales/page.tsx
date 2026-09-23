import { Suspense } from "react";
import { getDiasLaborales } from "@/actions/horarios/listar.actions";
import { obtenerBarberosParaHorarios } from "@/lib/consultas/obtener-barberos-para-horarios";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { HorariosLaboralesClient } from "@/components/horarios/HorariosLaboralesClient";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function HorariosLaboralesPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { etiqueta: "Configuración", href: "/admin/config" },
          { etiqueta: "Empleados" },
          { etiqueta: "Horarios laborales" },
        ]}
      />
      <Suspense fallback={<CargaHorarios />}>
        <ContenidoHorarios barberoId={contexto.rol === "EMPLEADO" ? contexto.barberoId ?? undefined : undefined} />
      </Suspense>
    </div>
  );
}

async function ContenidoHorarios({ barberoId }: { barberoId?: string }) {
  const [diasLaborales, barberos] = await Promise.all([
    getDiasLaborales(),
    obtenerBarberosParaHorarios(barberoId),
  ]);

  return (
    <HorariosLaboralesClient
      diasLaborales={diasLaborales}
      barberos={barberos}
    />
  );
}

function CargaHorarios() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-56 rounded-md bg-white/5" />
        <div className="h-4 w-72 rounded-md bg-white/5" />
      </div>
      <div className="h-24 w-full rounded-xl border border-white/5 bg-white/5" />
      <div className="h-72 w-full rounded-xl border border-white/5 bg-white/5" />
    </div>
  );
}
