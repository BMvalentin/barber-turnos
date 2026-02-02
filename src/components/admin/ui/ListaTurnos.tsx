"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageCircleMoreIcon} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";
import { deleteTurno, completedTurno } from "@/actions/turno.actions";

const initialState = {
    success: false,
    error: undefined,
    data: undefined
};
const initialStateComplete = {
    success: false,
    error: undefined,
    data: undefined
};

interface TurnoConRelaciones {
  id: string;
  horarioReservado: Date;
  patente: string;
  estado: number;
  precioCongelado: number;
  seniaCongelada: number;
  user: {
    name: string | null;
    email: string;
    telefono?: string | null;
    image: string | null;
  };
  vehiculo_servicio: {
    precio: number;
    servicio: { nombre: string | null } | null;
    vehiculo: { nombre: string | null } | null;
  };
}

export default function ListaTurnos({
  turnos,
  orderBy,
  orderDir,
}: {
  turnos: TurnoConRelaciones[];
  orderBy?: string;
  orderDir?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const handleSort = (campo: string) => {
    const isActive = orderBy === campo;
    const nextDir = isActive && orderDir === "asc" ? "desc" : "asc";
    
    router.push(
      `/admin?orderBy=${campo}&orderDir=${nextDir}${currentSearch ? `&search=${currentSearch}` : ""}`
    );
  };

  const Header = ({ campo, label }: { campo: string; label: string }) => {
    const isActive = orderBy === campo;
    return (
      <th
        className={`p-2 border cursor-pointer hover:bg-blue-100 transition-colors ${
          isActive ? "bg-blue-50" : "bg-gray-50"
        }`}
        onClick={() => handleSort(campo)}
      >
        <div className="flex items-center justify-between w-full">
          <span className="underline">{label}</span>
          {isActive ? (orderDir === "asc" ? "▲" : "▼") : "↕"}
        </div>
      </th>
    );
  };

  const [state, formAction] = useActionState(deleteTurno, initialState);
  const [stateComplete, formActionComplete] = useActionState(completedTurno, initialStateComplete);
  return (
    <section className="space-y-2 my-2">
      <div>
        <p className="text-xs text-gray-500">
          Click en los encabezados para ordenar.
          {orderBy && (
            <span> Ordenando por <strong>{orderBy}</strong> ({orderDir})</span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto shadow-sm border rounded-lg">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead className="text-gray-700">
            <tr>
              <Header campo="horarioReservado" label="FECHA" />
              <Header campo="name" label="CLIENTE" />
              <Header campo="name" label="SERVICIO" />
              <Header campo="telefono" label="ESTADO" />
            </tr>
          </thead>
          <tbody className="divide-y gap-2  divide-gray-200">
            {turnos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                  No se encontraron turnos con esos criterios.
                </td>
              </tr>
            ) : (
              turnos.map((turno) => (
                <tr key={turno.id} className="hover:bg-blue-50/40 transition-colors border-2 text-center">
                  <td className="p-2 font-medium text-center">
                    {new Date(turno.horarioReservado).toLocaleString("es-AR", {
                      day: "2-digit", month: "2-digit", year: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="p-2 flex flex-row gap-5 items-center">
                    <Image src={turno.user.image || "/images/avatar-default.svg"} alt="Avatar" width={40} height={40} className="rounded-full mr-2" />
                    <div>
                      <div className="font-semibold">{turno.user.name || "Invitado"}</div>
                      <div className="text-xs text-gray-500">{turno.user.email}</div>
                      {turno.user.telefono ? (
                      <Link
                        href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        className="text-green-600 font-medium hover:underline flex items-center gap-1"
                      > 
                        <MessageCircleMoreIcon></MessageCircleMoreIcon>
                        {turno.user.telefono}
                        <small className="text-[10px]">↗</small>
                      </Link>
                    ) : "Telefono no registrado"}
                    </div>
                  </td>
                  <td className="p-2 ">
                    <div className="uppercase text-[11px] text-gray-600 font-bold">
                    {turno.vehiculo_servicio.vehiculo?.nombre || "—"}
                    </div>
                    <div className="text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                        {turno.vehiculo_servicio.servicio?.nombre || "—"}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-blue-700 uppercase">
                      {"Patente : " + turno.patente}
                    </div>
                    <div>
                      
                    </div>
                  </td>
                  <td  className="flex flex-row flex-wrap justify-around gap-5">
                    {turno.estado == 0 && <Button variant={"rojo"} className="" >Cancelado</Button>}
                    {turno.estado == 1 &&
                      <div className="flex flex-row flex-wrap justify-around gap-5">
                        <Button variant={"amarillo"} >Pendiente</Button>
                        <form action={formAction}>
                          <input type="hidden" name="id" value={turno.id} />
                          <Button
                              onClick={(e) => {
                                      if (!confirm('¿Estás seguro de cancelar este turno?')) {
                                          e.preventDefault();
                                      }
                                  }}
                              type="submit"
                              variant="rojo"
                          >
                              X
                          </Button>
                        </form>
                        <form action={formActionComplete}>
                          <input type="hidden" name="id" value={turno.id} />
                          <Button
                              onClick={(e) => {
                                      if (!confirm('¿Estás seguro de completar este turno?')) {
                                          e.preventDefault();
                                      }
                                  }}
                              type="submit"
                              variant="verde"
                          >
                              Listo
                          </Button>
                        </form>
                      </div>
                    }
                    {turno.estado == 2 && <Button variant={"verde"} className="" >Completado</Button>}
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
        {state.error && (
                        <p className="text-red-600 text-xs mt-2">{state.error}</p>
        )}
        {state.success && (
            <p className="text-green-600 text-xs mt-2">
                ✅ Turno cancelado
            </p>
        )}
        {stateComplete.error && (
            <p className="text-red-600 text-xs mt-2">{stateComplete.error}</p>
        )}
        {stateComplete.success && (
            <p className="text-green-600 text-xs mt-2">
                ✅ Turno completado
            </p>
        )}
      </div>
    </section>
  );
}