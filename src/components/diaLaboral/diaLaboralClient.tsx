"use client";

import { useState, useTransition } from "react";
import { DiaLaboralList } from "@/components/diaLaboral/diaLaboralList";
import { HorariosList } from "@/components/horarios/horariosList";
import {
  deleteMargenLaboral,
  getMargenesLaborales,
} from "@/actions/margenesHorario.actions";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/confirm-modal";

export type DiaLaboral = {
  id: string;
  estado: boolean;
  dia: number;
  createdAt: Date;
  updatedAt: Date;
  margenes?: any[];
};

type DiaLaboralClientProps = {
  initialData: DiaLaboral[];
};

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function DiaLaboralClient({ initialData }: DiaLaboralClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHorariosDialogOpen, setIsHorariosDialogOpen] = useState(false);
  const [selectedDia, setSelectedDia] = useState<DiaLaboral | null>(null);
  const [margenes, setMargenes] = useState<any[]>([]);

  // ConfirmModal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [margenToDelete, setMargenToDelete] = useState<string | null>(null);

  const handleAsignarHorarios = async (dia: DiaLaboral) => {
    setSelectedDia(dia);
    startTransition(async () => {
      try {
        const margenesData = await getMargenesLaborales(dia.id);
        setMargenes(margenesData);
        setIsHorariosDialogOpen(true);
      } catch (error) {
        toast.error("Error al cargar los horarios");
      }
    });
  };

  // En lugar de abrir el modal sobre el dialog, cerramos el dialog primero
  const handleDeleteMargen = (margenId: string) => {
    setMargenToDelete(margenId);
    setIsHorariosDialogOpen(false); // cierra el panel de horarios
    setShowDeleteModal(true);       // abre la confirmación
  };

  const ejecutarEliminarMargen = () => {
    if (!margenToDelete) return;

    setShowDeleteModal(false);
    startTransition(async () => {
      const result = await deleteMargenLaboral(margenToDelete);

      if (result.success) {
        toast.success("Horario eliminado correctamente");
        // Si todavía tenemos un día seleccionado, recargamos márgenes
        if (selectedDia) {
          const margenesData = await getMargenesLaborales(selectedDia.id);
          setMargenes(margenesData);
        }
        router.refresh();
        // Volvemos a abrir el panel de horarios (opcional, si querés que siga abierto)
        setIsHorariosDialogOpen(true);
      } else {
        toast.error(result.error || "Error al eliminar el horario");
        // También reabrimos el panel para que el usuario vea el error
        setIsHorariosDialogOpen(true);
      }
      setMargenToDelete(null);
    });
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
    setMargenToDelete(null);
    // Reabrimos el panel de horarios que habíamos cerrado
    setIsHorariosDialogOpen(true);
  };

  const handleHorariosSuccess = async () => {
    if (selectedDia) {
      const margenesData = await getMargenesLaborales(selectedDia.id);
      setMargenes(margenesData);
    }
    router.refresh();
  };

  return (
    <>
      <DiaLaboralList
        diasLaborales={initialData}
        isLoading={isPending}
        onAsignarHorarios={handleAsignarHorarios}
      />

      {/* Diálogo para asignar horarios */}
      <Dialog
        open={isHorariosDialogOpen}
        onOpenChange={setIsHorariosDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border border-amber-900/30">
          <div className="py-2">
            {selectedDia && (
              <HorariosList
                diaId={selectedDia.id}
                diaNombre={DIAS_SEMANA[selectedDia.dia]}
                margenes={margenes}
                onSuccess={handleHorariosSuccess}
                onDelete={handleDeleteMargen}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar horario */}
      <ConfirmModal
        open={showDeleteModal}
        title="Eliminar horario"
        description="¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={ejecutarEliminarMargen}
        onCancel={cancelarEliminacion}
      />
    </>
  );
}