import { Calendar, User } from "lucide-react";
import type { PestanaPanel } from "@/components/dashboard/tipos-panel-usuario";

type Propiedades = { nombre?: string | null; pestana: PestanaPanel; alCambiar: (pestana: PestanaPanel) => void };

export default function EncabezadoPanelUsuario({ nombre, pestana, alCambiar }: Propiedades) {
  const clasePestana = (valor: PestanaPanel) => `flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all md:flex-none ${pestana === valor ? "bg-[var(--page-primary)] text-[var(--page-primary-foreground)]" : "text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item-hover)]"}`;
  return (
    <div className="mb-10 flex flex-col justify-between gap-6 border-b border-[var(--admin-border)] pb-8 md:flex-row md:items-end">
      <div>
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-[var(--admin-texto-primario)]">Hola, <span className="text-[var(--page-primary-tinta)]">{nombre?.split(" ")[0] || "Usuario"}</span></h1>
        <p className="mt-2 text-[var(--admin-texto-secundario)]">Gestioná tu perfil y tus reservas.</p>
      </div>
      <div className="flex w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 md:w-fit">
        <button onClick={() => alCambiar("perfil")} className={clasePestana("perfil")}><User className="h-4 w-4" /> Mi Perfil</button>
        <button onClick={() => alCambiar("turnos")} className={clasePestana("turnos")}><Calendar className="h-4 w-4" /> Mis Turnos</button>
      </div>
    </div>
  );
}
