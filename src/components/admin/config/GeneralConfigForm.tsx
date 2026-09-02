// components/admin/config/GeneralConfigForm.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePageConfig } from "@/actions/configuracion/config-general.actions";
import { uploadConfigImage } from "@/actions/mercadopago/subir-config.actions";
import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";
import { comprimirImagenConfiguracion } from "@/lib/imagenes/comprimir-imagen-configuracion";
import SeccionIdentidad from "@/components/admin/config/SeccionIdentidad";
import SeccionContacto from "@/components/admin/config/SeccionContacto";
import SeccionApariencia from "@/components/admin/config/SeccionApariencia";
import SeccionImagenes from "@/components/admin/config/SeccionImagenes";
import BotonSubmitPending from "@/components/ui/boton-submit-pending";
import { CAMPOS_POR_MODULO, type IdModuloConfig } from "@/components/admin/config/modulos-config";
import type { NombreCampoImagen } from "@/components/admin/config/tipos";
import type { PlantillaColor } from "@/lib/plantillas-colores";
import type {
  DatosConfiguracion,
  DatosConfiguracionInicial,
  PageConfigData,
} from "@/types/page-config";
import { COLORES_TEMA_POR_DEFECTO } from "@/lib/contraste/colores-tema-por-defecto";

interface GeneralConfigFormProps {
  initialData: DatosConfiguracionInicial | null;
  seccionInicial: IdModuloConfig;
}

export default function GeneralConfigForm({ initialData, seccionInicial }: GeneralConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [uploadingField, setUploadingField] = useState<NombreCampoImagen | null>(null);

  const [formData, setFormData] = useState<DatosConfiguracion>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    slogan: initialData?.slogan || "",
    logo: initialData?.logo || "",
    favicon: initialData?.favicon || "",
    backgroundImage: initialData?.backgroundImage || "",
    primaryColor: initialData?.primaryColor || COLORES_TEMA_POR_DEFECTO.primario,
    secondaryColor: initialData?.secondaryColor || COLORES_TEMA_POR_DEFECTO.secundario,
    bgColor: initialData?.bgColor || COLORES_TEMA_POR_DEFECTO.fondo,
    whatsapp: initialData?.whatsapp || "",
    mapsUrl: initialData?.mapsUrl || "",
    address: initialData?.address || "",
  });

  const primaryColor = formData.primaryColor || COLORES_TEMA_POR_DEFECTO.primario;
  const secondaryColor = formData.secondaryColor || COLORES_TEMA_POR_DEFECTO.secundario;
  const colorFondo = formData.bgColor || COLORES_TEMA_POR_DEFECTO.fondo;

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const aplicarPlantilla = (plantilla: PlantillaColor) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: plantilla.primaryColor,
      secondaryColor: plantilla.secondaryColor,
      bgColor: plantilla.bgColor,
    }));
  };

  const manejarArchivo = async (file: File, campo: NombreCampoImagen) => {
    setUploadingField(campo);

    try {
      const archivoOptimizado = await comprimirImagenConfiguracion(file);
      const res = await uploadConfigImage(archivoOptimizado);
      const url = res.url;

      if (res.success && url) {
        setFormData((prev) => ({ ...prev, [campo]: url }));
      } else {
        toast.error("Error al subir la imagen", { description: res.error || "No se pudo subir la imagen." });
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      toast.error("Error al subir la imagen", { description: "Ocurrió un error al subir la imagen. Intentá de nuevo." });
    } finally {
      setUploadingField(null);
    }
  };

  const quitarImagen = (campo: NombreCampoImagen) => {
    setFormData((prev) => ({ ...prev, [campo]: "" }));
  };

  const guardarModuloActivo = () => {
    if (seccionInicial === "apariencia") {
      if (
        !esColorHexValido(primaryColor) ||
        !esColorHexValido(secondaryColor) ||
        !esColorHexValido(colorFondo)
      ) {
        toast.error("Color inválido", { description: "Usá el formato #RRGGBB (ej.: #d97706)." });
        return;
      }
    }

    const payload: PageConfigData = {};
    for (const campo of CAMPOS_POR_MODULO[seccionInicial]) {
      payload[campo] = formData[campo];
    }

    startTransition(async () => {
      const res = await updatePageConfig(payload);

      if (res.success) {
        toast.success("¡Configuración guardada con éxito!");
      } else {
        toast.error("Error al guardar", { description: res.error || "No se pudo guardar la configuración." });
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        guardarModuloActivo();
      }}
      className="mt-8 space-y-10"
    >
      <div className="space-y-10">
        {seccionInicial === "informacion-general" && (
          <SeccionIdentidad
            nombre={formData.name}
            slogan={formData.slogan}
            descripcion={formData.description}
            manejarCambio={manejarCambio}
          />
        )}

        {seccionInicial === "ubicacion-contacto" && (
          <SeccionContacto
            whatsapp={formData.whatsapp}
            mapsUrl={formData.mapsUrl}
            direccion={formData.address}
            manejarCambio={manejarCambio}
          />
        )}

        {seccionInicial === "apariencia" && (
          <SeccionApariencia
            colorPrimario={primaryColor}
            colorSecundario={secondaryColor}
            colorFondo={colorFondo}
            nombreNegocio={formData.name}
            aplicarPlantilla={aplicarPlantilla}
            manejarCambio={manejarCambio}
          />
        )}

        {seccionInicial === "imagenes" && (
          <SeccionImagenes
            logo={formData.logo}
            favicon={formData.favicon}
            fondo={formData.backgroundImage}
            campoSubiendo={uploadingField}
            manejarArchivo={manejarArchivo}
            manejarTexto={manejarCambio}
            quitarImagen={quitarImagen}
          />
        )}

        <BotonSubmitPending
          pendiente={isPending}
          deshabilitado={uploadingField !== null}
          texto="Guardar cambios"
          mostrarSpinner={false}
          claseAdicional="w-full sm:w-auto font-semibold transition-opacity hover:opacity-90"
          estiloAdicional={{
            backgroundColor: "var(--page-primary)",
            color: "var(--page-primary-foreground)",
          }}
        />
      </div>
    </form>
  );
}
