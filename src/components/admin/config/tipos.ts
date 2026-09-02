// components/admin/config/tipos.ts

import type { PlantillaColor } from "@/lib/plantillas-colores";

export type NombreCampoImagen = "logo" | "favicon" | "backgroundImage";

export type ManejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => void;

export type ManejarArchivo = (
    archivo: File,
    campo: NombreCampoImagen
) => void;

export type AplicarPlantilla = (plantilla: PlantillaColor) => void;
