import { obtenerNombreProfesional } from "./nombre-profesional";

type DatosPerfilProfesional = {
  nombre: string | null;
  srcImage: string | null;
  tieneServicioActivo: boolean;
  tieneHorarioActivo: boolean;
};

export type CampoPendientePerfil = "nombre" | "foto" | "servicio" | "horario";

export function obtenerCamposPendientesPerfil({
  nombre,
  srcImage,
  tieneServicioActivo,
  tieneHorarioActivo,
}: DatosPerfilProfesional): CampoPendientePerfil[] {
  const pendientes: CampoPendientePerfil[] = [];
  if (!obtenerNombreProfesional(nombre)) pendientes.push("nombre");
  if (!srcImage?.trim()) pendientes.push("foto");
  if (!tieneServicioActivo) pendientes.push("servicio");
  if (!tieneHorarioActivo) pendientes.push("horario");
  return pendientes;
}
