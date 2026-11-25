// app/admin/turno/page.tsx
import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { obtenerBarberosFiltroTurnos } from "@/lib/consultas/obtener-barberos-filtro-turnos";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { obtenerDatosTransferencia } from "@/lib/pagos/obtener-datos-transferencia";
import { obtenerConfiguracionPush } from "@/lib/notificaciones/configuracion-push";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { redirect } from "next/navigation";

async function obtenerCatalogoAgenda(soloBarbero: string | undefined) {
  if (soloBarbero === undefined) {
    const [catalogo, barberosFiltro] = await Promise.all([
      obtenerDatosReserva(),
      obtenerBarberosFiltroTurnos(),
    ]);
    return { ...catalogo, barberosFiltro };
  }

  const catalogo = await obtenerDatosReserva();
  const barberos = catalogo.barberos.filter((barbero) => barbero.id === soloBarbero);
  const relaciones = catalogo.relaciones.filter((relacion) => relacion.barberoId === soloBarbero);
  const serviciosAsignados = new Set(relaciones.map((relacion) => relacion.servicioId));
  return {
    servicios: catalogo.servicios.filter((servicio) => serviciosAsignados.has(servicio.id)),
    barberos,
    barberosFiltro: barberos,
    relaciones,
  };
}

export default async function AdminTurnoPage({ searchParams }: {
  searchParams: Promise<{ agenda?: string | string[] }>;
}) {
  const [contexto, { agenda }] = await Promise.all([requerirPanel(), searchParams]);
  if (!contexto) redirect("/dashboard");
  const session = contexto.session;
  const esEmpleado = contexto.rol === "EMPLEADO";
  const agendaInicial = agenda === "personal" || (agenda === "equipo" && !esEmpleado) ? agenda : undefined;
  const fechaInicial = obtenerFechaSola(new Date());
  const [{ servicios, barberos, barberosFiltro, relaciones }, config] = await Promise.all([
    obtenerCatalogoAgenda(esEmpleado ? contexto.barberoId ?? "" : undefined),
    obtenerConfigCacheada(),
  ]);
  const perfilPropio = !esEmpleado && agendaInicial === "personal"
    ? barberos.find(({ id }) => id === contexto.barberoId)
    : undefined;
  const barberoIdInicial = esEmpleado
    ? contexto.barberoId ?? ""
    : perfilPropio?.id ?? "";
  const opcionesBarberos = perfilPropio
    ? [perfilPropio, ...barberosFiltro.filter(({ id }) => id !== perfilPropio.id)]
    : barberosFiltro;

  return (
    <TurnoManager
      key={`${session.user.id}|${contexto.rol}|${contexto.barberoId ?? ""}|${agendaInicial ?? ""}`}
      session={session}
      initialServicios={servicios}
      initialBarberos={barberos}
      barberosFiltro={opcionesBarberos}
      initialRelaciones={relaciones}
      mostrarFiltroBarbero={!esEmpleado}
      barberoIdInicial={barberoIdInicial}
      agendaInicial={agendaInicial}
      fechaInicial={fechaInicial}
      clavePublicaPush={contexto.barberoId ? obtenerConfiguracionPush()?.publicKey : undefined}
      whatsappPhone={config?.whatsapp || ""}
      datosTransferencia={obtenerDatosTransferencia(config)}
    />
  );
}
