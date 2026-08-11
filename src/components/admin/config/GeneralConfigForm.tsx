// components/admin/config/GeneralConfigForm.tsx
"use client";

import { useState, useTransition } from "react";
import { updatePageConfig } from "@/actions/configuracion/configPage";
import { uploadConfigImage } from "@/actions/mercadopago/upload-images.actions";
import { esColorHexValido } from "@/lib/contraste";
import SeccionIdentidad from "@/components/admin/config/SeccionIdentidad";
import SeccionContacto from "@/components/admin/config/SeccionContacto";
import SeccionColores from "@/components/admin/config/SeccionColores";
import SeccionImagenes from "@/components/admin/config/SeccionImagenes";
import BotonGuardar from "@/components/admin/config/BotonGuardar";
import type { NombreCampoImagen, DatosConfiguracion } from "@/components/admin/config/tipos";

interface GeneralConfigFormProps {
    initialData: {
        name?: string | null;
        description?: string | null;
        slogan?: string | null;
        logo?: string | null;
        favicon?: string | null;
        backgroundImage?: string | null;
        primaryColor?: string | null;
        secondaryColor?: string | null;
        whatsapp?: string | null;
        mapsUrl?: string | null;
        address?: string | null;
    } | null;
}

export default function GeneralConfigForm({ initialData }: GeneralConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [uploadingField, setUploadingField] = useState<NombreCampoImagen | null>(null);

    const [formData, setFormData] = useState<DatosConfiguracion>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        slogan: initialData?.slogan || "",
        logo: initialData?.logo || "",
        favicon: initialData?.favicon || "",
        backgroundImage: initialData?.backgroundImage || "",
        primaryColor: initialData?.primaryColor || "#3b82f6",
        secondaryColor: initialData?.secondaryColor || "#1e3a8a",
        whatsapp: initialData?.whatsapp || "",
        mapsUrl: initialData?.mapsUrl || "",
        address: initialData?.address || "",
    });

    const primaryColor = formData.primaryColor || "#3b82f6";
    const secondaryColor = formData.secondaryColor || "#1e3a8a";

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>, campo: NombreCampoImagen) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMessage("");
        setSuccessMessage("");
        setUploadingField(campo);

        try {
            const res = await uploadConfigImage(file);
            const url = res.url;

            if (res.success && url) {
                setFormData((prev) => ({ ...prev, [campo]: url }));
            } else {
                setErrorMessage(res.error || "No se pudo subir la imagen.");
            }
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            setErrorMessage("Ocurrió un error al subir la imagen. Intentá de nuevo.");
        } finally {
            setUploadingField(null);
            e.target.value = "";
        }
    };

    const quitarImagen = (campo: NombreCampoImagen) => {
        setFormData((prev) => ({ ...prev, [campo]: "" }));
    };

    const manejarEnvio = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        if (!esColorHexValido(primaryColor) || !esColorHexValido(secondaryColor)) {
            setSuccessMessage("");
            setErrorMessage("Color inválido. Usá el formato #RRGGBB (ej.: #d97706).");
            return;
        }

        startTransition(async () => {
            const res = await updatePageConfig(formData);

            if (res.success) {
                setSuccessMessage("¡Configuración guardada con éxito!");
            } else {
                setErrorMessage(res.error || "No se pudo guardar la configuración.");
            }
        });
    };

    const inputBorder = { border: `1px solid ${secondaryColor}60` };

    return (
        <form onSubmit={manejarEnvio} className="space-y-8">
            {successMessage && (
                <div className="p-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg text-sm">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}

            <SeccionIdentidad
                nombre={formData.name}
                slogan={formData.slogan}
                descripcion={formData.description}
                borde={inputBorder}
                manejarCambio={manejarCambio}
                colorIcono={primaryColor}
            />

            <SeccionContacto
                whatsapp={formData.whatsapp}
                mapsUrl={formData.mapsUrl}
                direccion={formData.address}
                borde={inputBorder}
                manejarCambio={manejarCambio}
                colorIcono={primaryColor}
            />

            <SeccionColores
                colorPrimario={primaryColor}
                colorSecundario={secondaryColor}
                borde={inputBorder}
                manejarCambio={manejarCambio}
                colorIcono={primaryColor}
            />

            <SeccionImagenes
                logo={formData.logo}
                favicon={formData.favicon}
                fondo={formData.backgroundImage}
                campoSubiendo={uploadingField}
                borde={inputBorder}
                manejarArchivo={manejarArchivo}
                manejarTexto={manejarCambio}
                quitarImagen={quitarImagen}
                colorIcono={primaryColor}
            />

            <BotonGuardar
                colorPrimario={primaryColor}
                colorSecundario={secondaryColor}
                pendiente={isPending}
                deshabilitado={uploadingField !== null}
            />
        </form>
    );
}