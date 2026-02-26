"use client";

import { createTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";

type ServicioData = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio?: any;
  duracion?: number;
  descuento?: any;
  senia?: any;
};

type BarberoData = {
  id: string;
  nombre: string;
  srcImage?: string | null;
};

type UsuarioData = {
  id: string;
  name: string | null;
  email: string | null;
};

type Props = {
  session: any;
  initialServicios?: ServicioData[];
  initialBarberos?: BarberoData[];
  initialUsuarios?: UsuarioData[];
};

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

export default function CreateTurnoForm({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
}: Props) {
  const [state, formAction] = useActionState(createTurno, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [servicios, setServicios] = useState<ServicioData[]>(initialServicios);
  const [barberos, setBarberos] = useState<BarberoData[]>(initialBarberos);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(initialUsuarios);
  const [loadingData, setLoadingData] = useState(!initialServicios.length);

  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [selectedBarberoId, setSelectedBarberoId] = useState("");

  useEffect(() => {
    // Si ya hay datos iniciales, no hacer fetch
    if (initialServicios.length > 0) {
      setLoadingData(false);
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/configuracion-turno");
        const data = await res.json();

        if (isMounted) {
          setServicios(data.servicios || []);
          setBarberos(data.barberos || []);
          setUsuarios(data.usuarios || []);
          setLoadingData(false);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoadingData(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [initialServicios.length]);

  useEffect(() => {
    if (state.success) {
      alert("✅ Turno creado correctamente");
      formRef.current?.reset();
      setSelectedServicioId("");
      setSelectedBarberoId("");
    } else if (state.error) {
      alert(`❌ Error: ${state.error}`);
    }
  }, [state]);

  if (loadingData)
    return (
      <div className="p-8 text-center text-gray-500">Cargando datos...</div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Turno</h2>

      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLIENTE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              required
              className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={
                session?.user?.role === "USER" ? session?.user?.id : ""
              }
              disabled={session?.user?.role === "USER"}
            >
              {session?.user?.role === "USER" ? (
                <option value={session?.user?.id}>
                  {session?.user?.name || "Usuario"} ({session?.user?.email})
                </option>
              ) : (
                <>
                  <option value="">-- Seleccionar Cliente --</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || "Sin nombre"} ({u.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* BARBERO */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Barbero <span className="text-red-500">*</span>
            </label>
            <select
              name="barberoId"
              required
              value={selectedBarberoId}
              onChange={(e) => setSelectedBarberoId(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seleccionar Barbero --</option>
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
            {barberos.length === 0 && (
              <p className="text-xs text-red-500">
                No hay barberos disponibles. Crea barberos primero.
              </p>
            )}
          </div>

          {/* SERVICIO */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Servicio <span className="text-red-500">*</span>
            </label>
            <select
              name="servicioId"
              required
              value={selectedServicioId}
              onChange={(e) => setSelectedServicioId(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seleccionar Servicio --</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                  {s.precio && ` - $${s.precio.toString()}`}
                  {s.duracion && ` (${s.duracion} min)`}
                  {s.descripcion && ` - ${s.descripcion}`}
                </option>
              ))}
            </select>
            {servicios.length === 0 && (
              <p className="text-xs text-red-500">
                No hay servicios disponibles. Crea servicios primero.
              </p>
            )}
          </div>
        </div>

        {/* FECHA Y HORA */}
        <SeleccionadorHorario
          name="horarioReservado"
          servicioId={selectedServicioId}
          barberoId={selectedBarberoId}
        />

        {state.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {state.error}
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full md:w-auto md:min-w-[200px] bg-blue-600 hover:bg-blue-700"
    >
      {pending ? "Procesando..." : "Confirmar Reserva"}
    </Button>
  );
}