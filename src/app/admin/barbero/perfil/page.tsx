import { redirect } from "next/navigation";
import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerDiasLaboralesActivos } from "@/lib/consultas/obtener-dias-laborales-activos";
import { obtenerBarberosConRelaciones } from "@/lib/consultas/obtener-barberos-con-relaciones";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import PerfilBarbero from "@/components/barbero/PerfilBarbero";

export default async function PerfilBarberoPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");

  const [servicios, diasLaborales, perfiles] = await Promise.all([
    obtenerServiciosActivos(),
    obtenerDiasLaboralesActivos(),
    obtenerBarberosConRelaciones(contexto.barberoId ?? undefined),
  ]);
  const perfil = perfiles[0];

  if (!perfil) redirect("/admin");

  const perfilSerializado = {
    ...perfil,
    servicios: perfil.servicios.map((relacion) => ({
      ...relacion,
      servicio: {
        ...relacion.servicio,
        precio: Number(relacion.servicio.precio),
        senia: relacion.servicio.senia ? Number(relacion.servicio.senia) : null,
        descuento: relacion.servicio.descuento ? Number(relacion.servicio.descuento) : null,
      },
    })),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">
          Mi perfil profesional
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Consultá y actualizá la información de tu perfil de barbero.
        </p>
      </div>
      <PerfilBarbero
        barbero={perfilSerializado}
        servicios={servicios.map((servicio) => ({ id: servicio.id, nombre: servicio.nombre }))}
        diasLaborales={diasLaborales}
        esEmpleado={contexto.rol === "EMPLEADO"}
        perfilPropio
      />
    </div>
  );
}
