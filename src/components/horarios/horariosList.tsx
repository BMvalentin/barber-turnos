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
  primaryColor: string;
  secondaryColor: string;
};

export function HorariosList({
  diaId,
  diaNombre,
  margenes,
  onSuccess,
  onDelete,
  primaryColor,
  secondaryColor,
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
    <div className="space-y-4 p-1">
      {/* HEADER */}
      <div
        className="flex items-center justify-between pb-4 border-b"
        style={{ borderColor: `${secondaryColor}40` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              backgroundColor: `${primaryColor}20`,
              color: primaryColor,
              border: `1px solid ${primaryColor}40`
            }}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">
              Horarios - {diaNombre}
            </h3>
            {margenes.length > 0 && (
              <Badge
                className="border text-xs px-2.5 py-0.5"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                  borderColor: `${primaryColor}60`,
                }}
              >
                {margenes.length}
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={handleCreate}
          size="sm"
          className="text-white shadow-md hover:opacity-90 transition-all mr-6"
          style={{
            backgroundColor: primaryColor,
            border: `1px solid ${secondaryColor}`,
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {/* EMPTY */}
      {margenes.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center backdrop-blur-lg shadow-xl"
          style={{
            backgroundColor: `${secondaryColor}15`,
            border: `1px solid ${secondaryColor}40`
          }}
        >
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-60" style={{ color: primaryColor }} />
          <p className="text-white font-medium">No hay horarios</p>
        </div>
      ) : (
        <div className="space-y-3">
          {margenes.map((margen) => (
            <div
              key={margen.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all backdrop-blur-md shadow-lg ${margen.estado
                  ? ""
                  : "opacity-60"
                }`}
              style={{
                backgroundColor: margen.estado ? `${secondaryColor}18` : `${secondaryColor}08`,
                borderColor: margen.estado ? `${secondaryColor}60` : `${secondaryColor}20`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                  }}
                >
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-white">
                      {margen.desde}
                    </span>
                    <span style={{ color: primaryColor }}>→</span>
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
                  className="text-white hover:opacity-95"
                  style={{
                    backgroundColor: primaryColor,
                  }}
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
        <DialogContent className="max-w-md p-0 bg-transparent border-none [&>button]:text-white [&>button]:hover:opacity-80">
          <div
            className="backdrop-blur-xl rounded-xl p-6 space-y-6 shadow-2xl"
            style={{
              backgroundColor: `${secondaryColor}25`,
              border: `1px solid ${secondaryColor}70`,
              boxShadow: `0 25px 50px -12px ${secondaryColor}44`
            }}
          >
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
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}