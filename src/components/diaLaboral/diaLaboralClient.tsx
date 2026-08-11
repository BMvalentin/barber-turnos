"use client";

import { useState, useTransition } from "react";
import { DiaLaboralList } from "@/components/diaLaboral/diaLaboralList";
import { HorariosList } from "@/components/horarios/horariosList";
import { deleteMargenLaboral } from "@/actions/horarios/eliminar-margen.actions";
import { getMargenesLaborales } from "@/actions/horarios/listar-margenes.actions";
import { Dialog } from "@/components/ui/dialog/Dialog";
import { DialogContent } from "@/components/ui/dialog/DialogContent";
import { DialogTitle } from "@/components/ui/dialog/DialogTitle";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import type { DiaLaboral, MargenLaboralCreado } from "@/types/horarios";
import { DIAS_SEMANA } from "@/lib/constants";

type DiaLaboralClientProps = {
  initialData: DiaLaboral[];
  isLoading?: boolean;
};

export function DiaLaboralClient({
  initialData: diasLaborales,
  isLoading = false,
}: DiaLaboralClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isHorariosDialogOpen, setIsHorariosDialogOpen] = useState(false);
  const [selectedDia, setSelectedDia] = useState<DiaLaboral | null>(null);
  const [margenes, setMargenes] = useState<MargenLaboralCreado[]>([]);

  // Estado para controlar el modal de confirmación de eliminación
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [margenAEliminar, setMargenAEliminar] = useState<string | null>(null);

  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: "Éxito",
    descripcionExito: "Horario eliminado correctamente.",
    descripcionError: "Error al eliminar el horario",
    refrescar: true,
    onExito: async () => {
      if (selectedDia) {
        const margenesData = await getMargenesLaborales(selectedDia.id);
        setMargenes(margenesData);
      }
    },
  });

  const handleAsignarHorarios = async (dia: DiaLaboral) => {
    setSelectedDia(dia);
    startTransition(async () => {
      try {
        const margenesData = await getMargenesLaborales(dia.id);
        setMargenes(margenesData);
        setIsHorariosDialogOpen(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los horarios.",
          variant: "destructive",
          duration: 4000,
        });
      }
    });
  };

  // Abre el modal de confirmación guardando el margen a eliminar
  const handleDeleteMargen = (margenId: string) => {
    setMargenAEliminar(margenId);
    setMostrarConfirmacion(true);
  };

  // Ejecuta la eliminación una vez confirmada por el usuario
  const confirmarEliminacion = () => {
    if (!margenAEliminar) return;

    const idAEliminar = margenAEliminar;
    setMostrarConfirmacion(false);
    setMargenAEliminar(null);

    startTransition(async () => {
      const result = await deleteMargenLaboral(idAEliminar);
      await retroalimentar(result);
    });
  };

  // Cancela la eliminación y cierra el modal
  const cancelarEliminacion = () => {
    setMostrarConfirmacion(false);
    setMargenAEliminar(null);
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
        diasLaborales={diasLaborales}
        isLoading={isLoading}
        onAsignarHorarios={handleAsignarHorarios}
      />

      {/* Diálogo para asignar horarios */}
      <Dialog
        open={isHorariosDialogOpen}
        onOpenChange={setIsHorariosDialogOpen}
      >
        <DialogContent
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl"
          style={{ border: "1px solid var(--page-secondary-50)" }}
          onInteractOutside={(evento) => {
            // Evita que Radix cierre este diálogo cuando la interacción
            // viene del modal de confirmación (montado vía portal en body)
            const objetivo = evento.target as HTMLElement;
            if (objetivo.closest("[data-confirm-modal]")) {
              evento.preventDefault();
            }
          }}
        >
          <DialogTitle className="sr-only">Asignar Horarios</DialogTitle>
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

      {/* Modal de confirmación, renderizado dentro del Dialog de Radix */}
      {mostrarConfirmacion && (
        <ConfirmDialog
          title="Eliminar horario"
          message="¿Estás seguro de eliminar este horario?"
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
        />
      )}
    </>
  );
}