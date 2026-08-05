import { prisma } from "@/lib/prisma";

import BarberoList from "@/components/barbero/BarberoList";
import CreateBarberoModal from "@/components/barbero/CreateBarberoModal";

async function getData() {
  const [servicios, diasLaborales, barberos] = await Promise.all([
    prisma.servicio.findMany({
      where: { estado: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.dia_laboral.findMany({
      where: { estado: true },
      include: {
        margenes: {
          where: { estado: true },
          orderBy: { desde: "asc" },
        },
      },
      orderBy: { dia: "asc" },
    }),
    prisma.barbero.findMany({
      where: { estado: true }, 
      include: {
        servicios: { include: { servicio: true } },
        horarios: {
          include: {
            margenLaboral: true,
            dia: { select: { id: true, dia: true } },
          },
        },
      },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const serializedBarberos = barberos.map(barbero => ({
    ...barbero,
    servicios: barbero.servicios.map(sb => ({
      ...sb,
      servicio: {
        ...sb.servicio,
        precio: Number(sb.servicio.precio),
        senia: sb.servicio.senia ? Number(sb.servicio.senia) : null,
        descuento: sb.servicio.descuento ? Number(sb.servicio.descuento) : null,
      }
    }))
  }));

  return { servicios, diasLaborales, barberos: serializedBarberos };
}

export default async function BarberosPage() {
  const { servicios, diasLaborales, barberos } = await getData();

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          
          {/* IZQUIERDA */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestión de Barberos
              </h1>
              <p style={{ color: "var(--page-primary-80)" }}>
                Administra los barberos y sus horarios
              </p>
            </div>
          </div>

          {/* DERECHA → BOTÓN MODAL (PASANDO CONFIG) */}
          <CreateBarberoModal
            servicios={servicios}
            diasLaborales={diasLaborales}
          />
        </div>

        {/* LISTA */}
        <BarberoList 
          barberos={barberos} 
          servicios={servicios} 
          diasLaborales={diasLaborales} 
        />

      </div>
    </div>
  );
}