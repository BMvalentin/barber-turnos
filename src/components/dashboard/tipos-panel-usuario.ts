import type { FormEvent } from "react";
import type { Session } from "next-auth";
import type { TurnoListado } from "@/types/turno";

export type DatosUsuarioPanel = { id: string; name?: string | null; email?: string | null; telefono?: string | null };
export type PestanaPanel = "perfil" | "turnos";
export type ManejadorFormularioPerfil = (evento: FormEvent<HTMLFormElement>) => void;
export type PropiedadesPanelUsuario = { user: DatosUsuarioPanel; turnos: TurnoListado[]; session: Session | null };
