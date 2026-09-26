import type { FormEvent } from "react";
import type { Session } from "next-auth";
import type { TurnoListado } from "@/types/turno";
import type { DatosTransferencia } from "@/types/pago";

export type DatosUsuarioPanel = { id: string; name?: string | null; email?: string | null; telefono?: string | null };
export type PestanaPanel = "perfil" | "turnos";
export type ManejadorFormularioPerfil = (evento: FormEvent<HTMLFormElement>) => void;
export type PropiedadesPanelUsuario = {
  user: DatosUsuarioPanel;
  turnos: TurnoListado[];
  paginaTurnosInicial: number;
  totalPaginasTurnos: number;
  session: Session | null;
  whatsappPhone: string;
  datosTransferencia: DatosTransferencia;
};
