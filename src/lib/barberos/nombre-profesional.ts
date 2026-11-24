export const NOMBRE_PROVISIONAL_BARBERO = "Sin nombre";

export function obtenerNombreProfesional(nombre: string | null | undefined): string | undefined {
  const limpio = nombre?.trim();
  return limpio && limpio.toLowerCase() !== NOMBRE_PROVISIONAL_BARBERO.toLowerCase()
    ? limpio
    : undefined;
}

export function nombreVisibleBarbero(nombre: string | null | undefined): string {
  return obtenerNombreProfesional(nombre) ?? "Perfil sin nombre";
}
