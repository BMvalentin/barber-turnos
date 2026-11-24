"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { listarUsuarios } from "@/actions/usuarios/listar.actions";
import type { ConsultaUsuarios, DatosUsuariosAdministrables } from "@/actions/usuarios/listar.actions";
import UsuarioFila from "./UsuarioFila";

type Props = {
  datosIniciales: DatosUsuariosAdministrables;
  actorId: string;
  errorInicial?: string;
};

type ListaActiva = ConsultaUsuarios["lista"];

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
    <>
      <section className="admin-card space-y-3 p-3 sm:p-4" aria-label="Filtros de usuarios">
        <label className="relative block w-full sm:max-w-md">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            maxLength={100}
            placeholder="Nombre, correo o celular"
            aria-label="Buscar usuario por nombre, correo o celular"
            className="min-h-11 w-full rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] pl-9 pr-3 text-base placeholder:text-[var(--admin-texto-muted)] sm:text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--admin-item)] p-1 sm:grid-cols-4" role="group" aria-label="Filtrar por rol">
          {LISTAS.map(({ clave, etiqueta }) => (
            <button
              key={clave}
              type="button"
              aria-pressed={consulta.lista === clave}
              onClick={() => seleccionarLista(clave)}
              className="flex min-h-10 flex-wrap items-center justify-center gap-x-1.5 rounded-lg px-1 text-sm font-medium text-[var(--admin-texto-secundario)] hover:text-[var(--admin-texto-primario)] aria-pressed:bg-[var(--admin-surface)] aria-pressed:text-[var(--admin-acento-suave-texto)] sm:px-2"
            >
              <span>{etiqueta}</span>
              <span className="text-xs tabular-nums text-[var(--admin-texto-muted)]">{contadores[clave]}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Listado de usuarios" aria-busy={mostrarCarga} className="min-w-0 space-y-3">
        {error ? (
          <div role="alert" className="admin-card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <p>{error}</p>
            <button type="button" onClick={recargar} className="admin-control">Reintentar</button>
          </div>
        ) : mostrarCarga ? (
          <div className="admin-card space-y-3 p-4" role="status">
            <span className="sr-only">Cargando cuentas</span>
            {[1, 2, 3].map((fila) => (
              <div key={fila} aria-hidden="true" className="h-12 rounded-lg bg-[var(--admin-item)] motion-safe:animate-pulse" />
            ))}
          </div>
        ) : datos.registros.length === 0 ? (
          <div className="admin-card px-4 py-10 text-center text-sm text-[var(--admin-texto-muted)]">
            No encontramos cuentas en esta lista.
          </div>
        ) : (
          <ul className="space-y-2 xl:space-y-0 xl:rounded-2xl xl:border xl:border-[var(--admin-border)] xl:bg-[var(--admin-surface)]">
            {datos.registros.map((usuario) => (
              <UsuarioFila key={usuario.id} usuario={usuario} esActual={usuario.id === actorId} onCambio={recargar} />
            ))}
          </ul>
        )}

        {!error && !mostrarCarga && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--admin-texto-muted)]">
            <span>Página {datos.pagina} de {datos.totalPaginas} · {datos.totalResultados} resultado{datos.totalResultados === 1 ? "" : "s"}</span>
            {datos.totalPaginas > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={datos.pagina <= 1}
                  onClick={() => setConsulta((actual) => ({ ...actual, pagina: datos.pagina - 1 }))}
                  className="admin-control"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={datos.pagina >= datos.totalPaginas}
                  onClick={() => setConsulta((actual) => ({ ...actual, pagina: datos.pagina + 1 }))}
                  className="admin-control"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
