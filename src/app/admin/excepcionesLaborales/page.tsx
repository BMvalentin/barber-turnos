import { permanentRedirect } from "next/navigation";

export default function RedireccionExcepcionesLaboralesPage() {
  permanentRedirect("/admin/config/empleados/horarios-laborales/excepciones");
}
