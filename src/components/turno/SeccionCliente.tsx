"use client";

import type { Session } from "next-auth";
import type { UsuarioData } from "@/types/turno";

type Props = {
  session: Session | null;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  usuarios: UsuarioData[];
};

export default function SeccionCliente({
  session,
  selectedUserId,
  setSelectedUserId,
  usuarios,
}: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        Cliente <span style={{ color: "var(--primary)" }}>*</span>
      </label>

      {session?.user?.role === "USER" ? (
        <select
          disabled
          className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800/50 text-zinc-400 text-sm"
        >
          <option>
            {session?.user?.name || "Usuario"} ({session?.user?.email})
          </option>
        </select>
      ) : (
        <select
          name="userId"
          required
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2"
          style={{ outlineColor: "var(--primary)" }}
        >
          <option value="">-- Seleccionar Cliente --</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || "Sin nombre"} ({u.email})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}