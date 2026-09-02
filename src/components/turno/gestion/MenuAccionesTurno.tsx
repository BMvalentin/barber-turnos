"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Ban, Pencil } from "lucide-react";
import ModalGestionTurno from "../reserva/ModalGestionTurno";
import { esAdmin } from "@/lib/seguridad/es-admin";
import { ESTADOS_TURNO } from "@/lib/constants";
import type { TurnoListado } from "@/types/turno";
import type { Session } from "next-auth";

interface Props {
  turno: TurnoListado;
  session: Session | null;
  onCancelar: (id: string) => void;
}

export default function MenuAccionesTurno({
  turno,
  session,
  onCancelar,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const cerrarMenu = () => setAbierto(false);

  useEffect(() => {
    if (!abierto) return;

    const manejarClickFuera = (event: MouseEvent) => {
      const objetivo = event.target as Node;
      if (contenedorRef.current && !contenedorRef.current.contains(objetivo)) {
        setAbierto(false);
      }
    };

    const manejarTeclaEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAbierto(false);
      }
    };

    window.addEventListener("mousedown", manejarClickFuera);
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => {
      window.removeEventListener("mousedown", manejarClickFuera);
      window.removeEventListener("keydown", manejarTeclaEscape);
    };
  }, [abierto]);

  const turnoActivo =
    turno.estado === ESTADOS_TURNO[0] || turno.estado === ESTADOS_TURNO[1];
  const esDueno =
    turno.user?.id === session?.user?.id && session?.user?.role !== "ADMIN";
  const puedeCancelar = turnoActivo && (esAdmin(session) || esDueno);

  return (
    <div ref={contenedorRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Más acciones"
        aria-expanded={abierto}
        onClick={() => setAbierto((prev) => !prev)}
        className={`h-8 w-8 rounded-lg flex items-center justify-center text-[var(--admin-texto-muted)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)] transition-colors ${
          abierto ? "bg-white/5 text-[var(--admin-texto-primario)]" : ""
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <div
        className={`absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1 shadow-2xl shadow-black/40 ${
          abierto ? "" : "pointer-events-none invisible"
        }`}
      >
        <ModalGestionTurno
          session={session}
          turnoInicial={turno}
          whatsappPhone=""
          claseTrigger="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item-hover)] transition-colors"
          contenidoTrigger={
            <>
              <Pencil className="h-4 w-4" />
              Editar Turno
            </>
          }
          onTriggerClick={cerrarMenu}
        />
        {puedeCancelar && (
          <button
            type="button"
            onClick={() => {
              cerrarMenu();
              onCancelar(turno.id);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors text-red-400 hover:bg-red-500/10"
          >
            <Ban className="h-4 w-4" />
            Cancelar turno
          </button>
        )}
      </div>
    </div>
  );
}
