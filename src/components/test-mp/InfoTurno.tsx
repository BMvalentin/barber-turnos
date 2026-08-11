"use client";
// src/components/test-mp/InfoTurno.tsx

import type { Turno } from "./tipos";
import { ESTADO_COLOR, ESTADO_DOT } from "./constantes";
import { cortarId } from "./cortarId";

export function InfoTurno({ turno }: { turno: Turno }) {
  return (
    <section className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
          Turno seleccionado
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              ESTADO_DOT[turno.estado] ?? "bg-zinc-500"
            }`}
          />
          <span
            className={`text-xs font-bold ${
              ESTADO_COLOR[turno.estado]?.split(" ")[0] ?? "text-zinc-400"
            }`}
          >
            {turno.estado}
          </span>
        </div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
        {[
          ["ID", turno.id],
          ["Servicio", turno.servicioNombre],
          ["Barbero", turno.barberoNombre],
          ["Cliente", turno.userName ?? "-"],
          ["Email", turno.userEmail ?? "-"],
          [
            "Horario",
            new Date(turno.horarioReservado).toLocaleString("es-AR", {
              timeZone: "America/Argentina/Buenos_Aires",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          ],
          [
            "Precio",
            `$${turno.precioCongelado.toLocaleString("es-AR")}`,
          ],
          [
            "Seña",
            `$${turno.seniaCongelada.toLocaleString("es-AR")}`,
          ],
          [
            "mp_preference_id",
            turno.mpPreferenceId ? cortarId(turno.mpPreferenceId) : "null",
          ],
          [
            "mp_payment_id",
            turno.mpPaymentId ?? "null",
          ],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="text-zinc-600 w-36 flex-shrink-0">{k}</span>
            <span
              className={`text-zinc-300 font-mono truncate ${
                v === "null" ? "text-zinc-700 italic" : ""
              }`}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}