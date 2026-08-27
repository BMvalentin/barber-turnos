// app/admin/turnos/page.tsx
import { getTurnos } from "@/actions/turnos/listar.actions";
import ModalReservaTurno from "@/components/turno/reserva/ModalReservaTurno";
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
    <div className="min-h-screen w-full p-2 sm:p-6 pt-24 md:pt-24 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-texto-primario)] md:text-[28px]">Gestión de Turnos</h1>
              <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">Administrá y organizá todos los turnos de tu barbería.</p>
            </div>
            <ModalReservaTurno
              session={session}
              initialServicios={servicios}
              initialBarberos={barberos}
              initialUsuarios={usuarios}
              initialRelaciones={relaciones}
              whatsappPhone={config?.whatsapp || ""}
            />
          </div>
          <TurnoManager turnosIniciales={turnosData} totalPaginasInicial={totalPaginasInicial} session={session} />
        </div>
      </div>
    </div>
  );
}
