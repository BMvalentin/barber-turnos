"use client";

import { type PointerEvent as EventoPuntero, useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

type ProporcionRecorte = number | "libre";

type RecortadorImagenModalProps = {
  archivo: File;
  proporcion?: ProporcionRecorte;
  alConfirmar: (archivo: File) => void;
  alCancelar: () => void;
};

const TAMANO_MAXIMO_SALIDA = 1600;

type InicioArrastre = {
  idPuntero: number;
  posicionHorizontal: number;
  posicionVertical: number;
  coordenadaX: number;
  coordenadaY: number;
  excedenteHorizontal: number;
  excedenteVertical: number;
};

function obtenerNombreRecortado(nombre: string, esPng: boolean) {
  const nombreSinExtension = nombre.replace(/\.[^/.]+$/, "");
  return `${nombreSinExtension || "imagen"}-recortada.${esPng ? "png" : "jpg"}`;
}

function limitarPosicion(posicion: number) {
  return Math.max(-100, Math.min(100, posicion));
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
  const [arrastrando, setArrastrando] = useState(false);
  const inicioArrastre = useRef<InicioArrastre | null>(null);
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

  const medidasImagen = useMemo(() => {
    if (!imagen) return undefined;
    const proporcionImagen = imagen.naturalWidth / imagen.naturalHeight;
    const cubrePorAncho = proporcionImagen >= proporcionEfectiva;
    const anchoBase = cubrePorAncho ? 100 * (proporcionImagen / proporcionEfectiva) : 100;
    const altoBase = cubrePorAncho ? 100 : 100 * (proporcionEfectiva / proporcionImagen);
    const ancho = anchoBase * zoom;
    const alto = altoBase * zoom;
    return {
      ancho,
      alto,
      excedenteHorizontal: Math.max(0, (ancho - 100) / 2),
      excedenteVertical: Math.max(0, (alto - 100) / 2),
    };
  }, [imagen, proporcionEfectiva, zoom]);

  const estiloImagen = useMemo(() => {
    if (!medidasImagen) return undefined;

    return {
      width: `${medidasImagen.ancho}%`,
      height: `${medidasImagen.alto}%`,
      left: `calc(50% + ${medidasImagen.excedenteHorizontal * (posicionHorizontal / 100)}%)`,
      top: `calc(50% + ${medidasImagen.excedenteVertical * (posicionVertical / 100)}%)`,
      transform: "translate(-50%, -50%)",
    };
  }, [medidasImagen, posicionHorizontal, posicionVertical]);

  const iniciarArrastre = (evento: EventoPuntero<HTMLDivElement>) => {
    if (!imagen || !medidasImagen || procesando) return;

    const rectangulo = evento.currentTarget.getBoundingClientRect();
    const excedenteHorizontal = (rectangulo.width * medidasImagen.excedenteHorizontal) / 100;
    const excedenteVertical = (rectangulo.height * medidasImagen.excedenteVertical) / 100;
    if (excedenteHorizontal === 0 && excedenteVertical === 0) return;

    inicioArrastre.current = {
      idPuntero: evento.pointerId,
      posicionHorizontal,
      posicionVertical,
      coordenadaX: evento.clientX,
      coordenadaY: evento.clientY,
      excedenteHorizontal,
      excedenteVertical,
    };
    evento.currentTarget.setPointerCapture(evento.pointerId);
    setArrastrando(true);
  };

  const moverImagen = (evento: EventoPuntero<HTMLDivElement>) => {
    const inicio = inicioArrastre.current;
    if (!inicio || inicio.idPuntero !== evento.pointerId) return;

    if (inicio.excedenteHorizontal > 0) {
      const desplazamientoHorizontal = ((evento.clientX - inicio.coordenadaX) / inicio.excedenteHorizontal) * 100;
      setPosicionHorizontal(limitarPosicion(inicio.posicionHorizontal + desplazamientoHorizontal));
    }
    if (inicio.excedenteVertical > 0) {
      const desplazamientoVertical = ((evento.clientY - inicio.coordenadaY) / inicio.excedenteVertical) * 100;
      setPosicionVertical(limitarPosicion(inicio.posicionVertical + desplazamientoVertical));
    }
  };

  const terminarArrastre = (evento: EventoPuntero<HTMLDivElement>) => {
    if (inicioArrastre.current?.idPuntero !== evento.pointerId) return;
    inicioArrastre.current = null;
    setArrastrando(false);
  };

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

        <div
          className={`relative mt-5 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-black touch-none ${imagen && !procesando ? (arrastrando ? "cursor-grabbing" : "cursor-grab") : ""}`}
          style={{ aspectRatio: String(proporcionEfectiva) }}
          onPointerDown={iniciarArrastre}
          onPointerMove={moverImagen}
          onPointerUp={terminarArrastre}
          onPointerCancel={terminarArrastre}
        >
          {urlImagen && estiloImagen ? (
            /* eslint-disable-next-line @next/next/no-img-element -- La URL temporal blob no es compatible con next/image. */
            <img src={urlImagen} alt="Previsualización del encuadre" className="absolute max-w-none select-none" style={estiloImagen} draggable={false} />
          ) : <div className="flex h-full items-center justify-center text-sm text-white/70">Cargando imagen…</div>}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-[var(--admin-texto-secundario)]">Zoom <span className="float-right text-[var(--admin-texto-muted)]">{zoom.toFixed(1)}×</span><input aria-label="Zoom de imagen" type="range" min="1" max="3" step="0.05" value={zoom} onChange={(evento) => setZoom(Number(evento.target.value))} className="mt-2 w-full accent-[var(--page-primary)]" /></label>
          <p className="self-end text-sm text-[var(--admin-texto-muted)] sm:col-span-2">Arrastrá la imagen para ajustar su posición.</p>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={alCancelar} disabled={procesando} className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-medium text-[var(--admin-texto-secundario)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:opacity-50">Cancelar</button><button type="button" onClick={confirmarRecorte} disabled={!imagen || procesando} className="rounded-lg bg-[var(--page-primary)] px-4 py-2 text-sm font-semibold text-[var(--page-primary-foreground)] transition hover:bg-[var(--page-primary-80)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50">{procesando ? "Preparando…" : "Usar este encuadre"}</button></div>
      </section>
    </div>
  );
}
