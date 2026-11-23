import { obtenerServiciosActivos } from "@/lib/consultas/obtener-servicios-activos";
import { obtenerDiasLaboralesActivos } from "@/lib/consultas/obtener-dias-laborales-activos";
import { obtenerBarberosConRelaciones } from "@/lib/consultas/obtener-barberos-con-relaciones";

import BarberoList from "@/components/barbero/BarberoList";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

async function getData(barberoId?: string, soloEmpleados = false) {
  const [servicios, diasLaborales, barberos] = await Promise.all([
    obtenerServiciosActivos(),
    obtenerDiasLaboralesActivos(),
    obtenerBarberosConRelaciones(barberoId, soloEmpleados),
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
  const { servicios, diasLaborales, barberos } = await getData(
    esEmpleado ? contexto.barberoId ?? undefined : undefined,
    !esEmpleado,
  );

  return (
    <div className="admin-pagina">
      <header className="admin-encabezado">
        <div>
          <h1>
            {esEmpleado ? "Mi perfil profesional" : "Empleados"}
          </h1>
          <p>
            {esEmpleado
              ? "Consultá y actualizá la información de tu perfil."
              : "Administrá los perfiles de tus empleados y sus horarios."}
          </p>
        </div>
      </header>

      <BarberoList
        barberos={barberos}
        servicios={servicios}
        diasLaborales={diasLaborales}
        soloEdicionPropia={esEmpleado}
      />
    </div>
  );
}
