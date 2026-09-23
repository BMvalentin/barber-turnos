// app/admin/turno/page.tsx
import { getTurnos } from "@/actions/turnos/listar.actions";
import TurnoManager from "@/components/turno/gestion/TurnoManager";
import { obtenerDatosReserva } from "@/lib/consultas/obtener-datos-reserva";
import { prisma } from "@/lib/prisma";
import { requerirPanel } from "@/lib/seguridad/requerir-admin";
import { redirect } from "next/navigation";

async function getTurnoData(barberoId: string | null, incluirUsuarios: boolean) {
  const { servicios, barberos: todosBarberos, usuarios: todosUsuarios, relaciones: todasRelaciones, config } = await obtenerDatosReserva(incluirUsuarios);
  const barberos = barberoId ? todosBarberos.filter((barbero) => barbero.id === barberoId) : todosBarberos;
  const relaciones = barberoId ? todasRelaciones.filter((relacion) => relacion.barberoId === barberoId) : todasRelaciones;
  const usuarios = incluirUsuarios ? todosUsuarios : [];
  const serviciosVisibles = barberoId
    ? servicios.filter((servicio) => relaciones.some((relacion) => relacion.servicioId === servicio.id))
    : servicios;
  const barberosFiltro = incluirUsuarios
    ? await prisma.barbero.findMany({ select: { id: true, nombre: true, srcImage: true }, orderBy: { nombre: "asc" } })
    : barberos;

  const serializedServicios = serviciosVisibles.map((s) => ({
    ...s,
    precio: s.precio ? Number(s.precio) : 0,
    descuento: s.descuento ? Number(s.descuento) : 0,
    senia: s.senia ? Number(s.senia) : 0,
  }));

  return { servicios: serializedServicios, barberos, barberosFiltro, usuarios, relaciones, config };
}

export default async function AdminTurnoPage() {
  const contexto = await requerirPanel();
  if (!contexto) redirect("/dashboard");
  const session = contexto.session;
  const esEmpleado = contexto.rol === "EMPLEADO";
  const [datosTurno, result] = await Promise.all([
    getTurnoData(esEmpleado ? contexto.barberoId : null, !esEmpleado),
    getTurnos(1, esEmpleado ? "TODOS" : "CONFIRMADO", undefined, esEmpleado ? contexto.barberoId ?? undefined : undefined),
  ]);
  const { servicios, barberos, barberosFiltro, usuarios, relaciones, config } = datosTurno;

  const turnosData = (result.success && result.data) ? result.data : [];
  const totalPaginasInicial = result.success && result.totalPages ? result.totalPages : 1;

  return (
    <div className="space-y-8">
      <TurnoManager
        turnosIniciales={turnosData}
        totalPaginasInicial={totalPaginasInicial}
        session={session}
        initialServicios={servicios}
        initialBarberos={barberos}
        barberosFiltro={barberosFiltro}
        initialUsuarios={usuarios}
        initialRelaciones={relaciones}
        mostrarFiltroBarbero={!esEmpleado}
        barberoIdInicial={esEmpleado ? contexto.barberoId ?? "" : ""}
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
  );
}
