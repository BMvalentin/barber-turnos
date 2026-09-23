"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Save } from "lucide-react";
import { toast } from "sonner";
import { actualizarRolUsuario } from "@/actions/usuarios/rol.actions";
import { ETIQUETAS_ROL, ROLES_USUARIO, type RolUsuario } from "@/types/usuario";
import type { BarberoOpcionUsuario, UsuarioAdministrable } from "@/actions/usuarios/listar.actions";

type Props = {
  usuarios: UsuarioAdministrable[];
  barberos: BarberoOpcionUsuario[];
  actorId: string;
};

function rolDesdeValor(valor: string): RolUsuario {
  return ROLES_USUARIO.find((rol) => rol === valor) ?? "USER";
}

export default function UsuarioList({ usuarios, barberos, actorId }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const termino = busqueda.trim().toLocaleLowerCase();
  const usuariosFiltrados = useMemo(
    () => usuarios.filter((usuario) => !termino || usuario.email.toLocaleLowerCase().includes(termino) || usuario.name?.toLocaleLowerCase().includes(termino)),
    [termino, usuarios],
  );

  return (
    <section className="space-y-5">
      <label className="relative block w-full sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
        <input
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por correo o nombre..."
          aria-label="Buscar usuario por correo o nombre"
          className="h-10 w-full rounded-lg border bg-[var(--admin-surface)] pl-9 pr-3 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]"
          style={{ borderColor: "var(--admin-border)" }}
        />
      </label>

      <div className="overflow-x-auto rounded-xl border bg-[var(--admin-surface)]" style={{ borderColor: "var(--admin-border)" }}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-[var(--admin-surface-elevated)] text-xs uppercase tracking-wide text-[var(--admin-texto-muted)]" style={{ borderColor: "var(--admin-border)" }}>
            <tr>
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Barbero asociado</th>
              <th className="px-5 py-3 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {usuariosFiltrados.map((usuario) => (
              <UsuarioFila key={usuario.id} usuario={usuario} barberos={barberos} esActual={usuario.id === actorId} />
            ))}
          </tbody>
        </table>
        {usuariosFiltrados.length === 0 && <p className="px-5 py-10 text-center text-sm text-[var(--admin-texto-muted)]">No encontramos usuarios.</p>}
      </div>
    </section>
  );
}

function UsuarioFila({ usuario, barberos, esActual }: { usuario: UsuarioAdministrable; barberos: BarberoOpcionUsuario[]; esActual: boolean }) {
  const [rol, setRol] = useState<RolUsuario>(usuario.role);
  const [barberoId, setBarberoId] = useState(usuario.barbero?.id ?? "");
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();
  const cambioPendiente = rol !== usuario.role || (rol === "EMPLEADO" && barberoId !== (usuario.barbero?.id ?? ""));

  const guardar = () => {
    iniciarTransicion(async () => {
      const resultado = await actualizarRolUsuario(usuario.id, rol, rol === "EMPLEADO" ? barberoId || null : null);
      if (resultado.success) {
        toast.success("Rol actualizado");
        router.refresh();
        return;
      }
      toast.error(resultado.error ?? "No se pudo actualizar el rol");
    });
  };

  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <p className="font-medium text-[var(--admin-texto-primario)]">{usuario.name || "Sin nombre"}</p>
        <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">{usuario.email}</p>
      </td>
      <td className="px-5 py-4">
        <select value={rol} onChange={(evento) => setRol(rolDesdeValor(evento.target.value))} disabled={esActual || pendiente} aria-label={`Rol de ${usuario.email}`} className="h-9 rounded-lg border bg-[var(--admin-surface-elevated)] px-3 text-sm text-[var(--admin-texto-primario)]" style={{ borderColor: "var(--admin-border)" }}>
          {ROLES_USUARIO.map((opcion) => <option key={opcion} value={opcion}>{ETIQUETAS_ROL[opcion]}</option>)}
        </select>
      </td>
      <td className="px-5 py-4">
        {rol === "EMPLEADO" ? (
          <select value={barberoId} onChange={(evento) => setBarberoId(evento.target.value)} disabled={esActual || pendiente} aria-label={`Barbero de ${usuario.email}`} className="h-9 min-w-52 rounded-lg border bg-[var(--admin-surface-elevated)] px-3 text-sm text-[var(--admin-texto-primario)]" style={{ borderColor: "var(--admin-border)" }}>
            <option value="">Seleccionar...</option>
            {barberos.map((barbero) => <option key={barbero.id} value={barbero.id} disabled={Boolean(barbero.usuarioId && barbero.usuarioId !== usuario.id)}>{barbero.nombre}{barbero.usuarioId && barbero.usuarioId !== usuario.id ? " (asignado)" : ""}</option>)}
          </select>
        ) : <span className="text-sm text-[var(--admin-texto-muted)]">—</span>}
      </td>
      <td className="px-5 py-4 text-right">
        <button type="button" onClick={guardar} disabled={esActual || !cambioPendiente || pendiente || (rol === "EMPLEADO" && !barberoId)} className="inline-flex items-center gap-2 rounded-lg bg-[var(--page-primary)] px-3 py-2 text-xs font-semibold text-[var(--page-primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50">
          <Save className="h-3.5 w-3.5" />{pendiente ? "Guardando..." : "Guardar"}
        </button>
      </td>
    </tr>
  );
}
