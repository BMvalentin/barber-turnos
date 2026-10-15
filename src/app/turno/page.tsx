import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { serializarServiciosReserva } from "@/lib/serializar-servicios-reserva";
import { obtenerDatosTransferencia } from "@/lib/pagos/obtener-datos-transferencia";
import { redirect } from "next/navigation";

async function getTurnoData() {
  const { servicios, barberos, usuarios, relaciones, config } = await obtenerDatosReserva(false);

  return { servicios: serializarServiciosReserva(servicios), barberos, usuarios, relaciones, config };
}

export default async function TurnoPage() {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");
  const contextoPanel = await requerirPanel();
  if (contextoPanel) redirect("/admin/turno");

  const { servicios, barberos, usuarios, relaciones, config } = await getTurnoData();

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-x-clip p-2 pt-24 sm:p-6 sm:pt-24">
      <div className="container mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <TurnoManager
          turnosIniciales={[]}
          totalPaginasInicial={1}
          cargarTurnosAlMontar
          session={session}
          initialServicios={servicios}
          initialBarberos={barberos}
          initialUsuarios={usuarios}
          initialRelaciones={relaciones}
          whatsappPhone={config?.whatsapp || ""}
          datosTransferencia={obtenerDatosTransferencia(config)}
        />
      </div>
    </div>
  );
}
