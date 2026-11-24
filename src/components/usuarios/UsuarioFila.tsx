"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { ChevronDown, KeyRound, Pencil, Save, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { UsuarioAdministrable } from "@/actions/usuarios/listar.actions";
import { actualizarRolUsuario } from "@/actions/usuarios/rol.actions";
import { solicitarRestablecimiento } from "@/actions/usuarios/restablecer-password.actions";
import { eliminarUsuario } from "@/actions/usuarios/eliminar.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import { ETIQUETAS_ROL, ROLES_USUARIO, type RolUsuario } from "@/types/usuario";
import EditarUsuarioModal from "./EditarUsuarioModal";

const OPCIONES_ROL = ROLES_USUARIO.map((rol) => ({
  valor: rol,
  etiqueta: ETIQUETAS_ROL[rol],
}));

type Props = {
  usuario: UsuarioAdministrable;
  esActual: boolean;
  onCambio: () => void;
};

export default function UsuarioFila({ usuario, esActual, onCambio }: Props) {
  const [expandido, setExpandido] = useState(false);
  const idDetalles = useId();
  const [rol, setRol] = useState<RolUsuario>(usuario.role);
  useEffect(() => setRol(usuario.role), [usuario.role]);
  const [pendiente, iniciarTransicion] = useTransition();
  const [restableciendo, iniciarRestablecimiento] = useTransition();
  const [eliminando, iniciarEliminacion] = useTransition();
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
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
        onCambio();
        return;
      }
      toast.error(resultado.error ?? "No se pudo eliminar la cuenta");
      // Ante un fallo (p. ej. timeout) se recarga el listado para reflejar el estado real.
      onCambio();
    });
  };
  const cambioPendiente = rol !== usuario.role || ((rol === "EMPLEADO" || rol === "ADMIN") && !usuario.barbero);

  const guardar = () => {
    iniciarTransicion(async () => {
      const resultado = await actualizarRolUsuario(usuario.id, rol);
      if (resultado.success) {
        toast.success("Cuenta actualizada");
        onCambio();
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

  const nombre = usuario.name || "Sin nombre";

  return (
    <li className="min-w-0 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 xl:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_13rem] xl:items-start xl:gap-4 xl:rounded-none xl:border-0 xl:border-b xl:bg-transparent xl:px-4 xl:py-4 xl:last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--admin-item)] text-[var(--admin-texto-muted)]">
          <UserRound aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold [overflow-wrap:anywhere]">{nombre}</p>
          <p className={`${expandido ? "hidden" : "block"} mt-0.5 truncate text-xs text-[var(--admin-texto-muted)] xl:block xl:whitespace-normal xl:[overflow-wrap:anywhere]`}>
            {usuario.email}
          </p>
          <p className="mt-1 text-xs text-[var(--admin-texto-secundario)] xl:hidden">
            {ETIQUETAS_ROL[usuario.role]}
          </p>
        </div>
        <button
          type="button"
          aria-label={`${expandido ? "Ocultar" : "Ver"} detalles de ${nombre}`}
          aria-expanded={expandido}
          aria-controls={idDetalles}
          onClick={() => setExpandido((actual) => !actual)}
          className="grid size-11 shrink-0 place-items-center rounded-xl text-[var(--admin-acento-suave-texto)] hover:bg-[var(--admin-item)] xl:hidden"
        >
          <ChevronDown aria-hidden="true" className={`size-5 motion-safe:transition-transform ${expandido ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div id={idDetalles} className={`${expandido ? "grid" : "hidden"} mt-2 gap-3 border-t border-[var(--admin-border)] pb-1 pt-3 text-sm sm:grid-cols-2 xl:contents`}>
        <dl className="grid min-w-0 gap-2.5">
          <div className="xl:hidden">
            <dt className="text-xs text-[var(--admin-texto-muted)]">Correo</dt>
            <dd className="[overflow-wrap:anywhere]">{usuario.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--admin-texto-muted)]">Celular</dt>
            <dd className="[overflow-wrap:anywhere]">{usuario.telefono || "Sin celular"}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--admin-texto-muted)]">Perfil de barbero</dt>
            <dd className="[overflow-wrap:anywhere]">
              {usuario.barbero?.nombre ?? (rol === "EMPLEADO" || rol === "ADMIN" ? "Se creará al guardar el rol" : "Sin perfil")}
            </dd>
            {usuario.barbero && <dd className="text-xs text-[var(--admin-texto-muted)]">Correo sincronizado automáticamente</dd>}
          </div>
        </dl>

        <div className="min-w-0 space-y-1">
          <p className="text-xs text-[var(--admin-texto-muted)]">Rol</p>
          <SelectorDesplegable
            opciones={OPCIONES_ROL}
            valor={rol}
            onChange={setRol}
            deshabilitado={esActual || pendiente}
            etiquetaAria={`Rol de ${usuario.email}`}
            claseBoton="min-h-11 rounded-xl px-3 sm:min-h-10"
          />
          {cambioPendiente && !esActual && (
            <button type="button" onClick={guardar} disabled={pendiente} className="admin-accion mt-2 w-full">
              <Save aria-hidden="true" className="size-4" />
              {pendiente ? "Guardando…" : "Guardar rol"}
            </button>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2 xl:col-span-1">
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <button type="button" onClick={() => setEditando(true)} disabled={eliminando} className="admin-control">
              <Pencil aria-hidden="true" className="size-4" />Editar
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoEliminacion(true)}
              disabled={Boolean(motivoSinEliminar) || eliminando || pendiente}
              title={motivoSinEliminar ?? "Eliminar cuenta"}
              aria-label={`Eliminar cuenta de ${nombre}`}
              className="admin-control px-2.5 text-[var(--admin-error)]"
            >
              <Trash2 aria-hidden="true" className={`size-4 ${eliminando ? "motion-safe:animate-pulse" : ""}`} />
            </button>
            {usuario.role === "EMPLEADO" && (
              <button type="button" onClick={restablecer} disabled={restableciendo || pendiente} className="admin-control">
                <KeyRound aria-hidden="true" className="size-4 shrink-0" />
                {restableciendo ? "Enviando…" : "Restablecer contraseña"}
              </button>
            )}
          </div>
          {tieneTurnos && !esActual && <p className="text-xs text-[var(--admin-texto-muted)] xl:text-right">{motivoSinEliminar}. No se puede eliminar.</p>}
        </div>
      </div>

      {editando && <EditarUsuarioModal usuario={usuario} onClose={() => setEditando(false)} onGuardado={onCambio} />}
      {confirmandoEliminacion && (
        <ConfirmDialog
          title="Eliminar cuenta"
          message={`Se eliminará definitivamente la cuenta de ${usuario.email}. Esta acción no se puede deshacer.`}
          onConfirm={eliminar}
          onCancel={() => setConfirmandoEliminacion(false)}
        />
      )}
    </li>
  );
}
