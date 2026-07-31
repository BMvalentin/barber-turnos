// components/admin/config/GeneralConfigForm.tsx
"use client";

import { useState, useTransition } from "react";
import { updatePageConfig, updateWhatsappConfig } from "@/actions/configPage";

interface GeneralConfigFormProps {
    initialData: {
        name?: string | null;
        description?: string | null;
        slogan?: string | null;
        logo?: string | null;
        favicon?: string | null;
        primaryColor?: string | null;
        secondaryColor?: string | null;
        whatsapp?: string | null;
    } | null;
}

export default function GeneralConfigForm({ initialData }: GeneralConfigFormProps) {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        slogan: initialData?.slogan || "",
        logo: initialData?.logo || "",
        favicon: initialData?.favicon || "",
        primaryColor: initialData?.primaryColor || "#3b82f6",
        secondaryColor: initialData?.secondaryColor || "#1e3a8a",
        whatsapp: initialData?.whatsapp || "",
    });

    const primaryColor = formData.primaryColor || "#3b82f6";
    const secondaryColor = formData.secondaryColor || "#1e3a8a";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "logo" | "favicon") => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tu_upload_preset");
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "tu_cloud_name";

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: data,
                }
            );

            const fileData = await response.json();

            if (fileData.secure_url) {
                setFormData((prev) => ({ ...prev, [fieldName]: fileData.secure_url }));
            }
        } catch (error) {
            console.error("Error al subir la imagen a Cloudinary:", error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");

        startTransition(async () => {
            const res = await updatePageConfig(formData);

            if (formData.whatsapp) {
                await updateWhatsappConfig(formData.whatsapp);
            }

            if (res.success) {
                setSuccessMessage("¡Configuración guardada con éxito!");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
                <div className="p-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg text-sm">
                    {successMessage}
                </div>
            )}

            {/* Nombre y Slogan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Negocio</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                        style={{ border: `1px solid ${secondaryColor}60` }}
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
                        style={{ border: `1px solid ${secondaryColor}60` }}
                    />
                </div>
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                    style={{ border: `1px solid ${secondaryColor}60` }}
                />
            </div>

            {/* WhatsApp */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp de Contacto</label>
                <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Ej: 5491112345678"
                    className="w-full bg-black/60 rounded-lg p-2.5 text-white focus:outline-none transition-all"
                    style={{ border: `1px solid ${secondaryColor}60` }}
                />
            </div>

            {/* Colores */}
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
                            style={{ border: `1px solid ${secondaryColor}60` }}
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
                            style={{ border: `1px solid ${secondaryColor}60` }}
                        />
                    </div>
                </div>
            </div>

            {/* Logo y Favicon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Logo del Negocio</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCloudinaryUpload(e, "logo")}
                        className="w-full bg-black/60 rounded-lg p-2 text-white cursor-pointer text-sm transition-all"
                        style={{
                            border: `1px solid ${secondaryColor}60`,
                        }}
                    />
                    {formData.logo && (
                        <div className="mt-2 flex items-center gap-2">
                            <img src={formData.logo} alt="Logo preview" className="h-10 object-contain bg-white/10 p-1 rounded" />
                            <span className="text-xs text-gray-400 truncate">{formData.logo}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Favicon</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCloudinaryUpload(e, "favicon")}
                        className="w-full bg-black/60 rounded-lg p-2 text-white cursor-pointer text-sm transition-all"
                        style={{
                            border: `1px solid ${secondaryColor}60`,
                        }}
                    />
                    {formData.favicon && (
                        <div className="mt-2 flex items-center gap-2">
                            <img src={formData.favicon} alt="Favicon preview" className="h-6 w-6 object-contain bg-white/10 p-1 rounded" />
                            <span className="text-xs text-gray-400 truncate">{formData.favicon}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Botón de Guardar */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-md hover:opacity-95"
                style={{
                    backgroundColor: primaryColor,
                    border: `1px solid ${secondaryColor}`,
                }}
            >
                {isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
        </form>
    );
}