"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, Save, KeyRound, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listarUsuarios } from "@/actions/usuarios/listar.actions";
import { actualizarRolUsuario } from "@/actions/usuarios/rol.actions";
import { solicitarRestablecimiento } from "@/actions/usuarios/restablecer-password.actions";
import { eliminarUsuario } from "@/actions/usuarios/eliminar.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import SelectorDesplegable from "@/components/ui/SelectorDesplegable";
import type { OpcionDesplegable } from "@/components/ui/SelectorDesplegable";
import EditarUsuarioModal from "./EditarUsuarioModal";
import { ETIQUETAS_ROL, ROLES_USUARIO, type RolUsuario } from "@/types/usuario";
import type {
  ConsultaUsuarios,
  DatosUsuariosAdministrables,
  UsuarioAdministrable,
} from "@/actions/usuarios/listar.actions";

type Props = {
  datosIniciales: DatosUsuariosAdministrables;
  actorId: string;
  errorInicial?: string;
};

type ListaActiva = ConsultaUsuarios["lista"];

const OPCIONES_ROL: OpcionDesplegable<RolUsuario>[] = ROLES_USUARIO.map((rol) => ({
  valor: rol,
  etiqueta: ETIQUETAS_ROL[rol],
}));

const LISTAS: { clave: ListaActiva; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "usuarios", etiqueta: "Usuarios" },
  { clave: "empleados", etiqueta: "Empleados" },
  { clave: "administradores", etiqueta: "Administradores" },
];

export default function UsuarioList({ datosIniciales, actorId, errorInicial }: Props) {
  const [consulta, setConsulta] = useState<ConsultaUsuarios>({
    lista: "todos",
    busqueda: "",
    pagina: 1,
  });
  const consultaInicialRef = useRef(consulta);
  const actualizarContadoresRef = useRef(false);
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState(datosIniciales);
  const [consultaDatos, setConsultaDatos] = useState(consulta);
  const [contadores, setContadores] = useState(datosIniciales.contadores ?? {
    todos: 0, usuarios: 0, empleados: 0, administradores: 0,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(errorInicial ?? null);
  const [revision, setRevision] = useState(0);

  const recargar = useCallback(() => {
    actualizarContadoresRef.current = true;
    setCargando(true);
    setRevision((actual) => actual + 1);
  }, []);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      const termino = busqueda.trim();
      setConsulta((actual) => actual.busqueda === termino
        ? actual
        : { ...actual, busqueda: termino, pagina: 1 });
    }, 300);
    return () => window.clearTimeout(temporizador);
  }, [busqueda]);

  useEffect(() => {
    if (revision === 0 && consulta === consultaInicialRef.current) return;

    let activa = true;
    setCargando(true);
    setError(null);
    const incluirContadores = actualizarContadoresRef.current;
    actualizarContadoresRef.current = false;
    void listarUsuarios(consulta, incluirContadores)
      .then((resultado) => {
        if (!activa) return;
        if (!resultado.success || !resultado.data) {
          setError(resultado.error ?? "No se pudieron cargar las cuentas");
          return;
        }
        setDatos(resultado.data);
        setConsultaDatos(consulta);
        if (resultado.data.contadores) setContadores(resultado.data.contadores);
      })
      .catch(() => {
        if (activa) setError("No se pudieron cargar las cuentas");
      })
      .finally(() => {
        if (activa) setCargando(false);
      });
    return () => {
      activa = false;
    };
  }, [consulta, revision]);

  const seleccionarLista = (lista: ListaActiva) => {
    setConsulta((actual) => actual.lista === lista && actual.busqueda === busqueda.trim()
      ? actual
      : { lista, busqueda: busqueda.trim(), pagina: 1 });
  };
  const resultadoActual = consulta.lista === consultaDatos.lista
    && consulta.busqueda === consultaDatos.busqueda
    && consulta.pagina === consultaDatos.pagina;
  const mostrarCarga = !error && (cargando || !resultadoActual);

  return (
    <section className="space-y-5">
      <div
        className="grid grid-cols-2 gap-2 rounded-xl border bg-[var(--admin-surface)] p-2 sm:grid-cols-4"
        style={{ borderColor: "var(--admin-border)" }}
        role="tablist"
        aria-label="Listas de cuentas"
      >
        {LISTAS.map(({ clave, etiqueta }) => (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={consulta.lista === clave}
            aria-controls="panel-usuarios"
            onClick={() => seleccionarLista(clave)}
            className="rounded-lg px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
            style={consulta.lista === clave
              ? { backgroundColor: "var(--page-primary-15)", color: "var(--admin-texto-primario)" }
              : { color: "var(--admin-texto-muted)" }}
          >
            <span className="block font-semibold">{etiqueta}</span>
            <span className="mt-1 block text-xs text-[var(--admin-texto-muted)]">
              {contadores[clave]} cuenta{contadores[clave] === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>

      <label className="relative block w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          maxLength={100}
          placeholder="Buscar por correo, nombre o celular..."
          aria-label="Buscar usuario por correo, nombre o celular"
          className="h-10 w-full rounded-lg border bg-[var(--admin-surface)] pl-9 pr-3 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          style={{ borderColor: "var(--admin-border)" }}
        />
      </label>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-[var(--admin-texto-primario)]">
          <span>{error}</span>
          <button type="button" onClick={recargar} className="font-medium text-[var(--page-primary-tinta)]">
            Reintentar
          </button>
        </div>
      )}

      <div id="panel-usuarios" role="tabpanel" aria-busy={mostrarCarga} className="overflow-x-auto rounded-xl border bg-[var(--admin-surface)]" style={{ borderColor: "var(--admin-border)" }}>
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
            {mostrarCarga ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--admin-texto-muted)]">Cargando cuentas...</td></tr>
            ) : error ? null : datos.registros.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-[var(--admin-texto-muted)]">No encontramos cuentas en esta lista.</td></tr>
            ) : datos.registros.map((usuario) => (
              <UsuarioFila
                key={usuario.id}
                usuario={usuario}
                esActual={usuario.id === actorId}
                puedeRestablecer={usuario.role === "EMPLEADO"}
                onCambio={recargar}
              />
            ))}
          </tbody>
        </table>
      </div>

      {!error && !mostrarCarga && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--admin-texto-muted)]">
          <span>Página {datos.pagina} de {datos.totalPaginas} · {datos.totalResultados} resultado{datos.totalResultados === 1 ? "" : "s"}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={datos.pagina <= 1}
              onClick={() => setConsulta((actual) => ({ ...actual, pagina: datos.pagina - 1 }))}
              className="rounded-lg border border-[var(--admin-border)] px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={datos.pagina >= datos.totalPaginas}
              onClick={() => setConsulta((actual) => ({ ...actual, pagina: datos.pagina + 1 }))}
              className="rounded-lg border border-[var(--admin-border)] px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
function UsuarioFila({ usuario, esActual, puedeRestablecer, onCambio }: { usuario: UsuarioAdministrable; esActual: boolean; puedeRestablecer: boolean; onCambio: () => void }) {
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
        <SelectorDesplegable
          opciones={OPCIONES_ROL}
          valor={rol}
          onChange={setRol}
          deshabilitado={esActual || pendiente}
          etiquetaAria={`Rol de ${usuario.email}`}
          className="w-fit min-w-[118px]"
          claseBoton="h-9 rounded-lg px-3"
        />
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
        {editando && <EditarUsuarioModal usuario={usuario} onClose={() => setEditando(false)} onGuardado={onCambio} />}
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
