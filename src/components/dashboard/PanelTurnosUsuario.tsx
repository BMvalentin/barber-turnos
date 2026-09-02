"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import { getUserTurnos } from "@/actions/sesion/listar-turnos-usuario.actions";
import TurnoList from "@/components/turno/gestion/TurnoList";
import type { TurnoListado } from "@/types/turno";

type Propiedades = {
  turnosIniciales: TurnoListado[];
  paginaInicial: number;
  totalPaginasInicial: number;
  session: Session | null;
};

export default function PanelTurnosUsuario({
  turnosIniciales,
  paginaInicial,
  totalPaginasInicial,
  session,
}: Propiedades) {
  const [turnos, establecerTurnos] = useState(turnosIniciales);
  const [paginaActual, establecerPaginaActual] = useState(paginaInicial);
  const [cargandoMas, establecerCargandoMas] = useState(false);
  const [errorCargaMas, establecerErrorCargaMas] = useState(false);

  const cargarMas = async () => {
    const idUsuario = session?.user?.id;
    if (!idUsuario || cargandoMas || paginaActual >= totalPaginasInicial) return;

    establecerCargandoMas(true);
    establecerErrorCargaMas(false);
    const resultado = await getUserTurnos(idUsuario, paginaActual + 1);
    establecerCargandoMas(false);

    if (!resultado.success || !resultado.data) {
      establecerErrorCargaMas(true);
      return;
    }

    const pagina = resultado.data;
    establecerTurnos((actuales) => {
      const porId = new Map(actuales.map((turno) => [turno.id, turno]));
      for (const turno of pagina.turnos) porId.set(turno.id, turno);
      return Array.from(porId.values());
    });
    establecerPaginaActual(pagina.paginaActual);
  };

  return (
    <div className="min-h-[500px] rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-2xl md:p-8">
      <div className="mb-6 border-b border-[var(--admin-border)] pb-6">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--admin-texto-primario)]">Historial de <span className="text-[var(--page-primary-tinta)]">Turnos</span></h2>
      </div>
      <TurnoList
        turnos={turnos}
        session={session}
        cargandoMas={cargandoMas}
        tieneMas={paginaActual < totalPaginasInicial}
        errorCargaMas={errorCargaMas}
        onCargarMas={cargarMas}
      />
    </div>
  );
}
