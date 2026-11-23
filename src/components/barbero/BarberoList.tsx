"use client";

import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import BarberoFila from "./BarberoFila";
import PerfilBarbero from "./PerfilBarbero";
import type { BarberoListado, DiaLaboral, ServicioOpcion } from "@/types/barbero";

const FILTROS = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "activos", etiqueta: "Activos" },
  { valor: "inactivos", etiqueta: "Inactivos" },
] as const;

type FiltroEstado = (typeof FILTROS)[number]["valor"];

type PropiedadesListaBarberos = {
  barberos?: BarberoListado[];
  servicios?: ServicioOpcion[];
  diasLaborales?: DiaLaboral[];
  soloEdicionPropia?: boolean;
};

export default function BarberoList({
  barberos = [],
  servicios = [],
  diasLaborales = [],
  soloEdicionPropia = false,
}: PropiedadesListaBarberos) {
  const [busqueda, establecerBusqueda] = useState("");
  const [filtroEstado, establecerFiltroEstado] = useState<FiltroEstado>("activos");
  const barberosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return barberos.filter((barbero) => {
      const coincideEstado = filtroEstado === "todos" || (filtroEstado === "activos" ? barbero.estado : !barbero.estado);
      const correo = barbero.usuario?.email ?? "";
      const coincideBusqueda = !termino || barbero.nombre?.toLocaleLowerCase().includes(termino) || correo.toLocaleLowerCase().includes(termino);
      return coincideEstado && coincideBusqueda;
    });
  }, [barberos, busqueda, filtroEstado]);

  if (!barberos.length) {
    return (
      <EmptyState
        icono={<UserRound aria-hidden="true" />}
        titulo={soloEdicionPropia ? "No encontramos tu perfil profesional" : "Todavía no hay empleados"}
        mensaje={soloEdicionPropia ? undefined : "Podés asignar el rol Empleado desde Usuarios."}
        claseContenedor="admin-card px-4 py-10"
        claseIcono="grid size-10 place-items-center rounded-xl bg-[var(--page-primary-soft)] [&_svg]:size-5"
        estiloIcono={{ color: "var(--admin-acento-suave-texto)" }}
      />
    );
  }

  if (soloEdicionPropia) {
    return <PerfilBarbero barbero={barberos[0]} servicios={servicios} diasLaborales={diasLaborales} esEmpleado />;
  }

  return (
    <>
      <section className="admin-card flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between" aria-label="Filtros de empleados">
        <label className="relative block min-w-0 flex-1 lg:max-w-md">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => establecerBusqueda(evento.target.value)}
            placeholder="Nombre o correo"
            aria-label="Buscar empleado por nombre o correo"
            className="min-h-11 w-full rounded-xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] pl-9 pr-3 text-base placeholder:text-[var(--admin-texto-muted)] sm:text-sm"
          />
        </label>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--admin-item)] p-1" role="group" aria-label="Estado de los empleados">
          {FILTROS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              onClick={() => establecerFiltroEstado(valor)}
              aria-pressed={filtroEstado === valor}
              className="min-h-10 rounded-lg px-3 text-sm font-medium text-[var(--admin-texto-secundario)] hover:text-[var(--admin-texto-primario)] aria-pressed:bg-[var(--admin-surface)] aria-pressed:text-[var(--admin-acento-suave-texto)]"
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </section>

      {barberosFiltrados.length ? (
        <section aria-labelledby="listado-empleados" className="min-w-0 space-y-2 lg:space-y-0 lg:rounded-2xl lg:border lg:border-[var(--admin-border)] lg:bg-[var(--admin-surface)]">
          <header className="flex items-center justify-between gap-3 px-1 py-1 lg:px-4 lg:py-3">
            <h2 id="listado-empleados" className="text-base font-semibold">Perfiles</h2>
            <span aria-live="polite" className="text-sm tabular-nums text-[var(--admin-texto-muted)]">{barberosFiltrados.length} {barberosFiltrados.length === 1 ? "perfil" : "perfiles"}</span>
          </header>
          <ul className="space-y-2 lg:space-y-0">
            {barberosFiltrados.map((barbero) => (
              <BarberoFila key={barbero.id} barbero={barbero} servicios={servicios} diasLaborales={diasLaborales} />
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          titulo="No encontramos empleados"
          mensaje="Probá con otro nombre o cambiá el filtro de estado."
          claseContenedor="admin-card px-4 py-10"
          accion={
            <button type="button" onClick={() => { establecerBusqueda(""); establecerFiltroEstado("todos"); }} className="admin-control">
              Limpiar filtros
            </button>
          }
        />
      )}
    </>
  );
}
