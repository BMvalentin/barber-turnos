"use client";

import { useState, useMemo } from "react";
import TurnoList from "./TurnoList";

export default function TurnoManager({ initialTurnos, session }: { initialTurnos: any[], session: any }) {
  const [estado, setEstado] = useState("TODOS");
  const [fecha, setFecha] = useState("");

  const filteredTurnos = useMemo(() => {
    return initialTurnos.filter((t) => {
      const matchEstado = estado === "TODOS" || t.estado === estado;
      // Compara la fecha guardada con el input del usuario
      const matchFecha = !fecha || new Date(t.horarioReservado).toISOString().split('T')[0] === fecha;
      return matchEstado && matchFecha;
    });
  }, [initialTurnos, estado, fecha]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/40 p-4 mb-6 rounded-xl border border-amber-900/20">
        <div className="flex flex-wrap gap-2">
          {["TODOS", "PENDIENTE", "CONFIRMADO", "COMPLETADO", "CANCELADO"].map((f) => (
            <button
              key={f}
              onClick={() => setEstado(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${estado === f ? "bg-amber-600 text-white" : "bg-neutral-900 border border-neutral-700 text-neutral-400 hover:border-amber-600"}`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-neutral-700 hidden sm:block"></div>

        <input 
          type="date" 
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg px-3 py-1.5 focus:border-amber-500 outline-none"
        />
      </div>

      <TurnoList session={session} turnos={filteredTurnos} totalPages={1} currentPage={1} />
    </div>
  );
}