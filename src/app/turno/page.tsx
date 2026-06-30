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
      select: { id: true, nombre: true, descripcion: true, precio: true, duracion: true, descuento: true, senia: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.barbero.findMany({
      where: { estado: true },
      select: { id: true, nombre: true, srcImage: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

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

// Corregido: Agregamos searchParams para leer la página de la URL
export default async function TurnoPage({ searchParams }: { searchParams: { page?: string } }) {
  
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const session = await auth();
  
  // Corregido: Ahora pasamos el número de página a getTurnos
  const result = (session?.user) 
    ? (session?.user.role === "ADMIN" 
        ? await getTurnos(page) 
        : { success: true, data: await getUserTurnos(session.user.id as string), totalPages: 1, currentPage: 1 }) 
    : { success: false, error: "Usuario no autenticado" };

  const { servicios, barberos, usuarios } = await getTurnoData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-amber-950/30 p-6">
      <div className="container mx-auto max-w-7xl mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="p-2 hover:bg-amber-600/20 rounded-lg transition-all group">
                <ArrowLeft className="h-6 w-6 text-amber-500" />
              </Link>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Turnos</h1>
              <p className="text-amber-200/70">Administra las reservas de turnos</p>
            </div>
            <CreateTurnoModal
              session={session}
              initialServicios={servicios}
              initialBarberos={barberos}
              initialUsuarios={usuarios}
            />
          </div>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          {/* Corregido: Accedemos de forma segura a result.totalPages y result.currentPage */}
          {result.success && result.data ? (
            <TurnoList 
              session={session} 
              turnos={result.data} 
              totalPages={result.totalPages || 1} 
              currentPage={page} 
            />
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
              <p className="text-amber-400">{result.error || "Error al cargar"}</p>
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
        <div key={i} className="border border-amber-900/30 bg-black/40 rounded-lg p-4 animate-pulse h-40"></div>
      ))}
    </div>
  );
}