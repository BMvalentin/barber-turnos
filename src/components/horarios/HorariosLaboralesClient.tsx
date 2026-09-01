"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import SelectorEmpleado from "@/components/horarios/SelectorEmpleado";
import CopiarHorario from "@/components/horarios/CopiarHorario";
import EncabezadoHorarios from "@/components/horarios/EncabezadoHorarios";
import { TablaDiasBarbero, type EstadoDiaEditor } from "@/components/horarios/TablaDiasBarbero";
import { construirEstado, ESTADO_INICIAL_DIA } from "@/components/horarios/construir-estado-dias";
import { estadoDesdeDiasGuardados } from "@/components/horarios/estado-desde-dias-guardados";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { guardarHorariosBarbero } from "@/actions/horarios/guardar-horarios-barbero.actions";
import { removerHorarioDeBarbero } from "@/actions/barberos/remover-horario.actions";
import { ActionStateInicialSimple } from "@/types/action-state";
import { DIAS_SEMANA } from "@/lib/constants";
import type { BarberoParaHorarios, DiaLaboral, HorarioDiaBarbero } from "@/types/horarios";

type Props = {
  diasLaborales: DiaLaboral[];
  barberos: BarberoParaHorarios[];
};

export function HorariosLaboralesClient({ diasLaborales, barberos }: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [barberoId, setBarberoId] = useState(() => barberos[0]?.id ?? "");
  const [valores, setValores] = useState<Record<string, EstadoDiaEditor>>(() =>
    construirEstado(barberos, diasLaborales, barberos[0]?.id ?? ""),
  );
  const [eliminarDia, setEliminarDia] = useState<{ diaId: string; asignacionIds: string[] } | null>(null);

  const tarjetaRef = useRef<HTMLElement | null>(null);
  const diaAEliminarRef = useRef<string | null>(null);
  const diasGuardadosRef = useRef<HorarioDiaBarbero[]>([]);

  const diasTabla = diasLaborales.map((dia) => ({
    diaId: dia.id, dia: dia.dia, nombre: DIAS_SEMANA[dia.dia] ?? "",
  }));
  const destinos = barberos.filter((b) => b.id !== barberoId);

  const { retroalimentar: retroalimentarGuardado } = useRetroalimentacionAccion({
    mensajeExito: "Horario guardado",
    descripcionExito: "Los horarios del empleado se guardaron correctamente.",
    descripcionError: "Error al guardar los horarios",
    onExito: () => {
      setValores(estadoDesdeDiasGuardados(diasGuardadosRef.current, valores));
      router.refresh();
    },
  });

  const { retroalimentar: retroalimentarEliminado } = useRetroalimentacionAccion({
    mensajeExito: "Horario eliminado",
    descripcionExito: "El horario del día se eliminó correctamente.",
    descripcionError: "Error al eliminar el horario",
    onExito: () => {
      const diaId = diaAEliminarRef.current;
      if (diaId) setValores((prev) => ({ ...prev, [diaId]: { ...ESTADO_INICIAL_DIA } }));
      router.refresh();
    },
  });

  const alCambiarBarbero = (id: string) => {
    setBarberoId(id);
    setValores(construirEstado(barberos, diasLaborales, id));
  };

  const alAlternarTrabajo = (diaId: string, trabaja: boolean) => {
    setValores((prev) => ({ ...prev, [diaId]: { ...(prev[diaId] ?? ESTADO_INICIAL_DIA), trabaja } }));
  };

  const alCambiar = (diaId: string, indiceRango: number, campo: "desde" | "hasta", valor: string) => {
    setValores((prev) => {
      const actualizado = { ...(prev[diaId] ?? ESTADO_INICIAL_DIA) };
      actualizado.rangos = actualizado.rangos.map((r, i) =>
        i === indiceRango ? { ...r, [campo]: valor } : r,
      );
      return { ...prev, [diaId]: actualizado };
    });
  };

  const alAgregarRango = (diaId: string) => {
    setValores((prev) => {
      const actualizado = { ...(prev[diaId] ?? ESTADO_INICIAL_DIA) };
      actualizado.rangos = [...actualizado.rangos, { desde: "", hasta: "" }];
      return { ...prev, [diaId]: actualizado };
    });
  };

  const alQuitarRango = (diaId: string, indiceRango: number) => {
    setValores((prev) => {
      const actualizado = { ...(prev[diaId] ?? ESTADO_INICIAL_DIA) };
      const rangos = actualizado.rangos.filter((_, i) => i !== indiceRango);
      actualizado.rangos = rangos.length > 0 ? rangos : [{ desde: "", hasta: "" }];
      return { ...prev, [diaId]: actualizado };
    });
  };

  const construirDiasParaGuardar = (): HorarioDiaBarbero[] =>
    diasLaborales.map((dia) => {
      const estado = valores[dia.id];
      return {
        diaId: dia.id,
        trabaja: estado?.trabaja ?? false,
        rangos: estado?.trabaja ? estado.rangos : [],
      };
    });

  const alGuardar = () => {
    if (!barberoId) return;
    const barberoIdActual = barberoId;
    diasGuardadosRef.current = construirDiasParaGuardar();
    startTransition(async () => {
      const resultado = await guardarHorariosBarbero(
        barberoIdActual,
        diasGuardadosRef.current,
      );
      await retroalimentarGuardado(resultado);
    });
  };

  const alEliminarDia = (diaId: string, asignacionIds: string[]) =>
    setEliminarDia({ diaId, asignacionIds });

  const confirmarEliminacion = () => {
    if (!eliminarDia) return;
    const { diaId, asignacionIds } = eliminarDia;
    setEliminarDia(null);
    diaAEliminarRef.current = diaId;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("ids", JSON.stringify(asignacionIds));
      const resultado = await removerHorarioDeBarbero(ActionStateInicialSimple, formData);
      await retroalimentarEliminado(resultado);
    });
  };

  const alCopiar = (barberoDestinoId: string) => {
    if (!barberoId) return;
    diasGuardadosRef.current = construirDiasParaGuardar();
    startTransition(async () => {
      const resultado = await guardarHorariosBarbero(
        barberoDestinoId,
        diasGuardadosRef.current,
      );
      await retroalimentarGuardado(resultado);
    });
  };

  const cancelarCambios = () =>
    setValores(construirEstado(barberos, diasLaborales, barberoId));

  const alNuevoHorario = () => {
    const objetivo = barberos.find((b) => b.horarios.length === 0) ?? barberos[0];
    if (!objetivo) return;
    alCambiarBarbero(objetivo.id);
    requestAnimationFrame(() =>
      tarjetaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <div className="space-y-8">
      <EncabezadoHorarios hayEmpleados={barberos.length > 0} alNuevoHorario={alNuevoHorario} />

      {barberos.length === 0 ? (
        <EmptyState
          icono={<Clock className="h-10 w-10" />}
          titulo="No hay empleados configurados"
          mensaje="Creá un barbero en el panel para poder asignarle horarios."
        />
      ) : (
        <section
          ref={tarjetaRef}
          className="rounded-xl bg-[var(--admin-surface)] p-6"
          style={{ border: "1px solid var(--admin-border)" }}
        >
          <h2 className="text-lg font-semibold text-[var(--admin-texto-primario)]">
            Registrar / Editar horario
          </h2>
          <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
            Seleccioná el empleado y configurá sus días de trabajo.
          </p>

          <div className="mt-5">
            <SelectorEmpleado barberos={barberos} valor={barberoId} alCambiar={alCambiarBarbero} />
          </div>

          <div className="mt-5">
            <TablaDiasBarbero
              dias={diasTabla}
              valores={valores}
              alCambiar={alCambiar}
              alAlternarTrabajo={alAlternarTrabajo}
              alAgregarRango={alAgregarRango}
              alQuitarRango={alQuitarRango}
              alEliminarDia={alEliminarDia}
            />
          </div>

          <div
            className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "var(--admin-border)" }}
          >
            <CopiarHorario destinos={destinos} pendiente={pendiente} alCopiar={alCopiar} />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={cancelarCambios}
                className="text-[var(--admin-texto-muted)] hover:text-[var(--admin-texto-primario)]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={pendiente || !barberoId}
                onClick={alGuardar}
                className="bg-[var(--page-primary)] text-[var(--page-primary-foreground)] hover:bg-[var(--page-primary-hover)]"
              >
                <Save className="h-4 w-4" />
                Guardar horario
              </Button>
            </div>
          </div>
        </section>
      )}

      {eliminarDia && (
        <ConfirmDialog
          title="Eliminar horario"
          message="¿Estás seguro de eliminar este horario del día?"
          onConfirm={confirmarEliminacion}
          onCancel={() => setEliminarDia(null)}
        />
      )}
    </div>
  );
}
