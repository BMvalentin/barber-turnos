"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import ModalBase from "@/components/ui/ModalBase";
import { editarDatosUsuario, type DatosEdicionUsuario } from "@/actions/usuarios/editar.actions";
import type { UsuarioAdministrable } from "@/actions/usuarios/listar.actions";

type Props = {
  usuario: UsuarioAdministrable;
  onClose: () => void;
  onGuardado: () => void;
};

type CampoEditable = keyof DatosEdicionUsuario;

const CAMPOS: { clave: CampoEditable; etiqueta: string; tipo: string; autoComplete: string; placeholder: string }[] = [
  { clave: "name", etiqueta: "Nombre", tipo: "text", autoComplete: "off", placeholder: "Nombre de la cuenta" },
  { clave: "email", etiqueta: "Correo", tipo: "email", autoComplete: "off", placeholder: "correo@ejemplo.com" },
  { clave: "telefono", etiqueta: "Celular", tipo: "tel", autoComplete: "off", placeholder: "+54 9 11 1234-5678" },
];

const CLASES_INPUT =
  "min-h-11 w-full rounded-xl border bg-[var(--admin-surface)] px-3 text-base text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] sm:text-sm";

export default function EditarUsuarioModal({ usuario, onClose, onGuardado }: Props) {
  const [datos, setDatos] = useState<DatosEdicionUsuario>({
    name: usuario.name ?? "",
    email: usuario.email,
    telefono: usuario.telefono ?? "",
  });
  const [errores, setErrores] = useState<Partial<Record<CampoEditable, string>>>({});
  const [pendiente, iniciarTransicion] = useTransition();

  const guardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrores({});
    iniciarTransicion(async () => {
      const resultado = await editarDatosUsuario(usuario.id, datos);
      if (resultado.success) {
        toast.success("Datos actualizados");
        onGuardado();
        onClose();
        return;
      }
      setErrores({
        name: resultado.errors?.name?.[0],
        email: resultado.errors?.email?.[0],
        telefono: resultado.errors?.telefono?.[0],
      });
      toast.error(resultado.error ?? "No se pudieron guardar los cambios");
    });
  };

  return (
    <ModalBase
      titulo="Editar usuario"
      subtitulo={usuario.email}
      subtituloClase="text-sm text-[var(--admin-texto-muted)] [overflow-wrap:anywhere]"
      contenedorClase="admin-card max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6"
      onClose={pendiente ? undefined : onClose}
    >
      <form onSubmit={guardar} className="mt-5 space-y-4 text-left" noValidate>
        {CAMPOS.map((campo) => {
          const error = errores[campo.clave];
          const idCampo = `usuario-${usuario.id}-${campo.clave}`;
          return (
            <div key={campo.clave} className="space-y-1.5">
              <label htmlFor={idCampo} className="block text-sm font-medium text-[var(--admin-texto-secundario)]">{campo.etiqueta}</label>
              <input
                id={idCampo}
                type={campo.tipo}
                value={datos[campo.clave]}
                onChange={(e) => setDatos((previo) => ({ ...previo, [campo.clave]: e.target.value }))}
                autoComplete={campo.autoComplete}
                placeholder={campo.placeholder}
                disabled={pendiente}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${idCampo}-error` : undefined}
                className={CLASES_INPUT}
                style={{ borderColor: error ? "var(--admin-error)" : "var(--admin-border-fuerte)" }}
              />
              {error && <p id={`${idCampo}-error`} className="text-sm text-[var(--admin-error)]">{error}</p>}
            </div>
          );
        })}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={pendiente} className="admin-control">
            Cancelar
          </button>
          <button type="submit" disabled={pendiente} className="admin-accion">
            {pendiente ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
