import type { Session } from "next-auth";
import type { Dispatch, RefObject, SetStateAction } from "react";

export interface HeaderProps {
  config?: { name?: string | null; logo?: string | null } | null;
}

export interface NavegacionEscritorioHeaderProps {
  sesion: Session | null;
  menuSesionAbierto: boolean;
  setMenuSesionAbierto: Dispatch<SetStateAction<boolean>>;
  contenedorSesion: RefObject<HTMLDivElement | null>;
}

export interface MenuMovilHeaderProps {
  sesion: Session | null;
  cerrarMenu: () => void;
}
