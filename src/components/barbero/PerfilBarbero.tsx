"use client";

import Image from "next/image";
import { useState } from "react";
import { Clock3, Mail, Pencil, Scissors, UserRound } from "lucide-react";
import EditBarberoModal from "@/components/barbero/EditBarberoModal";
import type { BarberoListado, DiaLaboral, ServicioOpcion } from "@/types/barbero";
import { DIAS_SEMANA_DB } from "@/lib/constants";

type Props = {
  barbero: BarberoListado;
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
  esEmpleado?: boolean;
  perfilPropio?: boolean;
};

type Horario = NonNullable<BarberoListado["horarios"]>[number];

function obtenerHorariosPorDia(horarios: Horario[] = []) {
  const porDia = new Map<string, string[]>();

  for (const horario of horarios) {
    const rangos = porDia.get(horario.dia.dia) ?? [];
    rangos.push(`${horario.margenLaboral.desde} — ${horario.margenLaboral.hasta}`);
    porDia.set(horario.dia.dia, rangos);
  }

  const indiceDia = (dia: string) => {
    const indice = DIAS_SEMANA_DB.findIndex((diaSemana) => diaSemana === dia);
    return indice === -1 ? Number.MAX_SAFE_INTEGER : indice;
  };

  return [...porDia.entries()].sort(([diaA], [diaB]) => indiceDia(diaA) - indiceDia(diaB));
}

function nombreDia(dia: string) {
  return dia === "Miercoles" ? "Miércoles" : dia === "Sabado" ? "Sábado" : dia;
}

export default function PerfilBarbero({ barbero, servicios, diasLaborales, esEmpleado = false, perfilPropio = false }: Props) {
  const [modalAbierto, establecerModalAbierto] = useState(false);
  const horarios = obtenerHorariosPorDia(barbero.horarios);
  const nombre = barbero.nombre?.trim() || "Sin nombre";

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {barbero.srcImage ? (
                <Image
                  src={barbero.srcImage}
                  alt={`Foto de ${nombre}`}
                  width={88}
                  height={88}
                  className="h-[88px] w-[88px] shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-[var(--page-primary-20)] text-[var(--page-primary-tinta)]">
                  <UserRound className="h-9 w-9" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xl font-semibold text-[var(--admin-texto-primario)]">{nombre}</p>
                <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-[var(--admin-texto-muted)]">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {barbero.usuario?.email ?? "Sin cuenta asociada"}
                </p>
                <p className={`mt-3 text-xs font-medium ${barbero.estado ? "text-emerald-400" : "text-[var(--admin-texto-muted)]"}`}>
                  <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${barbero.estado ? "bg-emerald-400" : "bg-zinc-500"}`} />
                  {barbero.estado ? "Perfil activo" : "Perfil inactivo"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => establecerModalAbierto(true)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border-fuerte)] px-3 text-sm font-medium text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar mi perfil
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
            <Scissors className="h-4 w-4 text-[var(--page-primary-tinta)]" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-[var(--admin-texto-primario)]">{esEmpleado ? "Servicios asignados" : "Servicios que ofrecés"}</h2>
          </div>
          {barbero.servicios?.length ? (
            <div className="flex flex-wrap gap-2">
              {barbero.servicios.map(({ servicio }) => (
                <span key={servicio.id} className="rounded-lg bg-[var(--admin-item)] px-3 py-2 text-sm text-[var(--admin-texto-secundario)]">
                  {servicio.nombre}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--admin-texto-muted)]">Todavía no tenés servicios asignados.</p>
          )}
        </section>

        <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
            <Clock3 className="h-4 w-4 text-[var(--page-primary-tinta)]" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--admin-texto-primario)]">Tu disponibilidad</h2>
              <p className="mt-0.5 text-xs text-[var(--admin-texto-muted)]">{esEmpleado ? "Los horarios los administra un administrador." : "Administrá los horarios desde “Horarios”."}</p>
            </div>
          </div>
          {horarios.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {horarios.map(([dia, rangos]) => (
                <div key={dia} className="rounded-lg bg-[var(--admin-item)] px-3 py-2.5">
                  <p className="text-sm font-medium text-[var(--admin-texto-primario)]">{nombreDia(dia)}</p>
                  <div className="mt-1 space-y-0.5">
                    {rangos.map((rango) => <p key={rango} className="text-xs text-[var(--admin-texto-muted)]">{rango}</p>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--admin-texto-muted)]">Todavía no configuraste tu disponibilidad.</p>
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
