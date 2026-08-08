// components/admin/config/GeneralConfigForm.tsx
"use client";

import { useState, useTransition } from "react";
import { updatePageConfig } from "@/actions/configPage";
import { uploadConfigImage } from "@/actions/upload-images.actions";
import { Building2, MapPin, Palette, Image as ImageIcon } from "lucide-react";
import { esColorHexValido, elegirColorTexto, calcularRazonDeContraste } from "@/lib/contraste";

type ImageFieldName = "logo" | "favicon" | "backgroundImage";

interface ImageFieldProps {
    label: string;
    field: ImageFieldName;
    value: string;
    hint?: string;
    previewClassName: string;
    isUploading: boolean;
    borderStyle: React.CSSProperties;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: ImageFieldName) => void;
    onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: (field: ImageFieldName) => void;
}

// Definido fuera del form: si viviera dentro, React lo remontaría en cada
// render y el input de URL perdería el foco al tipear.
function ImageField({
    label,
    field,
    value,
    hint,
    previewClassName,
    isUploading,
    borderStyle,
    onFileChange,
    onTextChange,
    onClear,
}: ImageFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>

            <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={(e) => onFileChange(e, field)}
                className="w-full bg-black/60 rounded-lg p-2 text-white cursor-pointer text-sm transition-all disabled:opacity-50"
                style={borderStyle}
            />

            <input
                type="text"
                name={field}
                value={value}
                onChange={onTextChange}
                placeholder="…o pegá una URL de imagen"
                className="w-full mt-2 bg-black/60 rounded-lg p-2 text-white text-xs focus:outline-none transition-all"
                style={borderStyle}
            />

            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}

            {isUploading && <p className="mt-2 text-xs text-gray-400">Subiendo…</p>}

            {value && !isUploading && (
                <div className="mt-2 space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt={`Vista previa de ${label}`}
                        className={`${previewClassName} bg-white/10 p-1 rounded`}
                    />
                    <button
                        type="button"
                        onClick={() => onClear(field)}
                        className="block text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Quitar imagen
                    </button>
                </div>
            )}
        </div>
    );
}

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
    const [uploadingField, setUploadingField] = useState<ImageFieldName | null>(null);

    const [formData, setFormData] = useState({
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: ImageFieldName) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMessage("");
        setSuccessMessage("");
        setUploadingField(fieldName);

        try {
            const res = await uploadConfigImage(file);
            const url = res.url;

            if (res.success && url) {
                setFormData((prev) => ({ ...prev, [fieldName]: url }));
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

    const handleClearImage = (fieldName: ImageFieldName) => {
        setFormData((prev) => ({ ...prev, [fieldName]: "" }));
    };

    const handleSubmit = (e: React.FormEvent) => {
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

    const imageFieldHandlers = {
        borderStyle: inputBorder,
        onFileChange: handleUpload,
        onTextChange: handleChange,
        onClear: handleClearImage,
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-white">Información General</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Negocio</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                            style={inputBorder}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Slogan</label>
                        <input
                            type="text"
                            name="slogan"
                            value={formData.slogan}
                            onChange={handleChange}
                            className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                            style={inputBorder}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                    <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={inputBorder}
                    />
                </div>
            </div>

            {/* SECCIÓN 2: UBICACIÓN Y CONTACTO */}
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-white">Ubicación y Contacto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp de Contacto</label>
                        <input
                            type="text"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            placeholder="Ej: 5491112345678"
                            className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                            style={inputBorder}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">URL de Google Maps (Iframe Src)</label>
                        <input
                            type="text"
                            name="mapsUrl"
                            value={formData.mapsUrl}
                            onChange={handleChange}
                            placeholder="Pegá el link del src del mapa"
                            className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                            style={inputBorder}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Dirección del Local</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Ej: Av. Montreal 695"
                            className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                            style={inputBorder}
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: PALETA DE COLORES */}
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <Palette className="w-5 h-5" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-white">Diseño y Colores</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Color Primario</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                className="w-12 h-10 bg-transparent rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="primaryColor"
                                value={formData.primaryColor}
                                onChange={handleChange}
                                className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all font-mono"
                                style={inputBorder}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Color Secundario</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                name="secondaryColor"
                                value={formData.secondaryColor}
                                onChange={handleChange}
                                className="w-12 h-10 bg-transparent rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                name="secondaryColor"
                                value={formData.secondaryColor}
                                onChange={handleChange}
                                className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all font-mono"
                                style={inputBorder}
                            />
                        </div>
                    </div>
                </div>

                {/* Preview de contraste del color primario */}
                <div className="p-4 rounded-xl border border-amber-900/30 bg-black/40">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center text-2xl font-black"
                            style={{ backgroundColor: primaryColor, color: elegirColorTexto(primaryColor) }}
                        >
                            Aa
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">
                                {elegirColorTexto(primaryColor) === "#09090b"
                                    ? "Texto oscuro sobre este fondo"
                                    : "Texto claro sobre este fondo"}
                            </p>
                            <p className="text-xs text-amber-200/60 mt-1">
                                Contraste{" "}
                                {calcularRazonDeContraste(primaryColor, elegirColorTexto(primaryColor)).toFixed(1)}
                                :1{" "}
                                {calcularRazonDeContraste(primaryColor, elegirColorTexto(primaryColor)) >= 4.5
                                    ? "· cumple WCAG AA"
                                    : "· no alcanza WCAG AA"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: IMÁGENES Y BRANDING */}
            <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <ImageIcon className="w-5 h-5" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-white">Imágenes y Multimedia</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageField
                        label="Logo del Negocio (icono de la web)"
                        field="logo"
                        value={formData.logo}
                        hint="Se muestra en el encabezado y el pie de página."
                        previewClassName="h-10 object-contain"
                        isUploading={uploadingField === "logo"}
                        {...imageFieldHandlers}
                    />

                    <ImageField
                        label="Favicon"
                        field="favicon"
                        value={formData.favicon}
                        hint="Icono de la pestaña del navegador. Cuadrado, ideal 512×512."
                        previewClassName="h-6 w-6 object-contain"
                        isUploading={uploadingField === "favicon"}
                        {...imageFieldHandlers}
                    />
                </div>

                <div className="pt-2">
                    <ImageField
                        label="Imagen de fondo (Home)"
                        field="backgroundImage"
                        value={formData.backgroundImage}
                        hint="Se muestra atenuada detrás de la portada. Recomendado 1920×1080."
                        previewClassName="h-24 w-full object-cover"
                        isUploading={uploadingField === "backgroundImage"}
                        {...imageFieldHandlers}
                    />
                </div>
            </div>

            {/* Botón de Guardar */}
            <button
                type="submit"
                disabled={isPending || uploadingField !== null}
                className="w-full font-semibold py-3 rounded-lg transition-all disabled:opacity-50 shadow-md hover:opacity-95 text-base cursor-pointer"
                style={{
                    backgroundColor: primaryColor,
                    color: elegirColorTexto(primaryColor),
                    border: `1px solid ${secondaryColor}`,
                }}
            >
                {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
        </form>
    );
}