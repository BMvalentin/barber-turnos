// components/admin/config/tipos.ts

export type NombreCampoImagen = "logo" | "favicon" | "backgroundImage";

export type ManejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => void;

export type ManejarArchivo = (
    e: React.ChangeEvent<HTMLInputElement>,
    campo: NombreCampoImagen
) => void;

export interface DatosConfiguracion {
    name: string;
    description: string;
    slogan: string;
    logo: string;
    favicon: string;
    backgroundImage: string;
    primaryColor: string;
    secondaryColor: string;
    whatsapp: string;
    mapsUrl: string;
    address: string;
}
