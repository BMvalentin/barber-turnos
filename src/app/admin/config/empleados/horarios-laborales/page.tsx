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
    <div className="admin-pagina">
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
          barberoIdInicial={contexto.barberoId ?? ""}
          esEmpleado={esEmpleado}
        />
      </Suspense>
    </div>
  );
}

async function ContenidoHorarios({
  barberoId,
  barberoIdInicial,
  esEmpleado,
}: {
  barberoId?: string;
  barberoIdInicial: string;
  esEmpleado: boolean;
}) {
  const [diasLaborales, barberos] = await Promise.all([
    getDiasLaborales(),
    obtenerBarberosParaHorarios(barberoId),
  ]);

  return (
    <HorariosLaboralesClient
      key={barberos.map(({ id }) => id).sort().join("|")}
      diasLaborales={diasLaborales}
      barberos={barberos}
      barberoIdInicial={barberoIdInicial}
      esEmpleado={esEmpleado}
    />
  );
}

function CargaHorarios() {
  return (
    <div role="status" className="space-y-5 motion-safe:animate-pulse">
      <span className="sr-only">Cargando horarios</span>
      <div className="space-y-2">
        <div className="h-6 w-56 max-w-full rounded-md bg-[var(--admin-surface-elevated)]" />
        <div className="h-4 w-72 max-w-full rounded-md bg-[var(--admin-surface-elevated)]" />
      </div>
      <div className="admin-card h-24" />
      <div className="admin-card h-72" />
    </div>
  );
}
