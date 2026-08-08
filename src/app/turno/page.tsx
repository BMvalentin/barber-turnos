// app/admin/turnos/page.tsx
import { getTurnos } from "@/actions/turno.actions";
import TurnoList from "@/components/turno/TurnoList";
import CreateTurnoModal from "@/components/turno/CreateTurnoModal";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TurnoManager from "@/components/turno/TurnoManager";

async function getTurnoData() {
  const [servicios, barberos, usuarios, relaciones, config] = await Promise.all([
    prisma.servicio.findMany({ where: { estado: true }, orderBy: { nombre: "asc" } }),
    prisma.barbero.findMany({ where: { estado: true }, orderBy: { nombre: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.servicioxbarbero.findMany({ select: { barberoId: true, servicioId: true } }),
    prisma.pageConfig.findUnique({ where: { id: 1 } }),
  ]);

  const serializedServicios = servicios.map((s) => ({
    ...s,
    precio: s.precio ? Number(s.precio) : 0,
    descuento: s.descuento ? Number(s.descuento) : 0,
    senia: s.senia ? Number(s.senia) : 0,
  }));

  return { servicios: serializedServicios, barberos, usuarios, relaciones, config };
}

export default async function TurnoPage() {
  const session = await auth();
  const { servicios, barberos, usuarios, relaciones, config } = await getTurnoData();
  const result = await getTurnos(1);

  const turnosData = (result.success && result.data) ? result.data : [];

  return (
    <div
      className="min-h-screen w-full p-2 sm:p-6 pt-24 md:pt-24 overflow-x-hidden"
      style={{
        background: `linear-gradient(to bottom right, #000000, var(--page-secondary-30))`,
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--page-primary-tinta)" }}
              >
                Gestión de Turnos
              </h1>
            </div>

            <CreateTurnoModal
              session={session}
              initialServicios={servicios}
              initialBarberos={barberos}
              initialUsuarios={usuarios}
              initialRelaciones={relaciones}
              whatsappPhone={config?.whatsapp || ""}
            />
          </div>

          {session?.user?.role === "ADMIN" ? (
            <TurnoManager
              initialTurnos={turnosData}
              session={session}
            />
          ) : (
            <TurnoList
              session={session}
              turnos={turnosData}
              totalPages={1}
              currentPage={1}
            />
          )}
        </div>
      </div>
    </div>
  );
}