import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { requerirSesion } from "@/lib/seguridad/requerir-sesion";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

async function getTurnoData() {
  const { servicios, barberos, usuarios, relaciones, config } = await obtenerDatosReserva(false);

  const serializedServicios = servicios.map((s) => ({
    ...s,
    precio: s.precio ? Number(s.precio) : 0,
    descuento: s.descuento ? Number(s.descuento) : 0,
    senia: s.senia ? Number(s.senia) : 0,
  }));

  return { servicios: serializedServicios, barberos, usuarios, relaciones, config };
}

export default async function TurnoPage() {
  const session = await requerirSesion();
  if (!session?.user) redirect("/login");
  const contextoPanel = await requerirPanel();
  if (contextoPanel) redirect("/admin/turno");

  const { servicios, barberos, usuarios, relaciones, config } = await getTurnoData();

  return (
    <div className="min-h-screen w-full p-2 sm:p-6 pt-24 md:pt-24 overflow-x-clip">
      <div className="container mx-auto max-w-7xl">
        <TurnoManager
          turnosIniciales={[]}
          totalPaginasInicial={1}
          cargarTurnosAlMontar
          session={session}
          initialServicios={servicios}
          initialBarberos={barberos}
          initialUsuarios={usuarios}
          initialRelaciones={relaciones}
          whatsappPhone={config?.whatsapp || ""}
          datosTransferencia={{
            transferenciaTitular: config?.transferenciaTitular || "",
            transferenciaCuit: config?.transferenciaCuit || "",
            transferenciaAlias: config?.transferenciaAlias || "",
            transferenciaCbu: config?.transferenciaCbu || "",
            transferenciaBanco: config?.transferenciaBanco || "",
          }}
        />
      </div>
    </div>
  );
}
