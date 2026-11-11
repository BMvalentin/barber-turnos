"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

type PosicionLista = {
  izquierda: number;
  arriba: number;
  ancho: number;
  anchoMinimo: number;
  altoMaximo: number;
};

export type OpcionDesplegable<T extends string = string> = {
  valor: T;
  etiqueta: string;
  distintivos?: readonly string[];
  icono?: ReactNode;
  deshabilitado?: boolean;
};

type Props<T extends string> = {
  opciones: readonly OpcionDesplegable<T>[];
  valor?: T;
  valorInicial?: T;
  onChange?: (valor: T) => void;
  etiquetaAria?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  deshabilitado?: boolean;
  cargando?: boolean;
  obligatorio?: boolean;
  className?: string;
  claseBoton?: string;
};

function normalizarBusqueda(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

export default function SelectorDesplegable<T extends string>({
  opciones,
  valor: valorControlado,
  valorInicial,
  onChange,
  etiquetaAria,
  placeholder = "Seleccionar...",
  id,
  name,
  deshabilitado = false,
  cargando = false,
  obligatorio = false,
  className,
  claseBoton,
}: Props<T>) {
  const [abierto, setAbierto] = useState(false);
  const [valorInterno, setValorInterno] = useState<T | undefined>(valorInicial);
  const [posicionLista, setPosicionLista] = useState<PosicionLista | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const opcionesRef = useRef<Array<HTMLButtonElement | null>>([]);
  const busquedaRef = useRef("");
  const temporizadorBusquedaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idGenerado = useId();
  const idLista = `${idGenerado}-opciones`;
  const valorActual = valorControlado !== undefined
    ? valorControlado
    : valorInterno ?? opciones[0]?.valor ?? "";
  const opcionSeleccionada = opciones.find((opcion) => opcion.valor === valorActual);
  const indiceSeleccionado = opciones.findIndex(
    (opcion) => opcion.valor === valorActual && !opcion.deshabilitado,
  );
  const indiceInicial = indiceSeleccionado >= 0
    ? indiceSeleccionado
    : opciones.findIndex((opcion) => !opcion.deshabilitado);
  const listaPosicionada = posicionLista !== null;

  useEffect(() => {
    if (!abierto || deshabilitado) return;

    const alPresionarFuera = (evento: PointerEvent) => {
      if (
        evento.target instanceof Node &&
        !contenedorRef.current?.contains(evento.target) &&
        !listaRef.current?.contains(evento.target)
      ) {
        busquedaRef.current = "";
        setAbierto(false);
        setPosicionLista(null);
      }
    };

    document.addEventListener("pointerdown", alPresionarFuera);
    return () => document.removeEventListener("pointerdown", alPresionarFuera);
  }, [abierto, deshabilitado]);

  useEffect(() => {
    if (abierto && !deshabilitado && listaPosicionada && indiceInicial >= 0) {
      opcionesRef.current[indiceInicial]?.focus();
    }
  }, [abierto, deshabilitado, indiceInicial, listaPosicionada]);

  useEffect(() => {
    if (!abierto || deshabilitado || opciones.length === 0) return;

    const calcularPosicion = () => {
      const rectangulo = botonRef.current?.getBoundingClientRect();
      if (!rectangulo) return;

      const margen = 8;
      const altoDeseado = Math.min(288, opciones.length * 42 + 12);
      const espacioAbajo = Math.max(0, window.innerHeight - rectangulo.bottom - margen);
      const espacioArriba = Math.max(0, rectangulo.top - margen);
      const abrirArriba = espacioAbajo < altoDeseado && espacioArriba > espacioAbajo;
      const espacioDisponible = abrirArriba ? espacioArriba : espacioAbajo;
      const altoMaximo = Math.max(48, Math.min(288, espacioDisponible));
      const altoMenu = Math.min(altoDeseado, altoMaximo);
      const anchoViewport = Math.max(1, window.innerWidth - margen * 2);
      const anchoMinimo = Math.min(230, anchoViewport);
      const ancho = Math.min(Math.max(rectangulo.width, anchoMinimo), anchoViewport);
      const izquierda = Math.min(
        Math.max(rectangulo.left, margen),
        window.innerWidth - ancho - margen,
      );

      setPosicionLista({
        izquierda,
        arriba: abrirArriba ? rectangulo.top - altoMenu - margen : rectangulo.bottom + margen,
        ancho,
        anchoMinimo,
        altoMaximo,
      });
    };

    let frame = window.requestAnimationFrame(calcularPosicion);
    const recalcularPosicion = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(calcularPosicion);
    };

    window.addEventListener("resize", recalcularPosicion);
    window.addEventListener("scroll", recalcularPosicion, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", recalcularPosicion);
      window.removeEventListener("scroll", recalcularPosicion, true);
    };
  }, [abierto, deshabilitado, opciones.length]);

  useEffect(() => {
    if (valorControlado !== undefined) return;
    const formulario = contenedorRef.current?.closest("form");
    if (!formulario) return;

    const restablecerValor = () => setValorInterno(valorInicial ?? opciones[0]?.valor);
    formulario.addEventListener("reset", restablecerValor);
    return () => formulario.removeEventListener("reset", restablecerValor);
  }, [opciones, valorControlado, valorInicial]);

  useEffect(() => () => {
    if (temporizadorBusquedaRef.current) clearTimeout(temporizadorBusquedaRef.current);
  }, []);

  const limpiarBusqueda = () => {
    busquedaRef.current = "";
    if (temporizadorBusquedaRef.current) {
      clearTimeout(temporizadorBusquedaRef.current);
      temporizadorBusquedaRef.current = null;
    }
  };

  const seleccionar = (opcion: OpcionDesplegable<T>) => {
    if (opcion.deshabilitado) return;
    if (valorControlado === undefined) setValorInterno(opcion.valor);
    onChange?.(opcion.valor);
    limpiarBusqueda();
    setAbierto(false);
    setPosicionLista(null);
    botonRef.current?.focus();
  };

  const manejarTecladoLista = (evento: KeyboardEvent<HTMLUListElement>) => {
    const focoActual = opcionesRef.current.findIndex((opcion) => opcion === document.activeElement);
    let siguienteIndice: number | null = null;

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      const direccion = evento.key === "ArrowDown" ? 1 : -1;
      let indice = focoActual;
      for (let intento = 0; intento < opciones.length; intento += 1) {
        indice = (indice + direccion + opciones.length) % opciones.length;
        if (!opciones[indice]?.deshabilitado) {
          siguienteIndice = indice;
          break;
        }
      }
    } else if (evento.key === "Home") {
      siguienteIndice = opciones.findIndex((opcion) => !opcion.deshabilitado);
    } else if (evento.key === "End") {
      for (let indice = opciones.length - 1; indice >= 0; indice -= 1) {
        if (!opciones[indice]?.deshabilitado) {
          siguienteIndice = indice;
          break;
        }
      }
    } else if (evento.key.length === 1 && !evento.altKey && !evento.ctrlKey && !evento.metaKey) {
      busquedaRef.current += normalizarBusqueda(evento.key);
      if (temporizadorBusquedaRef.current) clearTimeout(temporizadorBusquedaRef.current);
      temporizadorBusquedaRef.current = setTimeout(() => {
        busquedaRef.current = "";
      }, 500);

      const inicio = Math.max(focoActual, -1);
      for (let paso = 1; paso <= opciones.length; paso += 1) {
        const indice = (inicio + paso) % opciones.length;
        const opcion = opciones[indice];
        if (
          opcion &&
          !opcion.deshabilitado &&
          normalizarBusqueda(opcion.etiqueta).startsWith(busquedaRef.current)
        ) {
          siguienteIndice = indice;
          break;
        }
      }
    }

    if (siguienteIndice !== null && siguienteIndice >= 0) {
      evento.preventDefault();
      opcionesRef.current[siguienteIndice]?.focus();
      return;
    }

    if (evento.key === "Escape") {
      evento.preventDefault();
      evento.stopPropagation();
      limpiarBusqueda();
      setAbierto(false);
      setPosicionLista(null);
      botonRef.current?.focus();
    }
  };

  const alternarLista = () => {
    if (deshabilitado) return;
    if (abierto) {
      limpiarBusqueda();
      setAbierto(false);
      setPosicionLista(null);
    } else {
      setAbierto(true);
    }
  };

  const alPresionarTeclaBoton = (evento: KeyboardEvent<HTMLButtonElement>) => {
    if ((evento.key === "ArrowDown" || evento.key === "ArrowUp") && !deshabilitado && !abierto) {
      evento.preventDefault();
      setAbierto(true);
    }
  };

  const etiquetaSeleccionada = opcionSeleccionada
    ? `${opcionSeleccionada.etiqueta}${opcionSeleccionada.distintivos?.length ? `, ${opcionSeleccionada.distintivos.join(", ")}` : ""}`
    : placeholder;

  return (
    <div className={twMerge("relative w-full", className)} ref={contenedorRef}>
      {name && <input type="hidden" name={name} value={valorActual} disabled={deshabilitado} />}
      <button
        ref={botonRef}
        id={id}
        type="button"
        disabled={deshabilitado}
        onClick={alternarLista}
        onKeyDown={alPresionarTeclaBoton}
        role="combobox"
        aria-label={etiquetaAria ? `${etiquetaAria}: ${etiquetaSeleccionada}` : undefined}
        aria-haspopup="listbox"
        aria-expanded={abierto && !deshabilitado}
        aria-busy={cargando || undefined}
        aria-required={obligatorio || undefined}
        aria-controls={idLista}
        className={twMerge(
          "flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 text-left text-sm text-[var(--admin-texto-primario)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
          deshabilitado && cargando && "cursor-wait",
          !deshabilitado && "hover:bg-[var(--admin-item-hover)]",
          claseBoton,
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {opcionSeleccionada?.icono}
          <span className="truncate font-medium">{etiquetaSeleccionada}</span>
        </span>
        {cargando ? (
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[var(--admin-texto-muted)]" aria-hidden="true" />
        ) : (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--admin-texto-muted)] transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        )}
      </button>

      {abierto && !deshabilitado && posicionLista && opciones.length > 0 && typeof document !== "undefined" && createPortal((
        <ul
          ref={listaRef}
          data-selector-desplegable-opciones="true"
          id={idLista}
          role="listbox"
          aria-label={etiquetaAria ?? "Opciones"}
          onKeyDown={manejarTecladoLista}
          className="fixed z-[60] max-h-72 overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1.5 shadow-xl"
          style={{
            boxShadow: "0 16px 40px rgb(0 0 0 / 0.24)",
            left: posicionLista.izquierda,
            top: posicionLista.arriba,
            width: posicionLista.ancho,
            minWidth: posicionLista.anchoMinimo,
            maxHeight: posicionLista.altoMaximo,
          }}
        >
          {opciones.map((opcion, indice) => {
            const seleccionada = opcion.valor === valorActual;
            return (
              <li key={opcion.valor} role="presentation">
                <button
                  ref={(elemento) => { opcionesRef.current[indice] = elemento; }}
                  type="button"
                  role="option"
                  disabled={opcion.deshabilitado}
                  aria-selected={seleccionada}
                  aria-disabled={opcion.deshabilitado || undefined}
                  onClick={() => seleccionar(opcion)}
                  className={twMerge(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50",
                    seleccionada
                      ? "bg-[var(--page-primary-15)] font-medium text-[var(--admin-texto-primario)]"
                      : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    {opcion.icono}
                    <span className="min-w-0 truncate">{opcion.etiqueta}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {opcion.distintivos?.map((distintivo) => (
                      <span
                        key={distintivo}
                        className="rounded-full bg-[var(--admin-item)] px-2 py-0.5 text-[10px] font-medium text-[var(--admin-texto-muted)]"
                      >
                        {distintivo}
                      </span>
                    ))}
                    {seleccionada && (
                      <Check className="h-4 w-4 text-[var(--page-primary-tinta)]" aria-hidden="true" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ), document.body)}
    </div>
  );
}
