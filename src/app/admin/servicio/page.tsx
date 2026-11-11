import ServicioCatalogoCliente from "@/components/servicio/ServicioCatalogoCliente";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

export default async function ServiciosPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");

  const puedeGestionar = contexto.rol === "ADMIN";
  const alcanceCache = `${contexto.session.user.id}|${contexto.rol}`;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-[28px] text-[var(--admin-texto-primario)]">
          Gestión de Servicios
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Creá, editá y organizá los servicios de tu barbería.
        </p>
      </div>

      {/* Lista de servicios - Abajo */}
      <div>
        <ServicioCatalogoCliente
          key={alcanceCache}
          puedeGestionar={puedeGestionar}
          alcanceCache={alcanceCache}
        />
      </div>
    </div>
  );
}
