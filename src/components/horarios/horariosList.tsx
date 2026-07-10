"use client";

import { useState } from "react";
import { Clock, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HorariosForm } from "@/components/horarios/horariosForm";

type MargenLaboral = {
  id: string;
  diaId: string;
  estado: boolean;
  desde: string;
  hasta: string;
  createdAt: Date;
  updatedAt: Date;
};

type HorariosListProps = {
  diaId: string;
  diaNombre: string;
  margenes: MargenLaboral[];
  onSuccess: () => void;
  onDelete: (id: string) => void;
};

export function HorariosList({
  diaId,
  diaNombre,
  margenes,
  onSuccess,
  onDelete,
}: HorariosListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMargen, setEditingMargen] = useState<MargenLaboral | null>(null);

  const handleCreate = () => {
    setEditingMargen(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (margen: MargenLaboral) => {
    setEditingMargen(margen);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingMargen(null);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-amber-200">
            Horarios - {diaNombre}
          </h3>

          {margenes.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {margenes.length}
            </Badge>
          )}
        </div>

        <Button
          onClick={handleCreate}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white mr-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      {/* EMPTY */}
      {margenes.length === 0 ? (
        <div className="border border-amber-900/30 rounded-xl p-8 text-center bg-black/40 backdrop-blur-lg">
          <Clock className="h-12 w-12 text-amber-500/30 mx-auto mb-3" />
          <p className="text-amber-200/70">No hay horarios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {margenes.map((margen) => (
            <div
              key={margen.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                margen.estado
                  ? "bg-black/40 border-amber-900/30"
                  : "bg-black/20 border-gray-700 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-white">
                      {margen.desde}
                    </span>
                    <span className="text-amber-500">→</span>
                    <span className="font-mono text-lg text-white">
                      {margen.hasta}
                    </span>
                  </div>

                  <div className="mt-1">
                    {margen.estado ? (
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => handleEdit(margen)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  className="bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                  onClick={() => onDelete(margen.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        
        {/* 🔥 ACA ESTA EL CAMBIO DE LA X */}
        <DialogContent className="max-w-md p-0 bg-transparent border-none [&>button]:text-white [&>button]:hover:text-amber-400">

          <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 space-y-6 shadow-2xl shadow-amber-900/20">
            
            <DialogHeader>
              <DialogTitle className="text-xl text-white">
                {editingMargen ? "Editar Horario" : "Nuevo Horario"}
              </DialogTitle>
            </DialogHeader>

            <HorariosForm
              diaId={diaId}
              initialData={editingMargen}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />

          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}