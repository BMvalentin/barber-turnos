import type { FormEvent } from "react";
import type { Session } from "next-auth";

export type DatosUsuarioPanel = { id: string; name?: string | null; email?: string | null; telefono?: string | null };
export type PestanaPanel = "perfil" | "turnos";
export type ManejadorFormularioPerfil = (evento: FormEvent<HTMLFormElement>) => void;
export type PropiedadesPanelUsuario = {
  user: DatosUsuarioPanel;
  session: Session | null;
};
