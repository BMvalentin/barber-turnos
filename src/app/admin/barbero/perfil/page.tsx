import { redirect } from "next/navigation";
import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerDiasLaboralesActivos } from "@/lib/consultas/obtener-dias-laborales-activos";
import { obtenerBarberosConRelaciones } from "@/lib/consultas/obtener-barberos-con-relaciones";
import { obtenerPendientesPerfilBarbero } from "@/lib/consultas/obtener-pendientes-perfil-barbero";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import PerfilBarbero from "@/components/barbero/PerfilBarbero";

export default async function PerfilBarberoPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");
  if (!contexto.barberoId) redirect("/admin");

  const [servicios, diasLaborales, perfiles, pendientes] = await Promise.all([
    obtenerServiciosActivos(),
    obtenerDiasLaboralesActivos(),
    obtenerBarberosConRelaciones(contexto.barberoId),
    obtenerPendientesPerfilBarbero(contexto.barberoId, contexto.session.user.id),
  ]);
  const perfil = perfiles[0];

  if (perfil?.usuario?.id !== contexto.session.user.id) redirect("/admin");

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
    <div className="admin-pagina">
      <header className="admin-encabezado">
        <div>
          <h1>Mi perfil profesional</h1>
          <p>Consultá y actualizá tu información de barbero.</p>
        </div>
      </header>
      <PerfilBarbero
        barbero={perfilSerializado}
        servicios={servicios}
        diasLaborales={diasLaborales}
        pendientes={pendientes}
        esEmpleado={contexto.rol === "EMPLEADO"}
        perfilPropio
      />
    </div>
  );
}
