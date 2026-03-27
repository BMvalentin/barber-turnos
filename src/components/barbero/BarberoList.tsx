"use client";

import { deleteBarbero } from "@/actions/barbero.actions";
import { useState } from "react";
import EditBarberoModal from "./EditBarberoModal";
import { User } from "lucide-react";

type Barbero = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
  createdAt: Date;
};

export default function BarberoList({ barberos = [] }: { barberos?: Barbero[] }) {
  if (!barberos || barberos.length === 0) {
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
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="bg-black/40 border border-amber-900/30 rounded-xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all">
        
        {/* 🖼️ IMAGEN */}
        <div className="relative h-48 bg-gradient-to-br from-black to-amber-950/30">
          {barbero.srcImage ? (
            <img
              src={barbero.srcImage}
              alt={barbero.nombre || "Barbero"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-16 w-16 text-amber-500/30" />
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {barbero.nombre || "Sin nombre"}
          </h3>

          {/* BOTONES */}
          <div className="flex gap-2 pt-3 border-t border-amber-900/30">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition"
            >
              Editar
            </button>

            <form action={deleteBarbero}>
              <input type="hidden" name="id" value={barbero.id} />
              <button className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                Baja
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* MODAL EDIT */}
      {showEditModal && (
        <EditBarberoModal
          barbero={barbero}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}