import { Mail, User } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button/Button";
import CampoTelefono from "@/components/dashboard/CampoTelefono";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import type { DatosUsuarioPanel, ManejadorFormularioPerfil } from "@/components/dashboard/tipos-panel-usuario";

type Propiedades = { usuario: DatosUsuarioPanel; prefijoInicial: string; telefonoInicial: string; guardando: boolean; alGuardar: ManejadorFormularioPerfil };

export default function FormularioPerfilUsuario({ usuario, prefijoInicial, telefonoInicial, guardando, alGuardar }: Propiedades) {
  const idNombre = useId();

  return (
    <div className="rounded-xl bg-[var(--admin-surface)]">
      <form onSubmit={alGuardar} className="grid gap-5 p-4 sm:p-6 md:grid-cols-2 md:gap-6 md:p-8">
        <div className="min-w-0 space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-texto-primario)]"><Mail className="size-4 text-[var(--page-primary-tinta)]" aria-hidden="true" /> Correo electrónico</p>
          <p className="flex min-h-12 items-center rounded-lg bg-[var(--admin-item)] px-3 py-2 text-sm text-[var(--admin-texto-secundario)] [overflow-wrap:anywhere]">{usuario.email}</p>
        </div>
        <div className="min-w-0 space-y-2">
          <label htmlFor={idNombre} className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-texto-primario)]"><User className="size-4 text-[var(--page-primary-tinta)]" aria-hidden="true" /> Nombre y apellido</label>
          <input id={idNombre} name="name" autoComplete="name" defaultValue={usuario.name || ""} required className="min-h-12 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2 text-[var(--admin-texto-primario)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--page-focus-ring)]" />
        </div>
        <CampoTelefono prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} />
        <div className="flex justify-end border-t border-[var(--page-separador)] pt-5 md:col-span-2">
          <Button disabled={guardando} aria-busy={guardando} type="submit" className={`h-11 w-full border border-[var(--admin-border-fuerte)] px-6 font-semibold hover:brightness-100 sm:w-auto ${CLASES_BOTON_MARCA}`}>{guardando ? "Guardando..." : "Actualizar perfil"}</Button>
        </div>
      </form>
    </div>
  );
}
