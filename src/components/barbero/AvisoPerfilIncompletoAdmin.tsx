"use client";

import { usePathname } from "next/navigation";
import type { CampoPendientePerfil } from "@/lib/barberos/perfil-profesional";
import ModalPerfilIncompleto from "./ModalPerfilIncompleto";

type Props = {
  pendientes: CampoPendientePerfil[];
  esEmpleado: boolean;
};

export default function AvisoPerfilIncompletoAdmin({ pendientes, esEmpleado }: Props) {
  const ruta = usePathname();

  // En «Mi perfil» el aviso deja paso al formulario de edición de esa vista.
  if (ruta === "/admin/barbero/perfil") return null;

  return <ModalPerfilIncompleto key={ruta} pendientes={pendientes} esEmpleado={esEmpleado} />;
}
