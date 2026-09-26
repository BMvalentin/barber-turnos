"use client";

import { Button } from "@/components/ui/button/Button";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRetroalimentacionAccion } from "@/hooks/useRetroalimentacionAccion";
import { updateBarbero } from "@/actions/barberos/editar.actions";
import { uploadBarberImages } from "@/actions/barberos/subir-imagenes.actions";
import { esImagenValida } from "@/lib/es-imagen-valida";
import { useImagenServicio } from "@/hooks/useImagenServicio";
import type { ServicioOpcion, DiaLaboral, BarberoEdicion } from "@/types/barbero";
import CampoNombreBarbero from "./CampoNombreBarbero";
import SeccionImagenServicio from "@/components/servicio/SeccionImagenServicio";
import SelectorServicios from "./SelectorServicios";
import SelectorHorarios from "./SelectorHorarios";
import ModalBase from "@/components/ui/ModalBase";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";

type EditBarberoModalProps = {
  barbero: BarberoEdicion;
  servicios: ServicioOpcion[];
  diasLaborales: DiaLaboral[];
  onClose: () => void;
  soloEdicionPropia?: boolean;
  perfilPropio?: boolean;
};

function mismosIds(primeros: string[], segundos: string[]): boolean {
  if (primeros.length !== segundos.length) return false;

  const primerosOrdenados = [...primeros].sort();
  const segundosOrdenados = [...segundos].sort();
  return primerosOrdenados.every((id, indice) => id === segundosOrdenados[indice]);
}

