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
  precio: number;
  duracion: number;
};

type BarberoData = {
  id: string;
  nombre: string;
};

type UsuarioData = {
  id: string;
  name: string | null;
  email: string | null;
};

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

export default function CreateTurnoForm({ session }: { session: any }) {
  const [state, formAction] = useActionState(createTurno, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [servicios, setServicios] = useState<ServicioData[]>([]);
  const [barberos, setBarberos] = useState<BarberoData[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [selectedBarberoId, setSelectedBarberoId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const res = await fetch("/api/configuracion-turno"); // Endpoint simple que devuelva servicios, barberos y usuarios
      const data = await res.json();

      if (isMounted) {
        setServicios(data.servicios || []);
        setBarberos(data.barberos || []);
        setUsuarios(data.usuarios || []);
        setLoadingData(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

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
    return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Turno</h2>

      <form ref={formRef} action={formAction} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CLIENTE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Cliente</label>
            <select
              name="userId"
              required
              className="w-full p-2.5 border rounded-lg bg-gray-50"
              defaultValue={session?.user?.role === "USER" ? session?.user?.id : ""}
            >
              {session?.user?.role === "USER" ? (
                <option value={session?.user?.id}>
                  {session?.user?.name || "Usuario"}
                </option>
              ) : (
                <>
                  <option value="">-- Seleccionar Cliente --</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* BARBERO */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Barbero</label>
            <select
              name="barberoId"
              required
              value={selectedBarberoId}
              onChange={(e) => setSelectedBarberoId(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50"
            >
              <option value="">-- Seleccionar Barbero --</option>
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* SERVICIO */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Servicio</label>
            <select
              name="servicioId"
              required
              value={selectedServicioId}
              onChange={(e) => setSelectedServicioId(e.target.value)}
              className="w-full p-2.5 border rounded-lg bg-gray-50"
            >
              <option value="">-- Seleccionar Servicio --</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — ${s.precio} ({s.duracion} min)
                </option>
              ))}
            </select>
          </div>

        </div>

        <SeleccionadorHorario
          name="horarioReservado"
          servicioId={selectedServicioId}
          barberoId={selectedBarberoId}
        />

        {state.error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border">
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
      className="w-full md:w-auto md:min-w-50"
    >
      {pending ? "Procesando..." : "Confirmar Reserva"}
    </Button>
  );
}
