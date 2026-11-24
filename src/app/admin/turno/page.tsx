// app/admin/turno/page.tsx
import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { obtenerBarberosFiltroTurnos } from "@/lib/consultas/obtener-barberos-filtro-turnos";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { serializarServiciosReserva } from "@/lib/serializar-servicios-reserva";
import { obtenerDatosTransferencia } from "@/lib/pagos/obtener-datos-transferencia";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";
import { redirect } from "next/navigation";

async function getTurnoData(barberoId: string | null, incluirUsuarios: boolean) {
  const { servicios, barberos: todosBarberos, usuarios: todosUsuarios, relaciones: todasRelaciones, config } = await obtenerDatosReserva(incluirUsuarios);
  const barberos = barberoId ? todosBarberos.filter((barbero) => barbero.id === barberoId) : todosBarberos;
  const relaciones = barberoId ? todasRelaciones.filter((relacion) => relacion.barberoId === barberoId) : todasRelaciones;
  const usuarios = incluirUsuarios ? todosUsuarios : [];
  const serviciosVisibles = barberoId
    ? servicios.filter((servicio) => relaciones.some((relacion) => relacion.servicioId === servicio.id))
    : servicios;
  const barberosFiltro = !barberoId
    ? await obtenerBarberosFiltroTurnos()
    : barberos;

  return { servicios: serializarServiciosReserva(serviciosVisibles), barberos, barberosFiltro, usuarios, relaciones, config };
}

export default async function AdminTurnoPage({ searchParams }: {
  searchParams: Promise<{ agenda?: string | string[] }>;
}) {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");
  const session = contexto.session;
  const esEmpleado = contexto.rol === "EMPLEADO";
  const { agenda } = await searchParams;
  const agendaInicial = agenda === "personal" || (agenda === "equipo" && !esEmpleado) ? agenda : undefined;
  const barberoIdInicial = contexto.barberoId ?? "";
  const fechaInicial = obtenerFechaSola(new Date());
  const datosTurno = await getTurnoData(esEmpleado ? contexto.barberoId : null, false);
  const { servicios, barberos, barberosFiltro, usuarios, relaciones, config } = datosTurno;

  return (
    <TurnoManager
      key={agendaInicial}
      turnosIniciales={[]}
      cargarTurnosAlMontar
      session={session}
      initialServicios={servicios}
      initialBarberos={barberos}
      barberosFiltro={barberosFiltro}
      initialUsuarios={usuarios}
      initialRelaciones={relaciones}
      mostrarFiltroBarbero={!esEmpleado}
      barberoIdInicial={barberoIdInicial}
      agendaInicial={agendaInicial}
      fechaInicial={fechaInicial}
      vistaAgendaCompleta
      whatsappPhone={config?.whatsapp || ""}
      datosTransferencia={obtenerDatosTransferencia(config)}
    />
  );
}
