import { Calendar, User } from "lucide-react";
import type { PestanaPanel } from "@/components/dashboard/tipos-panel-usuario";

type Propiedades = { nombre?: string | null; pestana: PestanaPanel; alCambiar: (pestana: PestanaPanel) => void };

export default function EncabezadoPanelUsuario({ nombre, pestana, alCambiar }: Propiedades) {
  const clasePestana = (valor: PestanaPanel) => `flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:px-6 md:flex-none ${pestana === valor ? "border-[var(--admin-border-fuerte)] bg-[var(--page-primary)] text-[var(--page-primary-foreground)] focus-visible:outline-[var(--page-primary-foreground)]" : "border-transparent text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item-hover)] focus-visible:outline-[var(--page-focus-ring)]"}`;
  return (
    <div className="mb-6 flex flex-col justify-between gap-5 border-b border-[var(--page-separador)] pb-5 md:mb-8 md:flex-row md:items-end md:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--admin-texto-primario)] [overflow-wrap:anywhere] sm:text-4xl">Hola, <span className="text-[var(--page-primary-tinta)]">{nombre?.trim().split(/\s+/)[0] || "Usuario"}</span></h1>
        <p className="mt-1 text-[var(--admin-texto-secundario)]">Gestioná tu perfil y tus reservas.</p>
      </div>
      <div role="group" aria-label="Secciones de tu cuenta" className="flex w-full gap-1 rounded-lg bg-[var(--admin-surface)] p-1 md:w-fit">
        <button type="button" aria-pressed={pestana === "perfil"} onClick={() => alCambiar("perfil")} className={clasePestana("perfil")}><User className="size-4 shrink-0" aria-hidden="true" /> Mi perfil</button>
        <button type="button" aria-pressed={pestana === "turnos"} onClick={() => alCambiar("turnos")} className={clasePestana("turnos")}><Calendar className="size-4 shrink-0" aria-hidden="true" /> Mis turnos</button>
      </div>
    </div>
  );
}
