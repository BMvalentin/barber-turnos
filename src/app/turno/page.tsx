import { getTurnos } from "@/actions/turno.actions";
import TurnoList from "@/components/turno/TurnoList";
import CreateTurnoModal from "@/components/turno/CreateTrunoModal";
import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserTurnos } from "@/actions/user-dashboard";

async function getTurnoData() {
  const [servicios, barberos, usuarios] = await Promise.all([
    prisma.servicio.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio: true,
        duracion: true,
        descuento: true,
        senia: true,
      },
      orderBy: { nombre: "asc" },
    }),

    prisma.barbero.findMany({ // No es necesario serializar aquí, ya que no hay campos Decimal
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
        srcImage: true,
      },
      orderBy: { nombre: "asc" },
    }),

    prisma.user.findMany({ // No es necesario serializar aquí, ya que no hay campos Decimal
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serializar los campos Decimal a Number antes de pasarlos a los componentes cliente
  const serializedServicios = servicios.map(s => ({
    id: s.id,
    nombre: s.nombre,
    descripcion: s.descripcion,
    duracion: s.duracion,
    precio: Number(s.precio),
    descuento: s.descuento !== null ? Number(s.descuento) : null,
    senia: s.senia !== null ? Number(s.senia) : null,
  }));

  return { servicios: serializedServicios, barberos, usuarios };
}

export default async function TurnoPage() {
  const session = await auth();
  const result = (session?.user) ? (session?.user.role === "ADMIN" ? await getTurnos() : { success: true, data: await getUserTurnos(session.user.id as string) }) : { success: false, error: "Usuario no autenticado" };
  const { servicios, barberos, usuarios } = await getTurnoData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-amber-950/30 p-6">
      <div className="container mx-auto max-w-7xl mt-20">
        
        {/* Header con flecha y botón */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Flecha de regreso - solo para ADMIN */}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="p-2 hover:bg-amber-600/20 rounded-lg transition-all group"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="h-6 w-6 text-amber-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all" />
              </Link>
            )}
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Título */}
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Turnos</h1>
                <p className="text-amber-200/70">
                  Administra las reservas de turnos para tus servicios
                </p>
              </div>
              {/* Botón Nuevo Turno */}
              <CreateTurnoModal
                session={session}
                initialServicios={servicios}
                initialBarberos={barberos}
                initialUsuarios={usuarios}
              />
            </div>
          </div>

        </div>

        {/* Lista de turnos */}
        <Suspense fallback={<LoadingSkeleton />}>
          {result.success && result.data && Array.isArray(result.data) ? (
            <TurnoList session={session} turnos={result.data} />
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-amber-400">
                {result.error || "Error al cargar los turnos"}
              </p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-amber-900/30 bg-black/40 backdrop-blur-sm rounded-lg p-4 animate-pulse">
          <div className="h-40 bg-amber-950/20 rounded mb-4"></div>
          <div className="h-4 bg-amber-950/20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-amber-950/20 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}