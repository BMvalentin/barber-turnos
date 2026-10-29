"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Save, KeyRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { actualizarRolUsuario } from "@/actions/usuarios/rol.actions";
import { solicitarRestablecimiento } from "@/actions/usuarios/restablecer-password.actions";
import { eliminarUsuario } from "@/actions/usuarios/eliminar.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import EditarUsuarioModal from "./EditarUsuarioModal";
import { ETIQUETAS_ROL, ROLES_USUARIO, type RolUsuario } from "@/types/usuario";
import type { UsuarioAdministrable } from "@/actions/usuarios/listar.actions";

type Props = {
  usuarios: UsuarioAdministrable[];
  empleados: UsuarioAdministrable[];
  administradores: UsuarioAdministrable[];
  actorId: string;
};

type ListaActiva = "todos" | "usuarios" | "empleados" | "administradores";

function rolDesdeValor(valor: string): RolUsuario {
  return ROLES_USUARIO.find((rol) => rol === valor) ?? "USER";
}

export default function UsuarioList({ usuarios, empleados, administradores, actorId }: Props) {
  const [listaActiva, setListaActiva] = useState<ListaActiva>("todos");
  const [busqueda, setBusqueda] = useState("");
  const listas: Record<ListaActiva, { etiqueta: string; registros: UsuarioAdministrable[] }> = {
    todos: { etiqueta: "Todos", registros: [...administradores, ...empleados, ...usuarios] },
    usuarios: { etiqueta: "Usuarios", registros: usuarios },
    empleados: { etiqueta: "Empleados", registros: empleados },
    administradores: { etiqueta: "Administradores", registros: administradores },
  };
  const registrosActivos = listas[listaActiva].registros;
  const termino = busqueda.trim().toLocaleLowerCase();
  const usuariosFiltrados = useMemo(
    () => registrosActivos.filter((usuario) => !termino
      || usuario.email.toLocaleLowerCase().includes(termino)
      || usuario.name?.toLocaleLowerCase().includes(termino)
      || usuario.telefono?.toLocaleLowerCase().includes(termino)),
    [termino, registrosActivos],
  );

  return (
    <section className="space-y-5">
      <div className="grid gap-2 rounded-xl border bg-[var(--admin-surface)] p-2 grid-cols-2 sm:grid-cols-4" style={{ borderColor: "var(--admin-border)" }} role="tablist" aria-label="Listas de cuentas">
        {(Object.entries(listas) as [ListaActiva, (typeof listas)[ListaActiva]][]).map(([clave, lista]) => (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={listaActiva === clave}
            onClick={() => setListaActiva(clave)}
            className="rounded-lg px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
            style={listaActiva === clave
              ? { backgroundColor: "var(--page-primary-15)", color: "var(--admin-texto-primario)" }
              : { color: "var(--admin-texto-muted)" }}
          >
            <span className="block font-semibold">{lista.etiqueta}</span>
            <span className="mt-1 block text-xs text-[var(--admin-texto-muted)]">{lista.registros.length} cuenta{lista.registros.length === 1 ? "" : "s"}</span>
          </button>
        ))}
      </div>

      <label className="relative block w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por correo, nombre o celular..."
          aria-label="Buscar usuario por correo, nombre o celular"
          className="h-10 w-full rounded-lg border bg-[var(--admin-surface)] pl-9 pr-3 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          style={{ borderColor: "var(--admin-border)" }}
        />
      </label>

      <div className="overflow-x-auto rounded-xl border bg-[var(--admin-surface)]" style={{ borderColor: "var(--admin-border)" }}>
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b bg-[var(--admin-surface-elevated)] text-xs uppercase tracking-wide text-[var(--admin-texto-muted)]" style={{ borderColor: "var(--admin-border)" }}>
            <tr>
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Celular</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Perfil de barbero</th>
              <th className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {usuariosFiltrados.map((usuario) => (
              <UsuarioFila key={usuario.id} usuario={usuario} esActual={usuario.id === actorId} puedeRestablecer={usuario.role === "EMPLEADO"} />
            ))}
          </tbody>
        </table>
        {usuariosFiltrados.length === 0 && <p className="px-5 py-10 text-center text-sm text-[var(--admin-texto-muted)]">No encontramos cuentas en esta lista.</p>}
      </div>
    </section>
  );
}

