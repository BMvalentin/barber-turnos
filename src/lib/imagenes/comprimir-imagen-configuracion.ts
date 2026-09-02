function tieneTransparencia(contexto: CanvasRenderingContext2D, ancho: number, alto: number): boolean {
  const pixeles = contexto.getImageData(0, 0, ancho, alto).data;

  for (let indice = 3; indice < pixeles.length; indice += 4) {
    if (pixeles[indice] < 255) return true;
  }

  return false;
}

function crearArchivoOptimizado(blob: Blob, nombreOriginal: string): File {
  const extension = blob.type === "image/png" ? "png" : "jpg";
  const nombreBase = nombreOriginal.replace(/\.[^/.]+$/, "") || "imagen";
  return new File([blob], `${nombreBase}-optimizada.${extension}`, { type: blob.type });
}

function convertirLienzoEnBlob(lienzo: HTMLCanvasElement, tipo: "image/jpeg" | "image/png"): Promise<Blob> {
  return new Promise((resolver, rechazar) => {
    lienzo.toBlob(
      (blob) => {
        if (blob) {
          resolver(blob);
          return;
        }

        rechazar(new Error("No se pudo optimizar la imagen."));
      },
      tipo,
      tipo === "image/jpeg" ? 0.86 : undefined,
    );
  });
}

export async function comprimirImagenConfiguracion(archivo: File): Promise<File> {
  const urlTemporal = URL.createObjectURL(archivo);

  try {
    const imagen = await new Promise<HTMLImageElement>((resolver, rechazar) => {
      const elementoImagen = new Image();
      elementoImagen.onload = () => resolver(elementoImagen);
      elementoImagen.onerror = () => rechazar(new Error("No se pudo abrir la imagen para optimizarla."));
      elementoImagen.src = urlTemporal;
    });
    const lienzo = document.createElement("canvas");
    lienzo.width = imagen.naturalWidth;
    lienzo.height = imagen.naturalHeight;
    const contexto = lienzo.getContext("2d");

    if (!contexto) throw new Error("No se pudo preparar la imagen para optimizarla.");

    contexto.drawImage(imagen, 0, 0);
    const tipoSalida = tieneTransparencia(contexto, lienzo.width, lienzo.height) ? "image/png" : "image/jpeg";
    const blob = await convertirLienzoEnBlob(lienzo, tipoSalida);
    return crearArchivoOptimizado(blob, archivo.name);
  } finally {
    URL.revokeObjectURL(urlTemporal);
  }
}
