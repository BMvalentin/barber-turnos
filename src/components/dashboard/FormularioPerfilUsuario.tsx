import { Mail, Settings, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import CampoTelefono from "@/components/dashboard/CampoTelefono";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import type { DatosUsuarioPanel, ManejadorFormularioPerfil } from "@/components/dashboard/tipos-panel-usuario";

type Propiedades = { usuario: DatosUsuarioPanel; prefijoInicial: string; telefonoInicial: string; guardando: boolean; alGuardar: ManejadorFormularioPerfil };

export default function FormularioPerfilUsuario({ usuario, prefijoInicial, telefonoInicial, guardando, alGuardar }: Propiedades) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl">
      <div className="border-b border-[var(--admin-border)] bg-[var(--page-primary-15)] p-6 md:p-8">
        <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest text-[var(--admin-texto-primario)]"><Settings className="h-5 w-5" /> Detalles de usuario</h2>
      </div>
      <form onSubmit={alGuardar} className="grid gap-8 p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--page-primary-tinta)]"><Mail className="h-3.5 w-3.5" /> Correo Electrónico</label>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-item)] p-4 font-mono text-sm italic text-[var(--admin-texto-muted)]">{usuario.email}</div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--page-primary-tinta)]"><User className="h-3.5 w-3.5" /> Nombre y Apellido</label>
          <input name="name" defaultValue={usuario.name || ""} required className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-4 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--page-primary)] focus:ring-2 focus:ring-[var(--page-focus-ring)]" />
        </div>
        <CampoTelefono prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} />
        <div className="flex flex-col items-center justify-between gap-8 border-t border-[var(--admin-border)] pt-8 md:col-span-2 md:flex-row">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[var(--admin-texto-muted)]"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Conexión segura SSL activa</div>
          <Button disabled={guardando} type="submit" className={`h-14 w-full rounded-2xl px-10 font-black uppercase tracking-widest md:w-auto ${CLASES_BOTON_MARCA}`}>{guardando ? "Guardando..." : "Actualizar Perfil"}</Button>
        </div>
      </form>
    </div>
  );
}