function UsuarioFila({ usuario, esActual, puedeRestablecer }: { usuario: UsuarioAdministrable; esActual: boolean; puedeRestablecer: boolean }) {
  const [rol, setRol] = useState<RolUsuario>(usuario.role);
  const [pendiente, iniciarTransicion] = useTransition();
  const [restableciendo, iniciarRestablecimiento] = useTransition();
  const [eliminando, iniciarEliminacion] = useTransition();
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
  const router = useRouter();
  const tieneTurnos = usuario.cantidadTurnos > 0;
  const motivoSinEliminar = esActual
    ? "No podés eliminar tu propia cuenta"
    : tieneTurnos
      ? `Tiene ${usuario.cantidadTurnos} turno${usuario.cantidadTurnos === 1 ? "" : "s"} registrado${usuario.cantidadTurnos === 1 ? "" : "s"}`
      : null;

  const eliminar = () => {
    setConfirmandoEliminacion(false);
    iniciarEliminacion(async () => {
      const resultado = await eliminarUsuario(usuario.id);
      if (resultado.success) {
        toast.success("Cuenta eliminada");
        router.refresh();
        return;
      }
      toast.error(resultado.error ?? "No se pudo eliminar la cuenta");
      // Ante un fallo (p. ej. timeout) se recarga el listado para reflejar el estado real.
      router.refresh();
    });
  };
  const cambioPendiente = rol !== usuario.role || ((rol === "EMPLEADO" || rol === "ADMIN") && !usuario.barbero);

  const guardar = () => {
    iniciarTransicion(async () => {
      const resultado = await actualizarRolUsuario(usuario.id, rol);
      if (resultado.success) {
        toast.success("Cuenta actualizada");
        router.refresh();
        return;
      }
      toast.error(resultado.error ?? "No se pudo actualizar el rol");
    });
  };

  const restablecer = () => {
    if (!window.confirm(`¿Enviar un enlace de restablecimiento de contraseña a ${usuario.email}?`)) return;
    iniciarRestablecimiento(async () => {
      const resultado = await solicitarRestablecimiento(usuario.id);
      if (resultado.success) {
        if (resultado.aviso) {
          toast.warning("Enlace generado", { description: resultado.aviso });
        } else {
          toast.success("Enlace enviado", { description: "El empleado recibirá un correo para cambiar su contraseña." });
        }
        return;
      }
      toast.error(resultado.error ?? "No se pudo iniciar el restablecimiento");
    });
  };

  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <p className="font-medium text-[var(--admin-texto-primario)]">{usuario.name || "Sin nombre"}</p>
        <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">{usuario.email}</p>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-[var(--admin-texto-primario)]">
        {usuario.telefono || <span className="text-[var(--admin-texto-muted)]">Sin celular</span>}
      </td>
      <td className="px-5 py-4">
        <select value={rol} onChange={(evento) => setRol(rolDesdeValor(evento.target.value))} disabled={esActual || pendiente} aria-label={`Rol de ${usuario.email}`} className="h-9 rounded-lg border bg-[var(--admin-surface-elevated)] px-3 text-sm text-[var(--admin-texto-primario)]" style={{ borderColor: "var(--admin-border)" }}>
          {ROLES_USUARIO.map((opcion) => <option key={opcion} value={opcion}>{ETIQUETAS_ROL[opcion]}</option>)}
        </select>
      </td>
      <td className="px-5 py-4">
        {usuario.barbero ? (
          <div>
            <span className="font-medium text-[var(--admin-texto-primario)]">{usuario.barbero.nombre}</span>
            <span className="mt-1 block text-xs text-[var(--admin-texto-muted)]">Correo sincronizado automáticamente</span>
          </div>
        ) : rol === "EMPLEADO" || rol === "ADMIN" ? (
          <span className="text-sm text-[var(--admin-texto-muted)]">Se creará al guardar el rol</span>
        ) : <span className="text-sm text-[var(--admin-texto-muted)]">Sin perfil</span>}
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {puedeRestablecer && (
            <button type="button" onClick={restablecer} disabled={restableciendo || pendiente} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--admin-texto-primario)] disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>
              <KeyRound className="h-3.5 w-3.5" />{restableciendo ? "Enviando..." : "Restablecer contraseña"}
            </button>
          )}
          <button type="button" onClick={guardar} disabled={!cambioPendiente || pendiente || esActual} className="inline-flex items-center gap-2 rounded-lg bg-[var(--page-primary)] px-3 py-2 text-xs font-semibold text-[var(--page-primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="h-3.5 w-3.5" />{pendiente ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={() => setEditando(true)} disabled={eliminando} title="Editar datos" aria-label={`Editar ${usuario.email}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--admin-texto-primario)] disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: "var(--admin-border)" }}>
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmandoEliminacion(true)}
            disabled={Boolean(motivoSinEliminar) || eliminando || pendiente}
            title={motivoSinEliminar ?? `Eliminar ${usuario.email}`}
            aria-label={`Eliminar ${usuario.email}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className={eliminando ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} />
          </button>
        </div>
        {tieneTurnos && !esActual && <p className="mt-2 text-xs text-[var(--admin-texto-muted)]">{motivoSinEliminar}: no se puede eliminar</p>}
        {editando && <EditarUsuarioModal usuario={usuario} onClose={() => setEditando(false)} />}
        {confirmandoEliminacion && (
          <ConfirmDialog
            title="Eliminar cuenta"
            message={`Se eliminará definitivamente la cuenta de ${usuario.email}. Esta acción no se puede deshacer.`}
            onConfirm={eliminar}
            onCancel={() => setConfirmandoEliminacion(false)}
          />
        )}
      </td>
    </tr>
  );
}
