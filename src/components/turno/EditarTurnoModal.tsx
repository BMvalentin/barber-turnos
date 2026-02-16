"use client";

import { useActionState, useEffect, useState } from "react";
import { actualizarTurno } from "@/actions/turno.actions";
import SeleccionadorHorario from "./SeleccionadorHorario";

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

const initialState = {
  success: false,
  error: undefined as string | undefined,
};

interface Props {
  turno: Turno;
}

export default function EditTurnoModal({ turno }: Props) {
  const [open, setOpen] = useState(false);

  const [state, formAction] = useActionState(
    actualizarTurno,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Editar
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Editar Turno</h2>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="id" value={turno.id} />

              <div>
                <p className="text-sm text-gray-500">Servicio</p>
                <p className="font-semibold">{turno.servicio.nombre}</p>
                <p className="text-sm text-gray-600">
                  Barbero: {turno.barbero.nombre}
                </p>
              </div>

              <SeleccionadorHorario
                name="horarioReservado"
                servicioId={turno.servicio.id}
                barberoId={turno.barbero.id}
                turnoIdAExcluir={turno.id}
                defaultValue={turno.horarioReservado.toISOString()}
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  defaultValue={turno.estado}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADO">CONFIRMADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                  <option value="COMPLETADO">COMPLETADO</option>
                </select>
              </div>

              {state.error && (
                <p className="text-red-600 text-sm">{state.error}</p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
