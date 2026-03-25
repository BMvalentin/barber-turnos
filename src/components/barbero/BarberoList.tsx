"use client";

import { deleteBarbero } from "@/actions/barbero.actions";
import { useActionState } from "react";
import { useState } from "react";
import EditBarberoModal from "@/components/barbero/EditBarberoModal";
import { Scissors, Clock, User, Calendar } from "lucide-react";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
  createdAt: Date;
  servicios?: {
    servicio: {
      id: string;
      nombre: string;
    };
  }[];
  horarios?: {
    margenLaboral: {
      desde: string;
      hasta: string;
    };
    dia: {
      dia: number;
    };
  }[];
};

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function BarberoList({ barberos }: { barberos: Barbero[] }) {
  if (barberos.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-lg p-8 text-center">
        <User className="h-16 w-16 text-amber-500/30 mx-auto mb-4" />
        <p className="text-amber-200/70">No hay barberos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {barberos.map((barbero) => (
        <BarberoCard key={barbero.id} barbero={barbero} />
      ))}
    </div>
  );
}

function BarberoCard({ barbero }: { barbero: Barbero }) {
  const [state, formAction] = useActionState(deleteBarbero, initialState);
  const [showEditModal, setShowEditModal] = useState(false);

  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
    if (url.startsWith("/")) return true;
    return false;
  };

  const hasValidImage = isValidImageUrl(barbero.srcImage);
  const serviciosCount = barbero.servicios?.length || 0;
  const horariosCount = barbero.horarios?.length || 0;

  const horariosPorDia =
    barbero.horarios?.reduce((acc, h) => {
      const dia = h.dia.dia;
      if (!acc[dia]) acc[dia] = [];
      acc[dia].push(h.margenLaboral);
      return acc;
    }, {} as Record<number, { desde: string; hasta: string }[]>) || {};

  const diasConHorarios = Object.keys(horariosPorDia)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl shadow-lg overflow-hidden hover:border-amber-500/50 transition-all">
        
        {/* Imagen */}
        <div className="relative h-48 bg-gradient-to-br from-black to-amber-950/30">
          {hasValidImage ? (
            <img
              src={barbero.srcImage!}
              alt={barbero.nombre || "Barbero"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-16 w-16 text-amber-500/30" />
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          
          {/* Nombre */}
          <h3 className="text-lg font-semibold text-white">
            {barbero.nombre || "Sin nombre"}
          </h3>

          {/* Botones */}
          <div className="flex gap-2 pt-3 border-t border-amber-900/30">
            
            {/* EDITAR */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-semibold"
            >
              Editar
            </button>

            {/* DELETE */}
            <form action={formAction}>
              <input type="hidden" name="id" value={barbero.id} />
              <button
                type="submit"
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
              >
                Dar de baja
              </button>
            </form>
          </div>

          {/* Mensajes */}
          {state.error && (
            <p className="text-red-400 text-xs">{state.error}</p>
          )}
          {state.success && (
            <p className="text-green-400 text-xs">
              ✅ Barbero dado de baja
            </p>
          )}
        </div>
      </div>

      {/* MODAL REAL */}
      {showEditModal && (
        <EditBarberoModal
          barbero={barbero}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}