export default function EditBarberoModal({
  barbero,
  servicios,
  diasLaborales,
  soloEdicionPropia = false,
  perfilPropio = false,
  onClose,
}: EditBarberoModalProps) {
  const [isPending, startTransition] = useTransition();
  const { retroalimentar } = useRetroalimentacionAccion({
    mensajeExito: perfilPropio ? "Perfil actualizado" : "Barbero actualizado",
    descripcionExito: perfilPropio
      ? "Los cambios de tu perfil se guardaron correctamente."
      : "Los cambios se han guardado correctamente.",
    descripcionError: "Error al actualizar el barbero",
    refrescar: true,
    onExito: onClose,
  });
  const [nombre, setNombre] = useState(barbero.nombre || "");
  const [estado, setEstado] = useState(barbero.estado);
  const serviciosIniciales = barbero.servicios?.map((s) => s.servicio.id) || [];
  const horariosIniciales = barbero.horarios?.map((h) => h.margenLaboralId) || [];
  const [selectedServicios, setSelectedServicios] = useState<string[]>(
    serviciosIniciales
  );
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>(
    horariosIniciales
  );
  const [showServicios, setShowServicios] = useState(false);
  const [showHorarios, setShowHorarios] = useState(false);
  const [uploading, setUploading] = useState(false);
  const {
    srcImage,
    previewUrl,
    uploadError,
    establecerSrcImagen,
    quitarImagen,
  } = useImagenServicio({ srcImageInicial: barbero.srcImage || "" });

  const handleFileChange = async (file: File) => {
    if (!esImagenValida(file)) {
      toast.error("Error", {
        description: "El archivo debe ser una imagen",
        duration: 4000,
      });
      return;
    }
    setUploading(true);
    try {
      const result = await uploadBarberImages([file], "barberia/barberos");
      if (result.success && result.images.length > 0) {
        establecerSrcImagen(result.images[0]);
        toast.success("Imagen subida", {
          description: "La imagen se ha subido correctamente.",
          duration: 4000,
        });
      } else {
        toast.error("Error", {
          description: "Error al subir la imagen",
          duration: 4000,
        });
      }
    } catch {
      toast.error("Error", {
        description: "Error al subir la imagen",
        duration: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateBarbero({
        id: barbero.id,
        nombre: nombre.trim(),
        srcImage: srcImage.trim() === "" ? null : srcImage.trim(),
        estado: Boolean(estado),
        serviciosIds: mismosIds(serviciosIniciales, selectedServicios)
          ? undefined
          : selectedServicios,
        margenesIds:
          soloEdicionPropia || mismosIds(horariosIniciales, selectedHorarios)
            ? undefined
            : selectedHorarios,
      });
      if (!result.success) {
        toast.error("Error", {
          description:
            typeof result.error === "string" ? result.error : "Datos inválidos",
          duration: 4000,
        });
        return;
      }
      await retroalimentar(result);
    });
  };

  return (
    <ModalBase
      onClose={onClose}
      titulo={perfilPropio ? "Editar mi perfil profesional" : "Editar Barbero"}
      maxWidth="max-w-2xl"
      overlayClase="bg-black/80 backdrop-blur-md p-4"
      contenedorClase="max-h-[90vh] overflow-y-auto bg-[var(--admin-surface)] rounded-xl p-6 space-y-6 border"
      headerClase="flex justify-between items-center border-b pb-4"
      tituloClase="text-2xl font-semibold text-[var(--admin-texto-primario)]"
      estiloHeader={{ borderColor: "var(--admin-border)" }}
      animado
    >
      <div className="space-y-4">
          <CampoNombreBarbero
            valor={nombre}
            error={null}
            onCambio={setNombre}
          />
          <div className="rounded-lg border bg-[var(--admin-item)] px-3 py-2.5 text-sm" style={{ borderColor: "var(--admin-border)" }}>
            <p className="font-semibold text-[var(--page-primary-tinta)]">Correo de la cuenta asociada</p>
            <p className="mt-1 text-[var(--admin-texto-muted)]">{barbero.usuario?.email ?? "Sin cuenta asociada"}</p>
          </div>
          <SeccionImagenServicio
            previewUrl={previewUrl}
            srcImage={srcImage}
            uploadError={uploadError}
            isPending={uploading}
            variante="barbero"
            onFileChange={handleFileChange}
            onRemove={quitarImagen}
            tituloBarbero={perfilPropio ? "Tu foto de perfil" : undefined}
          />
          <SelectorServicios
            abierto={showServicios}
            onAlternarAbierto={() => setShowServicios(!showServicios)}
            seleccionados={selectedServicios}
            opciones={servicios}
            titulo={perfilPropio ? "Mis servicios" : undefined}
            onAlternarSeleccion={(id) =>
              setSelectedServicios((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
          />
          {!soloEdicionPropia && (
            <SelectorHorarios
              abierto={showHorarios}
              onAlternarAbierto={() => setShowHorarios(!showHorarios)}
              seleccionados={selectedHorarios}
              diasLaborales={diasLaborales}
              onAlternarSeleccion={(id) =>
                setSelectedHorarios((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                )
              }
            />
          )}
          <label className="flex cursor-pointer items-center justify-between gap-4 border-t rounded-lg pt-4 text-sm font-medium text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item-hover)] focus-within:ring-2 focus-within:ring-[var(--page-focus-ring)]" style={{ borderColor: "var(--admin-border)" }}>
            <span><span className="block">Barbero activo</span><span className="mt-1 block text-xs font-normal text-[var(--admin-texto-muted)]">Los clientes podrán reservar turnos con este barbero.</span></span>
            <input
              type="checkbox"
              checked={estado}
              onChange={(e) => setEstado(e.target.checked)}
              aria-label="Barbero activo"
              role="switch"
              className="peer sr-only"
            />
            <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full border border-[var(--admin-border-fuerte)] bg-[var(--admin-item)] transition-colors duration-300 ease-in-out after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-[var(--admin-texto-primario)] after:transition-[transform,background-color] after:duration-300 after:ease-in-out peer-checked:border-[var(--page-primary)] peer-checked:bg-[var(--page-primary)] peer-checked:after:translate-x-5 peer-checked:after:bg-[var(--page-primary-foreground)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--page-focus-ring)]" />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-transparent text-[var(--admin-texto-primario)] hover:bg-[var(--admin-item)]"
            style={{
              borderColor: "var(--admin-border-fuerte)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            Cancelar
          </Button>
          <BotonSubmitPending
            pendiente={isPending}
            tipo="button"
            texto={perfilPropio ? "Guardar perfil" : "Guardar Cambios"}
            onClic={handleSubmit}
            claseAdicional="hover:opacity-90"
          />
        </div>
    </ModalBase>
  );
}
