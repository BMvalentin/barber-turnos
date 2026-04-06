// app/test-mp/page.tsx
// ⚠️  SOLO PARA DESARROLLO — eliminá esta ruta antes de producción

import { prisma } from "@/lib/prisma";
import { MPTestClient } from "./MPTestClient";

export default async function TestMPPage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">
        🚫 Esta ruta no está disponible en producción.
      </div>
    );
  }

  // Traer los últimos 10 turnos con toda la info necesaria
  const turnosRaw = await prisma.turno.findMany({
    take: 10,
    orderBy: { horarioReservado: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      servicio: { select: { nombre: true } },
      barbero: { select: { nombre: true } },
    },
  });

  const turnos = turnosRaw.map((t) => ({
    id: t.id,
    estado: t.estado,
    horarioReservado: t.horarioReservado.toISOString(),
    precioCongelado: Number(t.precioCongelado),
    seniaCongelada: Number(t.seniaCongelada),
    mpPreferenceId: (t as any).mpPreferenceId ?? null,
    mpPaymentId: (t as any).mpPaymentId ?? null,
    userName: t.user.name,
    userEmail: t.user.email,
    servicioNombre: t.servicio.nombre,
    barberoNombre: t.barbero.nombre,
  }));

  return <MPTestClient turnos={turnos} />;
}