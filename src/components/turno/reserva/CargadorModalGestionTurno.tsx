"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { listarUsuariosParaReserva } from "@/actions/turnos/listar-usuarios-reserva.actions";
import { toast } from "sonner";
import type { UsuarioData } from "@/types/turno";
import type { PropsModalGestionTurno } from "@/components/turno/reserva/tipos";

type ComponenteModal = ComponentType<PropsModalGestionTurno>;

let promesaModulo: Promise<{ default: ComponenteModal }> | null = null;

const ESTILO_TEMAS = {
  "--primary": "var(--page-primary)",
  "--secondary": "var(--page-secondary)",
  "--primary-foreground": "var(--page-primary-foreground)",
  "--primary-tinta": "var(--page-primary-tinta)",
} as CSSProperties;

function cargarModuloModal() {
  if (!promesaModulo) {
    promesaModulo = import("@/components/turno/reserva/ModalGestionTurno").catch(
      (error: unknown) => {
        promesaModulo = null;
        throw error;
      },
    );
  }
  return promesaModulo;
}

export default function CargadorModalGestionTurno(
  props: PropsModalGestionTurno,
) {
  const [Modal, setModal] = useState<ComponenteModal | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(props.initialUsuarios ?? []);
  const [cargando, setCargando] = useState(false);
  const montadoRef = useRef(true);
  const esEdicion = Boolean(props.turnoInicial);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const precargar = () => {
    void cargarModuloModal().catch(() => {});
  };

  const abrir = async () => {
    props.onTriggerClick?.();
    setCargando(true);
    try {
      const necesitaUsuarios = props.session?.user?.role === "ADMIN" || props.session?.user?.role === "EMPLEADO";
      const [modulo, resultadoUsuarios] = await Promise.all([
        cargarModuloModal(),
        necesitaUsuarios && usuarios.length === 0
          ? listarUsuariosParaReserva()
          : Promise.resolve(null),
      ]);
      if (resultadoUsuarios && !resultadoUsuarios.success) {
        toast.error("No se pudo cargar la lista de clientes", {
          description: resultadoUsuarios.error,
        });
        return;
      }
      if (resultadoUsuarios?.success) setUsuarios(resultadoUsuarios.data ?? []);
      if (montadoRef.current) setModal(() => modulo.default);
    } catch {
      // El botón queda disponible para reintentar la carga del módulo.
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  };

  if (Modal) {
    return <Modal {...props} initialUsuarios={usuarios} abrirAlMontar />;
  }

  if (props.contenidoTrigger) {
    return (
      <div style={ESTILO_TEMAS}>
        <button
          type="button"
          onClick={() => void abrir()}
          onPointerEnter={precargar}
          onFocus={precargar}
          disabled={cargando}
          aria-busy={cargando}
          className={props.claseTrigger}
        >
          {cargando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparando...
            </>
          ) : (
            props.contenidoTrigger
          )}
        </button>
      </div>
    );
  }

  return (
    <div style={ESTILO_TEMAS}>
      <Button
        className="flex items-center gap-2 px-6 py-3 font-medium text-[var(--primary-foreground)] shadow-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--primary)" }}
        onClick={() => void abrir()}
        onPointerEnter={precargar}
        onFocus={precargar}
        disabled={cargando}
        aria-busy={cargando}
      >
        {cargando ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : esEdicion ? (
          <Pencil className="h-5 w-5" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
        {cargando
          ? "Preparando reserva..."
          : esEdicion
            ? "Editar Turno"
            : "Nuevo Turno"}
      </Button>
    </div>
  );
}
