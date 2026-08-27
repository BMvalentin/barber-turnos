"use client";

import type { Session } from "next-auth";
import type { UsuarioData } from "@/types/turno";
import SeccionCliente from "./SeccionCliente";

type Props = {
  session: Session | null;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  usuarios: UsuarioData[];
};

export default function SeccionConfirmacion({
  session,
  selectedUserId,
  setSelectedUserId,
  usuarios,
}: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-300">
        Confirmación <span style={{ color: "var(--primary)" }}>*</span>
      </h3>

      <SeccionCliente
        session={session}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        usuarios={usuarios}
      />

      <p className="text-xs text-zinc-400 italic">
        Revisá el resumen y confirmá tu turno para continuar.
      </p>
    </div>
  );
}
