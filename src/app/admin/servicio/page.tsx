import ServicioCatalogoCliente from "@/components/servicio/ServicioCatalogoCliente";
import { obtenerServiciosConBarberos } from "@/lib/consultas/obtener-servicios-con-barberos";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function ServiciosPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");

  const puedeGestionar = contexto.rol === "ADMIN";
  const servicios = await obtenerServiciosConBarberos().catch(() => null);

  return (
    <div className="admin-pagina">
      <header className="admin-encabezado">
        <div>
          <h1>Servicios</h1>
          <p>
            {puedeGestionar
              ? "Organizá el catálogo, los precios y la duración de cada servicio."
              : "Consultá el catálogo, los precios y la duración de cada servicio."}
          </p>
        </div>
      </header>

      <ServicioCatalogoCliente
        key={`${contexto.session.user.id}|${contexto.rol}`}
        puedeGestionar={puedeGestionar}
        servicios={servicios}
      />
    </div>
  );
}
