"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ModalBase from "@/components/ui/ModalBase";
import { editarDatosUsuario, type DatosEdicionUsuario } from "@/actions/usuarios/editar.actions";
import type { UsuarioAdministrable } from "@/actions/usuarios/listar.actions";

type Props = {
  usuario: UsuarioAdministrable;
  onClose: () => void;
};

type CampoEditable = keyof DatosEdicionUsuario;

const CAMPOS: { clave: CampoEditable; etiqueta: string; tipo: string; autoComplete: string; placeholder: string }[] = [
  { clave: "name", etiqueta: "Nombre", tipo: "text", autoComplete: "off", placeholder: "Nombre de la cuenta" },
  { clave: "email", etiqueta: "Correo", tipo: "email", autoComplete: "off", placeholder: "correo@ejemplo.com" },
  { clave: "telefono", etiqueta: "Celular", tipo: "tel", autoComplete: "off", placeholder: "+54 9 11 1234-5678" },
];

const CLASES_INPUT =
  "h-10 w-full rounded-lg border bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

export default function EditarUsuarioModal({ usuario, onClose }: Props) {
  const [datos, setDatos] = useState<DatosEdicionUsuario>({
    name: usuario.name ?? "",
    email: usuario.email,
    telefono: usuario.telefono ?? "",
  });
  const [errores, setErrores] = useState<Partial<Record<CampoEditable, string>>>({});
  const [pendiente, iniciarTransicion] = useTransition();
  const router = useRouter();

  const guardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrores({});
    iniciarTransicion(async () => {
      const resultado = await editarDatosUsuario(usuario.id, datos);
      if (resultado.success) {
        toast.success("Datos actualizados");
        router.refresh();
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
    <ModalBase titulo="Editar usuario" subtitulo={usuario.email} onClose={pendiente ? undefined : onClose}>
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
                style={{ borderColor: error ? "rgb(248 113 113)" : "var(--admin-border)" }}
              />
              {error && <p id={`${idCampo}-error`} className="text-xs text-red-400">{error}</p>}
            </div>
          );
        })}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={pendiente} className="rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--admin-texto-secundario)] transition-colors hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)] disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={pendiente} className="rounded-lg bg-[var(--page-primary)] px-3.5 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] disabled:cursor-not-allowed disabled:opacity-50">
            {pendiente ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
