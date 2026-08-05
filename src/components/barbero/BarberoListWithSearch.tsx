// components/barbero/BarberoListWithSearch.tsx
"use client";

import { useState } from "react";
import BarberoList from "./BarberoList";
import { Search } from "lucide-react";

type Barbero = any; // Usa el tipo completo que ya tienes

type Props = {
  barberos: Barbero[];
};

export default function BarberoListWithSearch({ barberos }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar barberos por nombre
  const barberosFiltrados = barberos.filter((barbero) =>
    barbero.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-amber-500" />
          <input
            type="text"
            placeholder="Buscar barbero por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-amber-200/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-amber-400 hover:text-amber-300 px-3 py-1 bg-amber-500/10 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-amber-200/50 text-sm">
          Mostrando <span className="text-white font-semibold">{barberosFiltrados.length}</span> de {barberos.length} {barberosFiltrados.length === 1 ? 'barbero' : 'barberos'}
        </p>
      </div>

      {/* Lista de barberos */}
      {barberosFiltrados.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-lg p-8 text-center">
          <p className="text-amber-200/70">
            {searchTerm 
              ? `No se encontraron barberos con el nombre "${searchTerm}"`
              : "No hay barberos cargados"
            }
          </p>
        </div>
      ) : (
        <BarberoList barberos={barberosFiltrados} />
      )}
    </div>
  );
}