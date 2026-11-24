"use client";

import { useId, useState, useTransition } from "react";
import { ChevronDown, Pencil, UserRound, UserRoundX } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteBarbero } from "@/actions/barberos/eliminar.actions";
import EditBarberoModal from "./EditBarberoModal";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import { obtenerNombreProfesional } from "@/lib/barberos/nombre-profesional";
import type { BarberoListado, DiaLaboral, ServicioOpcion } from "@/types/barbero";
import { formatearNombreDia, obtenerHorariosPorDia } from "./horarios-barbero";

type PropiedadesFilaBarbero = {
  barbero: BarberoListado;
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
};

export default function BarberoFila({ barbero, servicios, diasLaborales }: PropiedadesFilaBarbero) {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const [expandido, establecerExpandido] = useState(false);
  const [confirmarBaja, establecerConfirmarBaja] = useState(false);
  const [dandoDeBaja, iniciarTransicion] = useTransition();
  const router = useRouter();
  const idDetalles = useId();
  const horarios = obtenerHorariosPorDia(barbero.horarios);
  const serviciosAsignados = barbero.servicios ?? [];
  const cantidadDias = horarios.length;
  const cantidadServicios = serviciosAsignados.length;
  const nombre = obtenerNombreProfesional(barbero.nombre) ?? "Perfil por completar";
  const resumenHorarios = cantidadDias ? `${cantidadDias} ${cantidadDias === 1 ? "día" : "días"}` : "Sin horarios";

  const darDeBaja = () => iniciarTransicion(async () => {
    const datos = new FormData();
    datos.set("id", barbero.id);
    await deleteBarbero(datos);
    establecerConfirmarBaja(false);
    router.refresh();
  });

  return (
    <li className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)_minmax(0,0.8fr)_auto] lg:gap-x-4 lg:rounded-none lg:border-0 lg:border-t lg:bg-transparent lg:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[var(--admin-item)] text-[var(--admin-texto-muted)]">
          <UserRound aria-hidden="true" className="size-5" />
          {barbero.srcImage && (
            <Image src={barbero.srcImage} alt="" width={44} height={44} className="absolute inset-0 size-full object-cover" onError={(evento) => { evento.currentTarget.hidden = true; }} />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="font-semibold [overflow-wrap:anywhere]">{nombre}</h3>
            <span className={`admin-distintivo ${barbero.estado ? "bg-[var(--admin-exito-suave)] text-[var(--admin-exito)]" : "bg-[var(--admin-item)] text-[var(--admin-texto-muted)]"}`}>
              {barbero.estado ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)] lg:hidden">{cantidadServicios} {cantidadServicios === 1 ? "servicio" : "servicios"} · {resumenHorarios}</p>
          <p className="mt-1 hidden text-xs text-[var(--admin-texto-muted)] [overflow-wrap:anywhere] lg:block">{barbero.usuario?.email ?? "Sin cuenta asociada"}</p>
        </div>
      </div>

      <p className="hidden text-sm text-[var(--admin-texto-secundario)] lg:block">
        {cantidadServicios ? `${cantidadServicios} ${cantidadServicios === 1 ? "servicio" : "servicios"}` : "Sin servicios"}
        <span className="mt-1 block text-xs text-[var(--admin-texto-muted)]">{resumenHorarios}</span>
      </p>

      <button
        type="button"
        aria-label={`${expandido ? "Ocultar" : "Ver"} detalles de ${nombre}`}
        aria-expanded={expandido}
        aria-controls={`${idDetalles} ${idDetalles}-acciones`}
        onClick={() => establecerExpandido((actual) => !actual)}
        className="flex size-11 shrink-0 items-center justify-center gap-2 rounded-xl text-[var(--admin-acento-suave-texto)] hover:bg-[var(--admin-item)] lg:min-h-10 lg:w-fit lg:justify-start lg:px-2"
      >
        <span className="hidden text-sm font-medium lg:inline">{expandido ? "Ocultar detalles" : "Ver detalles"}</span>
        <ChevronDown aria-hidden="true" className={`size-5 shrink-0 motion-safe:transition-transform lg:size-4 ${expandido ? "rotate-180" : ""}`} />
      </button>

      <div id={`${idDetalles}-acciones`} className={`${expandido ? "flex" : "hidden"} col-span-full mt-3 flex-wrap items-center gap-2 border-t border-[var(--admin-border)] pt-3 lg:col-span-1 lg:mt-0 lg:flex lg:flex-nowrap lg:justify-end lg:border-0 lg:pt-0`}>
        <button type="button" onClick={() => establecerModalAbierto(true)} className="admin-control">
          <Pencil aria-hidden="true" className="size-4" /> Editar
        </button>
        {barbero.estado && (
          <button
            type="button"
            onClick={() => establecerConfirmarBaja(true)}
            disabled={dandoDeBaja}
            aria-label={`Dar de baja a ${nombre}`}
            title="Dar de baja"
            className="admin-control text-[var(--admin-error)]"
          >
            <UserRoundX aria-hidden="true" className="size-4" />
            <span className="lg:sr-only">Dar de baja</span>
          </button>
        )}
      </div>

      <div id={idDetalles} hidden={!expandido} className="col-span-full mt-3 border-t border-[var(--admin-border)] pt-3 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="lg:hidden">
              <p className="text-xs text-[var(--admin-texto-muted)]">Correo</p>
              <p className="mt-1 [overflow-wrap:anywhere]">{barbero.usuario?.email ?? "Sin cuenta asociada"}</p>
            </div>
            <div>
              <p className="font-semibold">Servicios asignados</p>
              {cantidadServicios ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {serviciosAsignados.map(({ servicio }) => (
                    <li key={servicio.id} className="max-w-full rounded-lg bg-[var(--admin-item)] px-2.5 py-1 text-xs text-[var(--admin-texto-secundario)] [overflow-wrap:anywhere]">{servicio.nombre}</li>
                  ))}
                </ul>
              ) : <p className="mt-1 text-[var(--admin-texto-muted)]">Sin servicios asignados.</p>}
            </div>
          </div>

          <div>
            <p className="font-semibold">Horarios</p>
            {horarios.length ? (
              <dl className="mt-1 divide-y divide-[var(--admin-border)]">
                {horarios.map(([dia, rangos]) => (
                  <div key={dia} className="flex flex-wrap justify-between gap-x-2 gap-y-1 py-2">
                    <dt>{formatearNombreDia(dia)}</dt>
                    <dd className="text-[var(--admin-texto-muted)] tabular-nums">
                      {rangos.map(({ margenLaboral, margenLaboralId }) => <p key={margenLaboralId}>{margenLaboral.desde}–{margenLaboral.hasta}</p>)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : <p className="mt-1 text-[var(--admin-texto-muted)]">Sin horarios configurados.</p>}
          </div>
        </div>
      </div>

      {modalAbierto && <EditBarberoModal barbero={barbero} servicios={servicios} diasLaborales={diasLaborales} onClose={() => establecerModalAbierto(false)} />}
      {confirmarBaja && <ConfirmDialog title="Dar de baja al barbero" message={`¿Seguro que querés dar de baja a ${nombre}? No podrá recibir nuevas reservas.`} onConfirm={darDeBaja} onCancel={() => establecerConfirmarBaja(false)} />}
    </li>
  );
}
