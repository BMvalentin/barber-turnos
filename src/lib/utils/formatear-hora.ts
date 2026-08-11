export function formatearHora(fecha: Date | string): string {
  return new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  } as Intl.DateTimeFormatOptions);
}
