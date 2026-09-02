"use client";

import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import BarberoFila from "@/components/barbero/BarberoFila";
import type { BarberoListado, DiaLaboral, ServicioOpcion } from "@/types/barbero";

type FiltroEstado = "todos" | "activos" | "inactivos";
type PropiedadesListaBarberos = { barberos?: BarberoListado[]; servicios?: ServicioOpcion[]; diasLaborales?: DiaLaboral[] };

export default function BarberoList({ barberos = [], servicios = [], diasLaborales = [] }: PropiedadesListaBarberos) {
  const [busqueda, establecerBusqueda] = useState("");
  const [filtroEstado, establecerFiltroEstado] = useState<FiltroEstado>("todos");
  const [idMenuAbierto, establecerIdMenuAbierto] = useState<string | null>(null);
  const barberosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return barberos.filter((barbero) => {
      const coincideEstado = filtroEstado === "todos" || (filtroEstado === "activos" ? barbero.estado : !barbero.estado);
      const coincideBusqueda = !termino || barbero.nombre?.toLocaleLowerCase().includes(termino) || barbero.email?.toLocaleLowerCase().includes(termino);
      return coincideEstado && coincideBusqueda;
    });
  }, [barberos, busqueda, filtroEstado]);

  if (!barberos.length) return <EmptyState icono={<UserRound />} mensaje="Todavía no hay barberos" claseContenedor="rounded-xl border bg-[var(--admin-surface)] p-10" estiloContenedor={{ borderColor: "var(--admin-border)" }} claseIcono="h-12 w-12" estiloIcono={{ color: "var(--page-primary-tinta)" }} estiloMensaje={{ color: "var(--admin-texto-primario)" }} />;

  return <section className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-texto-muted)]" /><input value={busqueda} onChange={(evento) => establecerBusqueda(evento.target.value)} placeholder="Buscar barbero..." aria-label="Buscar por nombre o email" className="h-10 w-full rounded-lg border bg-[var(--admin-surface)] pl-9 pr-3 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]" style={{ borderColor: "var(--admin-border)" }} /></label>
      <div className="flex w-full rounded-lg border p-1 sm:w-auto" style={{ borderColor: "var(--admin-border)" }}>{(["todos", "activos", "inactivos"] as const).map((filtro) => <button key={filtro} type="button" onClick={() => establecerFiltroEstado(filtro)} className="min-h-8 flex-1 rounded-md px-3 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] sm:flex-none" style={filtroEstado === filtro ? { backgroundColor: "var(--page-primary-20)", color: "var(--admin-texto-primario)" } : { color: "var(--admin-texto-muted)" }}>{filtro}</button>)}</div>
    </div>
    {barberosFiltrados.length ? <div className="rounded-xl border bg-[var(--admin-surface)]" style={{ borderColor: "var(--admin-border)" }}>
      <div className="hidden grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_minmax(150px,0.8fr)_110px_120px] gap-5 border-b px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--admin-texto-muted)] lg:grid" style={{ borderColor: "var(--admin-border)" }}><span>Barbero</span><span>Servicios</span><span>Disponibilidad</span><span>Estado</span><span>Acciones</span></div>
      {barberosFiltrados.map((barbero) => <BarberoFila key={barbero.id} barbero={barbero} servicios={servicios} diasLaborales={diasLaborales} menuAbierto={idMenuAbierto === barbero.id} onAlternarMenu={() => establecerIdMenuAbierto((idActual) => idActual === barbero.id ? null : barbero.id)} onCerrarMenu={() => establecerIdMenuAbierto(null)} />)}
    </div> : <div className="rounded-xl border bg-[var(--admin-surface)] px-6 py-12 text-center" style={{ borderColor: "var(--admin-border)" }}><p className="font-medium text-[var(--admin-texto-primario)]">No encontramos barberos</p><p className="mt-1 text-sm text-[var(--admin-texto-muted)]">No hay resultados para esta búsqueda.</p><button type="button" onClick={() => { establecerBusqueda(""); establecerFiltroEstado("todos"); }} className="mt-4 text-sm font-medium text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]">Limpiar filtros</button></div>}
  </section>;
}
