import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import { obtenerDestinoPostLogin } from "@/lib/seguridad/resolver-destino-post-login";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { serializarServiciosReserva } from "@/lib/serializar-servicios-reserva";
import { redirect } from "next/navigation";

type PropiedadesPaginaDashboard = {
  searchParams: Promise<{ redireccion?: string | string[]; tab?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: PropiedadesPaginaDashboard) {
  const [session, parametros] = await Promise.all([requerirSesion(), searchParams]);

  if (!session) return null; // El middleware ya protege, pero TypeScript lo agradece

  // Al volver de un inicio de sesión, resolver el destino con datos persistidos.
  // Si falta el teléfono, `obtenerDestinoPostLogin` devuelve null y se renderiza
  // el panel (modal de teléfono), por lo que no hay bucle de redirección.
  if (parametros.redireccion === "post-login") {
    const destino = await obtenerDestinoPostLogin(session.user.id);
    if (destino) redirect(destino);
  }

  const { servicios, barberos, relaciones } = await obtenerDatosReserva(false);

  const initialTab = parametros.tab === "turnos" ? "turnos" : "perfil";

  return (
    <DashboardPanel
      user={session.user}
      session={session}
      initialTab={initialTab}
      initialServicios={serializarServiciosReserva(servicios)}
      initialBarberos={barberos}
      initialRelaciones={relaciones}
    />
  );
}
