import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerDiasLaboralesActivos } from "@/lib/consultas/obtener-dias-laborales-activos";
import { obtenerBarberosConRelaciones } from "@/lib/consultas/obtener-barberos-con-relaciones";

import BarberoList from "@/components/barbero/BarberoList";
import CreateBarberoModal from "@/components/barbero/CreateBarberoModal";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

async function getData(barberoId?: string) {
  const [servicios, diasLaborales, barberos] = await Promise.all([
    obtenerServiciosActivos(),
    obtenerDiasLaboralesActivos(),
    obtenerBarberosConRelaciones(barberoId),
  ]);

  const serializedBarberos = barberos.map(barbero => ({
    ...barbero,
    servicios: barbero.servicios.map(sb => ({
      ...sb,
      servicio: {
        ...sb.servicio,
        precio: Number(sb.servicio.precio),
        senia: sb.servicio.senia ? Number(sb.servicio.senia) : null,
        descuento: sb.servicio.descuento ? Number(sb.servicio.descuento) : null,
      }
    }))
  }));

  return {
    servicios: servicios.map((s) => ({ id: s.id, nombre: s.nombre })),
    diasLaborales,
    barberos: serializedBarberos,
  };
}

export default async function BarberosPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");
  const esEmpleado = contexto.rol === "EMPLEADO";
  const { servicios, diasLaborales, barberos } = await getData(contexto.barberoId ?? undefined);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
            Gestión de Barberos
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
            Administrá tu equipo de barberos y sus horarios.
          </p>
        </div>

        {/* BOTÓN MODAL (PASANDO CONFIG) */}
        {!esEmpleado && <CreateBarberoModal servicios={servicios} diasLaborales={diasLaborales} />}
      </div>

      {/* LISTA */}
      <BarberoList 
        barberos={barberos} 
        servicios={servicios} 
      diasLaborales={diasLaborales}
      soloEdicionPropia={esEmpleado}
    />
    </div>
  );
}
