import { redirect } from "next/navigation";
import { listarUsuarios } from "@/actions/usuarios/listar.actions";
import UsuarioList from "@/components/usuarios/UsuarioList";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";

export default async function UsuariosPage() {
  const sesionAdmin = await requerirAdmin();
  if (!sesionAdmin) redirect("/admin");

  const resultado = await listarUsuarios();
  const datos = resultado.success && resultado.data
    ? resultado.data
    : { usuarios: [], empleados: [], administradores: [] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">Gestión de usuarios</h1>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">Asigná roles. Los perfiles de barbero se crean automáticamente para empleados y administradores.</p>
      </div>
      <UsuarioList
        usuarios={datos.usuarios}
        empleados={datos.empleados}
        administradores={datos.administradores}
        actorId={sesionAdmin.user.id}
      />
    </div>
  );
}
