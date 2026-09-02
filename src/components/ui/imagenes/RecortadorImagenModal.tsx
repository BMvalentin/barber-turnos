"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { X } from "lucide-react";

type ProporcionRecorte = number | "libre";

type RecortadorImagenModalProps = {
  archivo: File;
  proporcion?: ProporcionRecorte;
  alConfirmar: (archivo: File) => void;
  alCancelar: () => void;
};

const TAMANO_MAXIMO_SALIDA = 1600;

function obtenerNombreRecortado(nombre: string, esPng: boolean) {
  const nombreSinExtension = nombre.replace(/\.[^/.]+$/, "");
  return `${nombreSinExtension || "imagen"}-recortada.${esPng ? "png" : "jpg"}`;
}

export default function RecortadorImagenModal({
  archivo,
  proporcion = "libre",
  alConfirmar,
  alCancelar,
}: RecortadorImagenModalProps) {
  const [urlImagen, setUrlImagen] = useState<string | null>(null);
  const [imagen, setImagen] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [posicionHorizontal, setPosicionHorizontal] = useState(0);
  const [posicionVertical, setPosicionVertical] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tituloId = useId();
  const descripcionId = useId();

  useEffect(() => {
    const nuevaUrl = URL.createObjectURL(archivo);
    const elementoImagen = new Image();
    elementoImagen.onload = () => {
      setImagen(elementoImagen);
      setUrlImagen(nuevaUrl);
    };
    elementoImagen.onerror = () => setError("No se pudo abrir esta imagen.");
    elementoImagen.src = nuevaUrl;

    return () => URL.revokeObjectURL(nuevaUrl);
  }, [archivo]);

  useEffect(() => {
    const manejarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !procesando) alCancelar();
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [alCancelar, procesando]);

  const proporcionEfectiva = useMemo(() => {
    if (proporcion !== "libre") return Math.max(proporcion, 0.1);
    if (!imagen) return 1;
    return imagen.naturalWidth / imagen.naturalHeight;
  }, [imagen, proporcion]);

  const estiloImagen = useMemo(() => {
    if (!imagen) return undefined;
    const proporcionImagen = imagen.naturalWidth / imagen.naturalHeight;
    const cubrePorAncho = proporcionImagen < proporcionEfectiva;
    const anchoBase = cubrePorAncho ? 100 * proporcionEfectiva : 100 * proporcionImagen;
    const altoBase = cubrePorAncho ? 100 : 100 / proporcionImagen;
    const ancho = anchoBase * zoom;
    const alto = altoBase * zoom;
    const excedenteHorizontal = Math.max(0, (ancho - 100 * proporcionEfectiva) / 2);
    const excedenteVertical = Math.max(0, (alto - 100) / 2);

    return {
      width: `${ancho}%`,
      height: `${alto}%`,
      left: `calc(50% + ${excedenteHorizontal * (posicionHorizontal / 100)}%)`,
      top: `calc(50% + ${excedenteVertical * (posicionVertical / 100)}%)`,
      transform: "translate(-50%, -50%)",
    };
  }, [imagen, posicionHorizontal, posicionVertical, proporcionEfectiva, zoom]);

  const confirmarRecorte = async () => {
    if (!imagen) return;
    setProcesando(true);
    setError(null);

    try {
      const anchoSalida = TAMANO_MAXIMO_SALIDA;
      const altoSalida = Math.max(1, Math.round(anchoSalida / proporcionEfectiva));
      const lienzo = document.createElement("canvas");
      lienzo.width = anchoSalida;
      lienzo.height = altoSalida;
      const contexto = lienzo.getContext("2d");

      if (!contexto) throw new Error("No se pudo preparar el recorte.");

      const escalaBase = Math.max(anchoSalida / imagen.naturalWidth, altoSalida / imagen.naturalHeight);
      const escala = escalaBase * zoom;
      const anchoDibujado = imagen.naturalWidth * escala;
      const altoDibujado = imagen.naturalHeight * escala;
      const margenHorizontal = Math.max(0, (anchoDibujado - anchoSalida) / 2);
      const margenVertical = Math.max(0, (altoDibujado - altoSalida) / 2);
      const desplazamientoHorizontal = margenHorizontal * (posicionHorizontal / 100);
      const desplazamientoVertical = margenVertical * (posicionVertical / 100);

      contexto.drawImage(
        imagen,
        -margenHorizontal + desplazamientoHorizontal,
        -margenVertical + desplazamientoVertical,
        anchoDibujado,
        altoDibujado,
      );

      const esPng = archivo.type === "image/png";
      const tipoSalida = esPng ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, tipoSalida, 0.92));
      if (!blob) throw new Error("No se pudo crear el archivo recortado.");

      alConfirmar(new File([blob], obtenerNombreRecortado(archivo.name, esPng), { type: tipoSalida }));
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo recortar la imagen.");
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descripcionId}
        className="w-full max-w-3xl rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-4 shadow-2xl shadow-black/50 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={tituloId} className="text-lg font-semibold text-[var(--admin-texto-primario)]">Ajustar encuadre</h2>
            <p id={descripcionId} className="mt-1 text-sm text-[var(--admin-texto-muted)]">Elegí la parte de la imagen que se verá antes de subirla.</p>
          </div>
          <button type="button" onClick={alCancelar} disabled={procesando} aria-label="Cancelar recorte" className="rounded-md p-2 text-[var(--admin-texto-secundario)] transition hover:bg-white/10 hover:text-[var(--admin-texto-primario)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-black" style={{ aspectRatio: String(proporcionEfectiva) }}>
          {urlImagen && estiloImagen ? <img src={urlImagen} alt="Previsualización del encuadre" className="absolute max-w-none select-none" style={estiloImagen} draggable={false} /> : <div className="flex h-full items-center justify-center text-sm text-white/70">Cargando imagen…</div>}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-[var(--admin-texto-secundario)]">Zoom <span className="float-right text-[var(--admin-texto-muted)]">{zoom.toFixed(1)}×</span><input aria-label="Zoom de imagen" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(evento) => setZoom(Number(evento.target.value))} className="mt-2 w-full accent-[var(--page-primary)]" /></label>
          <label className="block text-sm font-medium text-[var(--admin-texto-secundario)]">Posición horizontal<input aria-label="Posición horizontal" type="range" min="-100" max="100" value={posicionHorizontal} onChange={(evento) => setPosicionHorizontal(Number(evento.target.value))} className="mt-2 w-full accent-[var(--page-primary)]" /></label>
          <label className="block text-sm font-medium text-[var(--admin-texto-secundario)]">Posición vertical<input aria-label="Posición vertical" type="range" min="-100" max="100" value={posicionVertical} onChange={(evento) => setPosicionVertical(Number(evento.target.value))} className="mt-2 w-full accent-[var(--page-primary)]" /></label>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={alCancelar} disabled={procesando} className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-medium text-[var(--admin-texto-secundario)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:opacity-50">Cancelar</button><button type="button" onClick={confirmarRecorte} disabled={!imagen || procesando} className="rounded-lg bg-[var(--page-primary)] px-4 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] transition hover:bg-[var(--page-primary-80)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50">{procesando ? "Preparando…" : "Usar este encuadre"}</button></div>
      </section>
    </div>
  );
}
