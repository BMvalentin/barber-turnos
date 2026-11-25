// app/admin/turno/page.tsx
import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { obtenerBarberoPropioParaAgenda, obtenerBarberosFiltroTurnos } from "@/lib/consultas/obtener-barberos-filtro-turnos";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";
import { obtenerDatosTransferencia } from "@/lib/pagos/obtener-datos-transferencia";
import { obtenerConfiguracionPush } from "@/lib/notificaciones/configuracion-push";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { redirect } from "next/navigation";

export default async function AdminTurnoPage({ searchParams }: {
  searchParams: Promise<{ agenda?: string | string[] }>;
}) {
  const [contexto, { agenda }] = await Promise.all([requerirPanel(), searchParams]);
  if (!contexto) redirect("/dashboard");
  const session = contexto.session;
  const esEmpleado = contexto.rol === "EMPLEADO";
  const agendaInicial = agenda === "personal" || (agenda === "equipo" && !esEmpleado) ? agenda : undefined;
  const fechaInicial = obtenerFechaSola(new Date());
  const [barberosFiltro, perfilPropio, config] = await Promise.all([
    esEmpleado ? [] : obtenerBarberosFiltroTurnos(),
    !esEmpleado && agendaInicial === "personal" && contexto.barberoId
      ? obtenerBarberoPropioParaAgenda(contexto.barberoId)
      : null,
    obtenerConfigCacheada(),
  ]);
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
      barberosFiltro={opcionesBarberos}
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
