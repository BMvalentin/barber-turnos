// app/turno/page.tsx
import { getTurnos } from "@/actions/turnos/listar.actions";
import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";

async function getTurnoData() {
  const { servicios, barberos, usuarios, relaciones, config } = await obtenerDatosReserva(true);

  const serializedServicios = servicios.map((s) => ({
    ...s,
    precio: s.precio ? Number(s.precio) : 0,
    descuento: s.descuento ? Number(s.descuento) : 0,
    senia: s.senia ? Number(s.senia) : 0,
  }));

  return { servicios: serializedServicios, barberos, usuarios, relaciones, config };
}

export default async function TurnoPage() {
  const session = await requerirSesion();
  const { servicios, barberos, usuarios, relaciones, config } = await getTurnoData();
  const result = await getTurnos(1, "PENDIENTE");

  const turnosData = (result.success && result.data) ? result.data : [];
  const totalPaginasInicial = result.success && result.totalPages ? result.totalPages : 1;

  return (
    <div className="min-h-screen w-full p-2 sm:p-6 pt-24 md:pt-24 overflow-x-clip">
      <div className="container mx-auto max-w-7xl">
        <TurnoManager
          turnosIniciales={turnosData}
          totalPaginasInicial={totalPaginasInicial}
          session={session}
          initialServicios={servicios}
          initialBarberos={barberos}
          initialUsuarios={usuarios}
          initialRelaciones={relaciones}
          whatsappPhone={config?.whatsapp || ""}
        />
      </div>
    </div>
  );
}
