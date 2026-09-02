import { Suspense } from "react";
import { getDiasLaborales } from "@/actions/horarios/listar.actions";
import { obtenerBarberosParaHorarios } from "@/lib/consultas/obtener-barberos-para-horarios";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { HorariosLaboralesClient } from "@/components/horarios/HorariosLaboralesClient";

export default async function HorariosLaboralesPage() {
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
        <ContenidoHorarios />
      </Suspense>
    </div>
  );
}

async function ContenidoHorarios() {
  const [diasLaborales, barberos] = await Promise.all([
    getDiasLaborales(),
    obtenerBarberosParaHorarios(),
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
