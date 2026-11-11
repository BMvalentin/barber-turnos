"use client";

function quitarClave(clave: string): void {
  try {
    window.localStorage.removeItem(clave);
  } catch {
    // La mutación ya se guardó en el servidor aunque el navegador bloquee el almacenamiento.
  }
}

export function invalidarCacheServiciosPublicos(): void {
  quitarClave("barber-servicios-carrusel-v1");
}

export function invalidarCacheHorariosPublicos(): void {
  quitarClave("barber-horarios-compactos-v1");
}
