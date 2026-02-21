// app/barbero/nuevo/page.tsx
import { prisma } from "@/lib/prisma";
import CreateBarberoForm from "@/components/barbero/CreateBarberoForm";
import ListaBarberos from "@/components/barbero/BarberoList";

async function getData() {
  const [servicios, diasLaborales, barberos] = await Promise.all([
    prisma.servicio.findMany({
      where: { estado: true },
      select: {
        id: true,
        nombre: true,
      },
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
        servicios: {
          include: {
            servicio: true,
          },
        },
        horarios: {
          include: {
            margenLaboral: true,
            dia : {
              select :{
                dia: true,
              },
            },
          },
        },
      },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return { servicios, diasLaborales, barberos };
}

export default async function BarberosPage() {
  const { servicios, diasLaborales, barberos } = await getData();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Barberos</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario - Izquierda (1/3) */}
        <div className="lg:col-span-1">
          <CreateBarberoForm 
            servicios={servicios} 
            diasLaborales={diasLaborales} 
          />
        </div>

        {/* Lista - Derecha (2/3) */}
        <div className="lg:col-span-2">
          <ListaBarberos barberos={barberos} />
        </div>
      </div>
    </div>
  );
}