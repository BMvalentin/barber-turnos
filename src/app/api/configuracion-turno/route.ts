import { NextResponse } from "next/server";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";

export async function GET() {
  const sesion = await requerirSesion();
  if (!sesion) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { servicios, barberos, usuarios, relaciones } = await obtenerDatosReserva(
      esAdmin(sesion),
    );

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
