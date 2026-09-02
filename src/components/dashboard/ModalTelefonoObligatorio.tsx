import { Button } from "@/components/ui/button/Button";
import CampoTelefono from "@/components/dashboard/CampoTelefono";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import type { DatosUsuarioPanel, ManejadorFormularioPerfil } from "@/components/dashboard/tipos-panel-usuario";

type Propiedades = { usuario: DatosUsuarioPanel; prefijoInicial: string; telefonoInicial: string; guardando: boolean; alGuardar: ManejadorFormularioPerfil };

export default function ModalTelefonoObligatorio({ usuario, prefijoInicial, telefonoInicial, guardando, alGuardar }: Propiedades) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[var(--admin-border-fuerte)] bg-[var(--admin-surface-elevated)] p-6 shadow-2xl">
        <h2 className="mb-2 text-2xl font-black uppercase tracking-widest text-[var(--admin-texto-primario)]">Atención</h2>
        <p className="mb-6 text-sm text-[var(--admin-texto-secundario)]">Para poder reservar un turno necesitamos tu número de teléfono. Por favor, ingresálo y guardálo para continuar.</p>
        <form onSubmit={alGuardar} className="space-y-6">
          <input type="hidden" name="name" value={usuario.name || ""} />
          <CampoTelefono prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} />
          <Button disabled={guardando} type="submit" className={`h-14 w-full rounded-2xl px-10 font-black uppercase tracking-widest transition-all active:scale-95 ${CLASES_BOTON_MARCA}`}>
            {guardando ? "Guardando..." : "Guardar Teléfono"}
          </Button>
        </form>
      </div>
    </div>
  );
}
