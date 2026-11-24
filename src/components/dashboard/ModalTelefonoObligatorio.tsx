import { Button } from "@/components/ui/button/Button";
import CampoTelefono from "@/components/dashboard/CampoTelefono";
import ModalBase from "@/components/ui/ModalBase";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import type { DatosUsuarioPanel, ManejadorFormularioPerfil } from "@/components/dashboard/tipos-panel-usuario";

type Propiedades = { usuario: DatosUsuarioPanel; prefijoInicial: string; telefonoInicial: string; guardando: boolean; alGuardar: ManejadorFormularioPerfil };

export default function ModalTelefonoObligatorio({ usuario, prefijoInicial, telefonoInicial, guardando, alGuardar }: Propiedades) {
  return (
    <ModalBase
      apariencia="publica"
      maxWidth="max-w-md"
      titulo="Completá tu teléfono"
      subtitulo="Necesitamos tu número de teléfono para que puedas reservar un turno."
    >
      <form onSubmit={alGuardar} className="mt-5 space-y-5">
        <input type="hidden" name="name" value={usuario.name || ""} />
        <CampoTelefono prefijoInicial={prefijoInicial} telefonoInicial={telefonoInicial} />
        <Button disabled={guardando} aria-busy={guardando} type="submit" className={`h-11 w-full border border-[var(--admin-border-fuerte)] px-6 font-semibold hover:brightness-100 ${CLASES_BOTON_MARCA}`}>
          {guardando ? "Guardando..." : "Guardar teléfono"}
        </Button>
      </form>
    </ModalBase>
  );
}
