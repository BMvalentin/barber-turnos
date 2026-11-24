"use client";

import Image from "next/image";
import { useState } from "react";
import { Clock3, Mail, Pencil, Scissors, UserRound } from "lucide-react";
import { obtenerNombreProfesional } from "@/lib/barberos/nombre-profesional";
import EditBarberoModal from "./EditBarberoModal";
import { formatearNombreDia, obtenerHorariosPorDia } from "./horarios-barbero";
import type { BarberoListado, DiaLaboral, ServicioOpcion } from "@/types/barbero";

type Props = {
  barbero: BarberoListado;
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
  esEmpleado?: boolean;
  perfilPropio?: boolean;
};

export default function PerfilBarbero({ barbero, servicios, diasLaborales, esEmpleado = false, perfilPropio = false }: Props) {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const horarios = obtenerHorariosPorDia(barbero.horarios);
  const nombre = obtenerNombreProfesional(barbero.nombre) ?? "Perfil por completar";

  return (
    <>
      <section className="admin-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-label="Datos del perfil">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[var(--page-primary-soft)] text-[var(--admin-acento-suave-texto)] sm:size-16">
            <UserRound className="size-6" aria-hidden="true" />
            {barbero.srcImage && (
              <Image src={barbero.srcImage} alt="" width={64} height={64} className="absolute inset-0 size-full object-cover" onError={(evento) => { evento.currentTarget.hidden = true; }} />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">{nombre}</h2>
              <span className={`admin-distintivo ${barbero.estado ? "bg-[var(--admin-exito-suave)] text-[var(--admin-exito)]" : "bg-[var(--admin-item)] text-[var(--admin-texto-muted)]"}`}>
                {barbero.estado ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--admin-texto-muted)] [overflow-wrap:anywhere]">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{barbero.usuario?.email ?? "Sin cuenta asociada"}</span>
            </p>
          </div>
        </div>
        <button type="button" onClick={() => establecerModalAbierto(true)} className="admin-accion shrink-0">
          <Pencil aria-hidden="true" className="size-4" /> Editar mi perfil
        </button>
      </section>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="admin-card space-y-3 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Scissors aria-hidden="true" className="size-4 text-[var(--page-primary-tinta)]" />
            {esEmpleado ? "Servicios asignados" : "Servicios que ofrecés"}
          </h2>
          {barbero.servicios?.length ? (
            <ul className="flex flex-wrap gap-2">
              {barbero.servicios.map(({ servicio }) => (
                <li key={servicio.id} className="max-w-full rounded-lg bg-[var(--admin-item)] px-3 py-2 text-sm text-[var(--admin-texto-secundario)] [overflow-wrap:anywhere]">
                  {servicio.nombre}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--admin-texto-muted)]">Todavía no tenés servicios asignados.</p>
          )}
        </section>

        <section className="admin-card">
          <header className="space-y-1 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Clock3 aria-hidden="true" className="size-4 text-[var(--page-primary-tinta)]" />
              Tu disponibilidad
            </h2>
            <p className="text-sm text-[var(--admin-texto-muted)]">
              {esEmpleado ? "Los horarios los gestiona un administrador." : "Administrá los horarios desde «Horarios»."}
            </p>
          </header>
          {horarios.length ? (
            <dl className="divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)]">
              {horarios.map(([dia, rangos]) => (
                <div key={dia} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-5">
                  <dt className="font-medium">{formatearNombreDia(dia)}</dt>
                  <dd className="flex flex-wrap gap-x-3 gap-y-1 text-[var(--admin-texto-muted)] tabular-nums">
                    {rangos.map(({ margenLaboral, margenLaboralId }) => (
                      <span key={margenLaboralId} className="whitespace-nowrap">{margenLaboral.desde}–{margenLaboral.hasta}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="border-t border-[var(--admin-border)] p-4 text-sm text-[var(--admin-texto-muted)] sm:px-5">Todavía no configuraste tu disponibilidad.</p>
          )}
        </section>
      </div>

      {modalAbierto && (
        <EditBarberoModal
          barbero={barbero}
          servicios={servicios}
          diasLaborales={diasLaborales}
          soloEdicionPropia={esEmpleado}
          perfilPropio={perfilPropio || esEmpleado}
          onClose={() => establecerModalAbierto(false)}
        />
      )}
    </>
  );
}
