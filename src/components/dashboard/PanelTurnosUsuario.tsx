"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "next-auth";
import { CalendarPlus } from "lucide-react";
import { getResumenTurnosUsuario, getUserTurnos } from "@/actions/sesion/listar-turnos-usuario.actions";
import CargadorModalGestionTurno from "@/components/turno/reserva/CargadorModalGestionTurno";
import DatosReservaProveedor from "@/contextos/DatosReservaProveedor";
import CalendarioMensualTurnos from "@/components/turno/gestion/CalendarioMensualTurnos";
import TurnoList from "@/components/turno/gestion/TurnoList";
import { obtenerAmbitoBaseDatosLocal } from "@/lib/ambito-base-datos-cliente";
import { ESTADOS_PAGO, ESTADOS_TURNO } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import type { ParcheTurnoCache } from "@/lib/admin/turnos-cache-local";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { invalidarDisponibilidadLocal } from "@/lib/turnos/disponibilidad-cliente";
import {
  actualizarTurnoUsuarioCacheLocal,
  guardarTurnosUsuarioCacheLocal,
} from "@/components/dashboard/turnos-usuario-cache-local";
import type { BarberoData, RelacionData, ServicioData, TurnoListado } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";

type Propiedades = {
  turnosProximosIniciales: TurnoListado[];
  turnosHistorialIniciales: TurnoListado[];
  paginaInicial: number;
  totalPaginasInicial: number;
  session: Session | null;
  initialServicios: ServicioData[];
  initialBarberos: BarberoData[];
  initialRelaciones: RelacionData[];
  whatsappPhone: string;
  datosTransferencia: DatosTransferencia;
  mostrarAvisoSeniaPendiente: boolean;
};

const CLASE_APARTADO = "min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)] sm:px-4";
const CLASE_APARTADO_SELECCIONADO = "border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] text-[var(--page-primary-foreground)]";
const CLASE_APARTADO_INACTIVO = "border-transparent text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)]";

