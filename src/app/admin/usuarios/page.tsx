import { redirect } from "next/navigation";
import { listarUsuarios } from "@/actions/usuarios/listar.actions";
import UsuarioList from "@/components/usuarios/UsuarioList";
import { requerirAdmin } from "@/lib/seguridad/requerir-admin";

export default async function UsuariosPage() {
  const sesionAdmin = await requerirAdmin();
  if (!sesionAdmin) redirect("/admin");

  const resultado = await listarUsuarios();
  const datos = resultado.success && resultado.data ? resultado.data : {
    registros: [],
    contadores: { todos: 0, usuarios: 0, empleados: 0, administradores: 0 },
    pagina: 1,
    totalPaginas: 1,
    totalResultados: 0,
  };

  return (
    <div className="admin-pagina">
      <header className="admin-encabezado">
        <div>
          <h1>Usuarios</h1>
          <p>Gestioná los datos y permisos de las cuentas de tu barbería.</p>
        </div>
      </header>
      <UsuarioList
        datosIniciales={datos}
        actorId={sesionAdmin.user.id}
        errorInicial={resultado.success ? undefined : resultado.error ?? "No se pudieron cargar las cuentas."}
      />
    </div>
  );
}
