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
  const esEmpleado = contexto.rol === "EMPLEADO";
  const barberoId = esEmpleado ? contexto.barberoId ?? undefined : undefined;
  if (esEmpleado && !barberoId) redirect("/admin/barbero/perfil");

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={esEmpleado
          ? [
              { etiqueta: "Mi resumen", href: "/admin" },
              { etiqueta: "Mis horarios" },
            ]
          : [
              { etiqueta: "Configuración", href: "/admin/config" },
              { etiqueta: "Empleados" },
              { etiqueta: "Horarios laborales" },
            ]}
      />
      <Suspense fallback={<CargaHorarios />}>
        <ContenidoHorarios
          barberoId={barberoId}
          esEmpleado={esEmpleado}
        />
      </Suspense>
    </div>
  );
}

async function ContenidoHorarios({
  barberoId,
  esEmpleado,
}: {
  barberoId?: string;
  esEmpleado: boolean;
}) {
  const [diasLaborales, barberos] = await Promise.all([
    getDiasLaborales(),
    obtenerBarberosParaHorarios(barberoId, !esEmpleado),
  ]);

  return (
    <HorariosLaboralesClient
      diasLaborales={diasLaborales}
      barberos={barberos}
      esEmpleado={esEmpleado}
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
