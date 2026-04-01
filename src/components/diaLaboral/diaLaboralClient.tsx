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

  const handleDeleteMargen = async (margenId: string) => {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return;

    startTransition(async () => {
      const result = await deleteMargenLaboral(margenId);

      if (result.success) {
        toast.success("Horario eliminado correctamente");
        // Recargar márgenes
        if (selectedDia) {
          const margenesData = await getMargenesLaborales(selectedDia.id);
          setMargenes(margenesData);
        }
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el horario");
      }
    });
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
    </>
  );
}