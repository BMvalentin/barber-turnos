import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [servicios, barberos, usuarios, relaciones] = await Promise.all([
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

      prisma.barbero.findMany({
        where: { estado: true },
        select: {
          id: true,
          nombre: true,
          srcImage: true,
        },
        orderBy: { nombre: "asc" },
      }),

      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.servicioxbarbero.findMany({
        select: { 
          barberoId: true,
          servicioId: true 
        },
      }),

    ]);

    // Serializar campos Decimal a Number para evitar errores de serialización
    const serializedServicios = servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      descripcion: s.descripcion,
      duracion: s.duracion,
      precio: Number(s.precio),
      descuento: s.descuento !== null ? Number(s.descuento) : null,
      senia: s.senia !== null ? Number(s.senia) : null,
    }));

    return NextResponse.json({
      servicios: serializedServicios,
      barberos,
      usuarios,
      relaciones,
    });
  } catch (error) {
    console.error("[GET /api/configuracion-turno] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar la configuración" },
      { status: 500 }
    );
  }
}
