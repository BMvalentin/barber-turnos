"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MoreHorizontal, Pencil, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteBarbero } from "@/actions/barberos/eliminar.actions";
import EditBarberoModal from "@/components/barbero/EditBarberoModal";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import { DIAS_SEMANA_DB } from "@/lib/constants";
import type { BarberoListado, DiaLaboral, ServicioOpcion } from "@/types/barbero";

type PropiedadesFilaBarbero = { barbero: BarberoListado; servicios: ServicioOpcion[]; diasLaborales: DiaLaboral[]; menuAbierto: boolean; onAlternarMenu: () => void; onCerrarMenu: () => void };
type HorarioBarbero = NonNullable<BarberoListado["horarios"]>[number];

function obtenerHorariosPorDia(horarios: HorarioBarbero[] = []): Record<string, HorarioBarbero[]> {
  return horarios.reduce<Record<string, HorarioBarbero[]>>((acumulado, horario) => {
    const dia = horario.dia.dia;
    acumulado[dia] = [...(acumulado[dia] ?? []), horario];
    return acumulado;
  }, {});
}

export default function BarberoFila({ barbero, servicios, diasLaborales, menuAbierto, onAlternarMenu, onCerrarMenu }: PropiedadesFilaBarbero) {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const [horariosAbiertos, establecerHorariosAbiertos] = useState(false);
  const [confirmarBaja, establecerConfirmarBaja] = useState(false);
  const [, iniciarTransicion] = useTransition();
  const router = useRouter();
  const referenciaAcciones = useRef<HTMLDivElement>(null);
  const horariosPorDia = obtenerHorariosPorDia(barbero.horarios);
  const dias = Object.keys(horariosPorDia).sort((a, b) => DIAS_SEMANA_DB.indexOf(a as (typeof DIAS_SEMANA_DB)[number]) - DIAS_SEMANA_DB.indexOf(b as (typeof DIAS_SEMANA_DB)[number]));
  const nombresServicios = barbero.servicios?.map(({ servicio }) => servicio.nombre) ?? [];
  const cantidadDias = dias.length;
  const darDeBaja = () => iniciarTransicion(async () => { const datos = new FormData(); datos.set("id", barbero.id); await deleteBarbero(datos); establecerConfirmarBaja(false); router.refresh(); });

  useEffect(() => {
    if (!menuAbierto) return;

    const cerrarAlHacerClicFuera = (evento: PointerEvent) => {
      if (!(evento.target instanceof Node) || !referenciaAcciones.current?.contains(evento.target)) onCerrarMenu();
    };
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrarMenu();
    };

    document.addEventListener("pointerdown", cerrarAlHacerClicFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlHacerClicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuAbierto, onCerrarMenu]);

  return <>
    <article className="relative border-b px-4 py-4 transition-colors hover:bg-[var(--admin-item-hover)] last:border-b-0 lg:grid lg:min-h-[104px] lg:grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_minmax(150px,0.8fr)_110px_120px] lg:items-center lg:gap-5 lg:px-6" style={{ borderColor: "var(--admin-border)" }}>
      <div className="flex min-w-0 items-center gap-3">
        {barbero.srcImage ? <img src={barbero.srcImage} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" /> : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--admin-item)] text-[var(--admin-texto-muted)]"><UserRound className="h-6 w-6" /></span>}
        <div className="min-w-0"><p className="truncate font-semibold text-[var(--admin-texto-primario)]">{barbero.nombre}</p><p className="mt-0.5 truncate text-sm text-[var(--admin-texto-muted)]">{barbero.email || "Sin email"}</p></div>
        <EstadoBarbero estado={barbero.estado} clase="ml-auto lg:hidden" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5 lg:mt-0">{nombresServicios.slice(0, 2).map((nombre) => <span key={nombre} className="rounded-md bg-[var(--admin-item)] px-2 py-1 text-xs text-[var(--admin-texto-secundario)]">{nombre}</span>)}{nombresServicios.length > 2 && <span className="rounded-md bg-[var(--admin-item)] px-2 py-1 text-xs text-[var(--admin-texto-secundario)]">+{nombresServicios.length - 2}</span>}{!nombresServicios.length && <span className="text-sm text-[var(--admin-texto-muted)]">Sin servicios</span>}</div>
      <div className="relative mt-4 text-sm lg:mt-0"><p className="text-[var(--admin-texto-primario)]">{cantidadDias ? `${cantidadDias} ${cantidadDias === 1 ? "día configurado" : "días configurados"}` : "Sin horarios"}</p><button type="button" onClick={() => establecerHorariosAbiertos((abierto) => !abierto)} className="mt-1 text-xs font-medium text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]">Ver horarios</button>{horariosAbiertos && <PanelHorarios dias={dias} horariosPorDia={horariosPorDia} />}</div>
      <EstadoBarbero estado={barbero.estado} clase="mt-4 hidden lg:flex lg:mt-0" />
      <div ref={referenciaAcciones} className="relative mt-4 flex items-center gap-1 lg:mt-0"><button type="button" onClick={() => establecerModalAbierto(true)} className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"><Pencil className="h-3.5 w-3.5" />Editar</button><button type="button" onClick={onAlternarMenu} aria-label={`Más acciones para ${barbero.nombre}`} aria-expanded={menuAbierto} aria-haspopup="menu" className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--admin-texto-muted)] hover:bg-[var(--admin-item)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"><MoreHorizontal className="h-5 w-5" /></button>{menuAbierto && <div role="menu" className="absolute right-0 top-10 z-30 w-44 rounded-lg border bg-[var(--admin-surface-elevated)] p-1 shadow-xl" style={{ borderColor: "var(--admin-border-fuerte)" }}><button type="button" role="menuitem" onClick={() => { establecerHorariosAbiertos(true); onCerrarMenu(); }} className="w-full rounded-md px-3 py-2 text-left text-sm text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item)]">Ver horarios</button>{barbero.estado && <button type="button" role="menuitem" onClick={() => { establecerConfirmarBaja(true); onCerrarMenu(); }} className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10">Dar de baja</button>}</div>}</div>
    </article>
    {modalAbierto && <EditBarberoModal barbero={barbero} servicios={servicios} diasLaborales={diasLaborales} onClose={() => establecerModalAbierto(false)} />}
    {confirmarBaja && <ConfirmDialog title="Dar de baja al barbero" message={`¿Seguro que querés dar de baja a ${barbero.nombre}? No podrá recibir nuevas reservas.`} onConfirm={darDeBaja} onCancel={() => establecerConfirmarBaja(false)} />}
  </>;
}

function EstadoBarbero({ estado, clase }: { estado: boolean; clase: string }) { return <span className={`items-center gap-1.5 text-xs font-medium ${estado ? "text-emerald-400" : "text-[var(--admin-texto-muted)]"} ${clase}`}><span className={`h-2 w-2 rounded-full ${estado ? "bg-emerald-400" : "bg-zinc-500"}`} />{estado ? "Activo" : "Inactivo"}</span>; }

function PanelHorarios({ dias, horariosPorDia }: { dias: string[]; horariosPorDia: Record<string, HorarioBarbero[]> }) { return <div className="absolute z-20 mt-2 w-64 rounded-lg border bg-[var(--admin-surface-elevated)] p-3 shadow-xl" style={{ borderColor: "var(--admin-border-fuerte)" }}><p className="mb-2 text-sm font-semibold text-[var(--admin-texto-primario)]">Disponibilidad</p>{dias.length ? dias.map((dia) => <div key={dia} className="mb-2 last:mb-0"><p className="text-xs font-medium text-[var(--admin-texto-secundario)]">{dia}</p>{horariosPorDia[dia].sort((a, b) => a.margenLaboral.desde.localeCompare(b.margenLaboral.desde)).map((horario) => <p key={horario.margenLaboralId} className="text-xs text-[var(--admin-texto-muted)]">{horario.margenLaboral.desde} — {horario.margenLaboral.hasta}</p>)}</div>) : <p className="text-xs text-[var(--admin-texto-muted)]">No disponible</p>}</div>; }
