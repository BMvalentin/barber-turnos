"use client";

import { useState } from "react";
import { Clock, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { DialogContent } from "@/components/ui/dialog/DialogContent";
import { DialogHeader } from "@/components/ui/dialog/DialogHeader";
import { DialogTitle } from "@/components/ui/dialog/DialogTitle";
import { HorariosForm } from "@/components/horarios/horariosForm";
import type { MargenLaboralCreado } from "@/types/horarios";

type HorariosListProps = {
  diaId: string;
  diaNombre: string;
  margenes: MargenLaboralCreado[];
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
  const [editingMargen, setEditingMargen] = useState<MargenLaboralCreado | null>(null);

  const handleCreate = () => {
    setEditingMargen(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (margen: MargenLaboralCreado) => {
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
        style={{ borderColor: `var(--page-secondary-40)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              backgroundColor: `var(--page-primary-20)`,
              color: "var(--page-primary)",
              border: `1px solid var(--page-primary-40)`
            }}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-[var(--admin-texto-primario)]">
              Horarios - {diaNombre}
            </h3>
            {margenes.length > 0 && (
              <Badge
                className="border text-xs px-2.5 py-0.5"
                style={{
                  backgroundColor: `var(--page-primary-20)`,
                  color: "var(--page-primary)",
                  borderColor: `var(--page-primary-60)`,
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
          className="text-[var(--page-primary-foreground)] shadow-md hover:opacity-90 transition-all mr-6"
          style={{
            backgroundColor: "var(--page-primary)",
            border: `1px solid var(--page-secondary)`,
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Agregar
        </Button>
      </div>

      {/* EMPTY */}
      {margenes.length === 0 ? (
        <EmptyState
          icono={<Clock />}
          mensaje="No hay horarios"
          claseContenedor="rounded-xl p-10 backdrop-blur-lg shadow-xl"
          estiloContenedor={{
            backgroundColor: "var(--page-secondary-15)",
            border: "1px solid var(--page-secondary-40)",
          }}
          claseIcono="h-10 w-10 opacity-60"
          estiloIcono={{ color: "var(--page-primary-tinta)" }}
          claseMensaje="text-[var(--admin-texto-primario)] font-medium"
        />
      ) : (
        <div className="space-y-3">
          {margenes.map((margen) => (
            <div
              key={margen.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-150 ${margen.estado
                  ? ""
                  : "opacity-60"
                }`}
              style={{
                backgroundColor: margen.estado ? `var(--page-secondary-18)` : `var(--page-secondary-08)`,
                borderColor: margen.estado ? `var(--page-secondary-60)` : `var(--page-secondary-20)`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: `var(--page-primary-20)`,
                    color: "var(--page-primary)",
                  }}
                >
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-[var(--admin-texto-primario)]">
                      {margen.desde}
                    </span>
                    <span style={{ color: "var(--page-primary-tinta)" }}>→</span>
                    <span className="font-mono text-lg text-[var(--admin-texto-primario)]">
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
                  className="text-[var(--page-primary-foreground)] hover:opacity-95"
                  style={{
                    backgroundColor: "var(--page-primary)",
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
              backgroundColor: `var(--page-secondary-25)`,
              border: `1px solid var(--page-secondary-70)`,
              boxShadow: `0 25px 50px -12px var(--page-secondary-44)`
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl text-[var(--admin-texto-primario)]">
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