export default function PanelTurnosUsuario({
  turnosProximosIniciales,
  turnosHistorialIniciales,
  paginaInicial,
  totalPaginasInicial,
  session,
  initialServicios,
  initialBarberos,
  initialRelaciones,
  whatsappPhone,
  datosTransferencia,
  mostrarAvisoSeniaPendiente,
}: Propiedades) {
  const [apartado, establecerApartado] = useState<"proximos" | "historial">("proximos");
  const [turnosProximos, establecerTurnosProximos] = useState(turnosProximosIniciales);
  const [turnosHistorial, establecerTurnosHistorial] = useState(turnosHistorialIniciales);
  const [fechaElegida, establecerFechaElegida] = useState(
    turnosProximosIniciales[0] ? obtenerFechaSola(turnosProximosIniciales[0].horarioReservado) : "",
  );
  const [paginaActual, establecerPaginaActual] = useState(paginaInicial);
  const [totalPaginas, establecerTotalPaginas] = useState(totalPaginasInicial);
  const [cargandoMas, establecerCargandoMas] = useState(false);
  const [errorCargaMas, establecerErrorCargaMas] = useState(false);

  useEffect(() => {
    establecerTurnosProximos(turnosProximosIniciales);
    establecerTurnosHistorial(turnosHistorialIniciales);
    establecerPaginaActual(paginaInicial);
    establecerTotalPaginas(totalPaginasInicial);
  }, [paginaInicial, totalPaginasInicial, turnosHistorialIniciales, turnosProximosIniciales]);

  const fecha = turnosProximos.some((turno) => obtenerFechaSola(turno.horarioReservado) === fechaElegida)
    ? fechaElegida
    : turnosProximos[0] ? obtenerFechaSola(turnosProximos[0].horarioReservado) : "";
  const turnosDelDia = turnosProximos.filter((turno) => obtenerFechaSola(turno.horarioReservado) === fecha);

  const refrescarTurnos = useCallback(async (idUsuario: string) => {
    const ambitoAlConsultar = obtenerAmbitoBaseDatosLocal();
    try {
      const resultado = await getResumenTurnosUsuario(idUsuario);
      if (ambitoAlConsultar !== obtenerAmbitoBaseDatosLocal()) return;
      if (!resultado.success || !resultado.data) return;

      const { historial, proximos } = resultado.data;
      establecerTurnosHistorial(historial.turnos);
      establecerPaginaActual(historial.paginaActual);
      establecerTotalPaginas(historial.totalPaginas);
      establecerTurnosProximos(proximos);
      guardarTurnosUsuarioCacheLocal(idUsuario, resultado.data);
    } catch {
      establecerErrorCargaMas(true);
    }
  }, []);

  const cargarMas = async () => {
    const idUsuario = session?.user?.id;
    if (!idUsuario || cargandoMas || paginaActual >= totalPaginas) return;

    establecerCargandoMas(true);
    establecerErrorCargaMas(false);
    const ambitoAlConsultar = obtenerAmbitoBaseDatosLocal();
    try {
      const resultado = await getUserTurnos(idUsuario, paginaActual + 1);
      if (ambitoAlConsultar !== obtenerAmbitoBaseDatosLocal()) return;
      if (!resultado.success || !resultado.data) {
        establecerErrorCargaMas(true);
        return;
      }

      const pagina = resultado.data;
      const porId = new Map(turnosHistorial.map((turno) => [turno.id, turno]));
      for (const turno of pagina.turnos) porId.set(turno.id, turno);
      const turnosHistorialActualizados = Array.from(porId.values());
      establecerTurnosHistorial(turnosHistorialActualizados);
      establecerPaginaActual(pagina.paginaActual);
      establecerTotalPaginas(pagina.totalPaginas);
      if (idUsuario) {
        guardarTurnosUsuarioCacheLocal(idUsuario, {
          historial: {
            turnos: turnosHistorialActualizados,
            paginaActual: pagina.paginaActual,
            totalPaginas: pagina.totalPaginas,
          },
          proximos: turnosProximos,
        });
      }
    } catch {
      establecerErrorCargaMas(true);
    } finally {
      establecerCargandoMas(false);
    }
  };

  const actualizarEstado = (idTurno: string, estado: TurnoListado["estado"]) => {
    const turnoActualizado = turnosProximos.find((turno) => turno.id === idTurno);
    const turnosProximosActualizados = turnosProximos.filter((turno) => turno.id !== idTurno);
    establecerTurnosProximos(turnosProximosActualizados);
    const turnosHistorialActualizados = turnoActualizado
      ? [
          {
            ...turnoActualizado,
            estado,
            estadoPago: estado === ESTADOS_TURNO[3] ? ESTADOS_PAGO[4] : turnoActualizado.estadoPago,
          },
          ...turnosHistorial.filter((turno) => turno.id !== idTurno),
        ]
      : turnosHistorial;
    if (turnoActualizado) {
      invalidarDisponibilidadLocal(turnoActualizado.barberoId, obtenerFechaSola(turnoActualizado.horarioReservado));
      establecerTurnosHistorial(turnosHistorialActualizados);
    }
    const idUsuario = session?.user?.id;
    if (!idUsuario) return;
    guardarTurnosUsuarioCacheLocal(idUsuario, {
      historial: {
        turnos: turnosHistorialActualizados,
        paginaActual,
        totalPaginas,
      },
      proximos: turnosProximosActualizados,
    });
    void refrescarTurnos(idUsuario);
  };

  const actualizarTurno = (idTurno: string, parche: ParcheTurnoCache) => {
    const aplicarParche = (turno: TurnoListado): TurnoListado =>
      turno.id === idTurno
        ? {
            ...turno,
            ...parche,
            horarioReservado: parche.horarioReservado ?? turno.horarioReservado,
          }
        : turno;

    establecerTurnosProximos((actuales) => actuales.map(aplicarParche));
    establecerTurnosHistorial((actuales) => actuales.map(aplicarParche));
    const idUsuario = session?.user?.id;
    if (idUsuario) actualizarTurnoUsuarioCacheLocal(idUsuario, idTurno, parche);
  };

  const actualizarTurnosTrasCrear = useCallback(async () => {
    const idUsuario = session?.user?.id;
    if (!idUsuario) return;

    await refrescarTurnos(idUsuario);
  }, [refrescarTurnos, session?.user?.id]);

  return (
    <div className="rounded-xl bg-[var(--admin-surface)] p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--page-separador)] pb-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Apartados de turnos">
          <button
            type="button"
            aria-pressed={apartado === "proximos"}
            onClick={() => establecerApartado("proximos")}
            className={cn(CLASE_APARTADO, apartado === "proximos" ? CLASE_APARTADO_SELECCIONADO : CLASE_APARTADO_INACTIVO)}
          >
            Próximos turnos
          </button>
          <button
            type="button"
            aria-pressed={apartado === "historial"}
            onClick={() => establecerApartado("historial")}
            className={cn(CLASE_APARTADO, apartado === "historial" ? CLASE_APARTADO_SELECCIONADO : CLASE_APARTADO_INACTIVO)}
          >
            Historial
          </button>
        </div>
        <DatosReservaProveedor
          servicios={initialServicios}
          barberos={initialBarberos}
          usuarios={[]}
          relaciones={initialRelaciones}
          whatsappPhone={whatsappPhone}
        >
          <CargadorModalGestionTurno
            session={session}
            initialServicios={initialServicios}
            initialBarberos={initialBarberos}
            initialUsuarios={[]}
            initialRelaciones={initialRelaciones}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            mostrarAvisoSeniaPendiente={mostrarAvisoSeniaPendiente}
            onTurnoCreado={actualizarTurnosTrasCrear}
            claseTrigger="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] px-4 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] transition-colors duration-150 hover:bg-[var(--page-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)] disabled:cursor-wait"
            contenidoTrigger={<><CalendarPlus className="h-4 w-4" aria-hidden="true" />Pedir un turno</>}
          />
        </DatosReservaProveedor>
      </div>

      {apartado === "proximos" ? (
        <section aria-label="Próximos turnos">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[var(--admin-texto-primario)]">Tus próximos turnos</h2>
            <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">Seleccioná un día para ver sus reservas.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(250px,2fr)_minmax(0,3fr)]">
            <CalendarioMensualTurnos
              fecha={fecha}
              barberoId=""
              turnos={turnosProximos}
              cargandoTurnos={false}
              onSeleccionar={establecerFechaElegida}
            />
            <div className="min-w-0">
              <TurnoList
                turnos={turnosDelDia}
                session={session}
                onEstadoActualizado={actualizarEstado}
                onTurnoActualizado={actualizarTurno}
                whatsappPhone={whatsappPhone}
                datosTransferencia={datosTransferencia}
                mostrarAvisoSeniaPendiente={mostrarAvisoSeniaPendiente}
                modoCronologicoCompacto
                mensajeVacio={turnosProximos.length === 0 ? "No tenés próximos turnos." : "No hay turnos para este día."}
              />
            </div>
          </div>
        </section>
      ) : (
        <section aria-label="Historial de turnos">
          <h2 className="mb-4 text-xl font-semibold text-[var(--admin-texto-primario)]">Historial de turnos</h2>
          <TurnoList
            turnos={turnosHistorial}
            session={session}
            cargandoMas={cargandoMas}
            tieneMas={paginaActual < totalPaginas}
            errorCargaMas={errorCargaMas}
            onCargarMas={cargarMas}
            whatsappPhone={whatsappPhone}
            datosTransferencia={datosTransferencia}
            mostrarAvisoSeniaPendiente={mostrarAvisoSeniaPendiente}
            mostrarFechas
            mensajeVacio="Todavía no tenés turnos en tu historial."
          />
        </section>
      )}
    </div>
  );
}
