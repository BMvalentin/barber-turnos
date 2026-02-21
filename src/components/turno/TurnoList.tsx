"use client";

import EditTurnoModal from "./EditarTurnoModal";

type Turno = {
  id: string;
  horarioReservado: Date;
  precioCongelado: number;
  seniaCongelada: number;
  estado: "PENDIENTE" | "CONFIRMADO" | "CANCELADO" | "COMPLETADO";
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  servicio: {
    id: string;
    nombre: string;
    duracion: number;
  };
  barbero: {
    id: string;
    nombre: string;
  };
};

interface Props {
  turnos: Turno[];
  session: any;
}

export default function TurnoList({ turnos, session }: Props) {
  if (!turnos.length) {
    return (
      <div className="bg-gray-50 border rounded-lg p-6 text-center">
        <p className="text-gray-600">No hay turnos cargados</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {turnos.map((turno) => (
        <div key={turno.id} className="border rounded-xl shadow-sm p-5 bg-white">
          <div className="mb-3">
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-semibold">
              {turno.user.name || turno.user.email}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-500">Servicio</p>
            <p className="font-semibold">{turno.servicio.nombre}</p>
            <p className="text-sm text-gray-600">
              Duración: {turno.servicio.duracion} min
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-500">Barbero</p>
            <p className="font-semibold">{turno.barbero.nombre}</p>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-500">Fecha</p>
            <p className="font-semibold">
              {new Date(turno.horarioReservado).toLocaleString()}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-500">Estado</p>
            <p className="font-semibold">{turno.estado}</p>
          </div>

          {session?.user?.role === "ADMIN" && (
            <EditTurnoModal turno={turno} />
          )}
        </div>
      ))}
    </div>
  );
}
