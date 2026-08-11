// components/admin/config/tipos.ts

export type NombreCampoImagen = "logo" | "favicon" | "backgroundImage";

export type ManejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => void;

export type ManejarArchivo = (
    e: React.ChangeEvent<HTMLInputElement>,
    campo: NombreCampoImagen
) => void;
