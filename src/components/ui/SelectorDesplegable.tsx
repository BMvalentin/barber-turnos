"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

type PosicionLista = {
  contenedor: HTMLElement | null;
  izquierda: number;
  bordeVertical: number;
  abrirArriba: boolean;
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
  buscable?: boolean;
};

function normalizarBusqueda(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function buscarOpcionSiguiente(
  opciones: readonly OpcionDesplegable[],
  indiceActual: number,
  direccion: 1 | -1,
): number {
  let indice = indiceActual < 0 && direccion === -1 ? 0 : indiceActual;
  for (let intento = 0; intento < opciones.length; intento += 1) {
    indice = (indice + direccion + opciones.length) % opciones.length;
    if (!opciones[indice].deshabilitado) return indice;
  }
  return -1;
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
  buscable = false,
}: Props<T>) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [valorInterno, setValorInterno] = useState<T | undefined>(valorInicial);
  const [posicionLista, setPosicionLista] = useState<PosicionLista | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLElement>(null);
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
  const consulta = buscable ? normalizarBusqueda(busqueda.trim()) : "";
  const opcionesFiltradas = consulta
    ? opciones.filter((opcion) => normalizarBusqueda(opcion.etiqueta).includes(consulta))
    : opciones;
  const cantidadOpciones = opcionesFiltradas.length;

  const cerrarLista = useCallback(() => {
    busquedaRef.current = "";
    if (temporizadorBusquedaRef.current) {
      clearTimeout(temporizadorBusquedaRef.current);
      temporizadorBusquedaRef.current = null;
    }
    setBusqueda("");
    setIndiceActivo(-1);
    setAbierto(false);
    setPosicionLista(null);
  }, []);

  useEffect(() => {
    if (!abierto || deshabilitado) return;

    const alPresionarFuera = (evento: PointerEvent) => {
      if (
        evento.target instanceof Node &&
        !contenedorRef.current?.contains(evento.target) &&
        !listaRef.current?.contains(evento.target)
      ) {
        cerrarLista();
      }
    };

    document.addEventListener("pointerdown", alPresionarFuera);
    return () => document.removeEventListener("pointerdown", alPresionarFuera);
  }, [abierto, cerrarLista, deshabilitado]);

  useEffect(() => {
    if (!abierto || deshabilitado || !listaPosicionada) return;
    if (!buscable && indiceInicial >= 0) {
      opcionesRef.current[indiceInicial]?.focus();
    }
  }, [abierto, buscable, deshabilitado, indiceInicial, listaPosicionada]);

  useEffect(() => {
    if (!buscable || !abierto || deshabilitado || !listaPosicionada || indiceActivo < 0) return;
    opcionesRef.current[indiceActivo]?.scrollIntoView({ block: "nearest" });
  }, [abierto, buscable, deshabilitado, indiceActivo, listaPosicionada]);

  useEffect(() => {
    if (!abierto || deshabilitado || (!buscable && cantidadOpciones === 0)) return;

    const viewport = window.visualViewport;
    const margen = 8;
    const limiteAltura = buscable ? 192 : 288;
    const altoDeseado = Math.min(limiteAltura, Math.max(1, cantidadOpciones) * 42 + 14);

    const calcularPosicion = () => {
      const boton = botonRef.current;
      if (!boton) return;
      const rectangulo = boton.getBoundingClientRect();
      const contenedor = boton.closest<HTMLElement>("[role='dialog']");
      const bordeDialogo = contenedor?.getBoundingClientRect();

      const inicioViewport = viewport?.offsetTop ?? 0;
      const arribaViewport = Math.max(inicioViewport, bordeDialogo?.top ?? inicioViewport);
      const finViewport = inicioViewport + (viewport?.height ?? window.innerHeight);
      const abajoViewport = Math.min(finViewport, bordeDialogo?.bottom ?? finViewport);
      if (rectangulo.bottom <= arribaViewport || rectangulo.top >= abajoViewport) {
        setPosicionLista(null);
        return;
      }

      const espacioAbajo = Math.max(0, abajoViewport - rectangulo.bottom - margen);
      const espacioArriba = Math.max(0, rectangulo.top - arribaViewport - margen);
      const abrirArriba = espacioAbajo < altoDeseado && espacioArriba > espacioAbajo;
      const espacioDisponible = abrirArriba ? espacioArriba : espacioAbajo;
      const inicioHorizontal = viewport?.offsetLeft ?? 0;
      const finHorizontal = inicioHorizontal + (viewport?.width ?? window.innerWidth);
      const bordeIzquierdo = Math.max(inicioHorizontal, bordeDialogo?.left ?? inicioHorizontal) + margen;
      const bordeDerecho = Math.min(finHorizontal, bordeDialogo?.right ?? finHorizontal) - margen;
      const anchoViewport = Math.max(1, bordeDerecho - bordeIzquierdo);
      const anchoMinimo = Math.min(230, anchoViewport);
      const ancho = Math.min(Math.max(rectangulo.width, anchoMinimo), anchoViewport);
      const izquierda = Math.min(
        Math.max(rectangulo.left, bordeIzquierdo),
        bordeIzquierdo + anchoViewport - ancho,
      );

      const origenIzquierdo = (bordeDialogo?.left ?? 0) + (contenedor?.clientLeft ?? 0) - (contenedor?.scrollLeft ?? 0);
      const origenSuperior = (bordeDialogo?.top ?? 0) + (contenedor?.clientTop ?? 0) - (contenedor?.scrollTop ?? 0);
      setPosicionLista({
        contenedor,
        izquierda: izquierda - origenIzquierdo,
        bordeVertical: (abrirArriba ? rectangulo.top - margen : rectangulo.bottom + margen) - origenSuperior,
        abrirArriba,
        ancho,
        anchoMinimo,
        altoMaximo: Math.min(limiteAltura, espacioDisponible),
      });
    };

    let frame = window.requestAnimationFrame(calcularPosicion);
    const recalcularPosicion = (evento: Event) => {
      if (evento.target === listaRef.current) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(calcularPosicion);
    };

    window.addEventListener("resize", recalcularPosicion);
    window.addEventListener("scroll", recalcularPosicion, true);
    viewport?.addEventListener("resize", recalcularPosicion);
    viewport?.addEventListener("scroll", recalcularPosicion);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", recalcularPosicion);
      window.removeEventListener("scroll", recalcularPosicion, true);
      viewport?.removeEventListener("resize", recalcularPosicion);
      viewport?.removeEventListener("scroll", recalcularPosicion);
    };
  }, [abierto, buscable, cantidadOpciones, deshabilitado]);

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

  const seleccionar = (opcion: OpcionDesplegable<T>) => {
    if (opcion.deshabilitado) return;
    if (valorControlado === undefined) setValorInterno(opcion.valor);
    onChange?.(opcion.valor);
    cerrarLista();
    if (!buscable) botonRef.current?.focus();
  };

  const manejarTecladoLista = (evento: KeyboardEvent<HTMLUListElement>) => {
    const focoActual = opcionesRef.current.findIndex((opcion) => opcion === document.activeElement);
    let siguienteIndice: number | null = null;

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      const direccion = evento.key === "ArrowDown" ? 1 : -1;
      siguienteIndice = buscarOpcionSiguiente(opcionesFiltradas, focoActual, direccion);
    } else if (evento.key === "Home") {
      siguienteIndice = opcionesFiltradas.findIndex((opcion) => !opcion.deshabilitado);
    } else if (evento.key === "End") {
      for (let indice = opcionesFiltradas.length - 1; indice >= 0; indice -= 1) {
        if (!opcionesFiltradas[indice]?.deshabilitado) {
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
      for (let paso = 1; paso <= opcionesFiltradas.length; paso += 1) {
        const indice = (inicio + paso) % opcionesFiltradas.length;
        const opcion = opcionesFiltradas[indice];
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
      cerrarLista();
      botonRef.current?.focus();
    }
  };

  const alternarLista = () => {
    if (deshabilitado) return;
    if (abierto) {
      cerrarLista();
    } else {
      setAbierto(true);
    }
  };

  const alPresionarTeclaBoton = (evento: KeyboardEvent<HTMLElement>) => {
    if ((evento.key === "ArrowDown" || evento.key === "ArrowUp") && !deshabilitado) {
      evento.preventDefault();
      setAbierto(true);
      if (posicionLista) {
        const indice = opcionesFiltradas.findIndex((opcion) => !opcion.deshabilitado);
        if (indice >= 0) opcionesRef.current[indice]?.focus();
      }
    } else if (evento.key === "Escape" && abierto) {
      evento.preventDefault();
      cerrarLista();
    }
  };

  const alPresionarTeclaBusqueda = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.nativeEvent.isComposing) return;

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const direccion = evento.key === "ArrowDown" ? 1 : -1;
      setAbierto(true);
      setIndiceActivo(buscarOpcionSiguiente(opcionesFiltradas, indiceActivo, direccion));
    } else if (evento.key === "Enter" && abierto) {
      evento.preventDefault();
      const opcion = opcionesFiltradas[indiceActivo]
        ?? (consulta ? opcionesFiltradas.find((candidata) => !candidata.deshabilitado) : undefined);
      if (opcion) seleccionar(opcion);
    } else if (evento.key === "Escape" && abierto) {
      evento.preventDefault();
      evento.stopPropagation();
      cerrarLista();
    }
  };

  const etiquetaSeleccionada = opcionSeleccionada
    ? `${opcionSeleccionada.etiqueta}${opcionSeleccionada.distintivos?.length ? `, ${opcionSeleccionada.distintivos.join(", ")}` : ""}`
    : placeholder;

  const lista = abierto && !deshabilitado && posicionLista ? (
    <ul
      ref={listaRef}
      data-selector-desplegable-opciones="true"
      id={idLista}
      role="listbox"
      tabIndex={buscable ? -1 : undefined}
      aria-label={etiquetaAria ?? "Opciones"}
      onKeyDown={buscable ? undefined : manejarTecladoLista}
      className={twMerge(
        "z-[60] overflow-y-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-1.5 shadow-xl",
        posicionLista.contenedor ? "absolute" : "fixed",
        buscable && "overscroll-contain",
      )}
      style={{
        boxShadow: "0 16px 40px rgb(0 0 0 / 0.24)",
        left: posicionLista.izquierda,
        top: posicionLista.bordeVertical,
        transform: posicionLista.abrirArriba ? "translateY(-100%)" : undefined,
        width: posicionLista.ancho,
        minWidth: posicionLista.anchoMinimo,
        maxHeight: posicionLista.altoMaximo,
      }}
    >
      {opcionesFiltradas.length === 0 ? (
        <li role="presentation" className="px-3 py-2.5 text-sm text-[var(--admin-texto-muted)]">
          <span role="status">No se encontraron resultados.</span>
        </li>
      ) : opcionesFiltradas.map((opcion, indice) => {
        const seleccionada = opcion.valor === valorActual;
        return (
          <li key={opcion.valor} role="presentation">
            <button
              ref={(elemento) => { opcionesRef.current[indice] = elemento; }}
              id={buscable ? `${idLista}-${indice}` : undefined}
              type="button"
              role="option"
              tabIndex={buscable ? -1 : undefined}
              disabled={opcion.deshabilitado}
              aria-selected={seleccionada}
              aria-disabled={opcion.deshabilitado || undefined}
              onMouseDown={buscable ? (evento) => evento.preventDefault() : undefined}
              onClick={() => seleccionar(opcion)}
              className={twMerge(
                "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50",
                seleccionada
                  ? "bg-[var(--page-primary-15)] font-medium text-[var(--admin-texto-primario)]"
                  : "text-[var(--admin-texto-secundario)] hover:bg-[var(--admin-item-hover)] hover:text-[var(--admin-texto-primario)]",
                buscable && indiceActivo === indice && "ring-2 ring-inset ring-[var(--page-focus-ring)]",
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {opcion.icono}
                <span className={buscable ? "min-w-0 [overflow-wrap:anywhere]" : "min-w-0 truncate"}>
                  {opcion.etiqueta}
                </span>
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
  ) : null;

  return (
    <div
      className={twMerge("relative w-full", className)}
      ref={contenedorRef}
      onBlur={buscable ? (evento) => {
        const destino = evento.relatedTarget;
        if (!evento.currentTarget.contains(destino) && !listaRef.current?.contains(destino)) cerrarLista();
      } : undefined}
    >
      {name && <input type="hidden" name={name} value={valorActual} disabled={deshabilitado} />}
      {buscable ? (
        <div className="relative">
          <input
            ref={(elemento) => { botonRef.current = elemento; }}
            id={id}
            type="text"
            disabled={deshabilitado}
            value={abierto ? busqueda : valorActual ? etiquetaSeleccionada : ""}
            placeholder={placeholder}
            onFocus={() => setAbierto(true)}
            onClick={() => setAbierto(true)}
            onChange={(evento) => {
              if (listaRef.current) listaRef.current.scrollTop = 0;
              setBusqueda(evento.target.value);
              setIndiceActivo(-1);
              setAbierto(true);
            }}
            onKeyDown={alPresionarTeclaBusqueda}
            role="combobox"
            aria-label={etiquetaAria ?? "Buscar cliente"}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={Boolean(lista)}
            aria-activedescendant={lista && opcionesFiltradas[indiceActivo] ? `${idLista}-${indiceActivo}` : undefined}
            aria-busy={cargando || undefined}
            aria-required={obligatorio || undefined}
            aria-controls={lista ? idLista : undefined}
            autoComplete="off"
            className={twMerge(
              "h-10 w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 pr-10 text-left text-sm text-[var(--admin-texto-primario)] transition-colors placeholder:text-[var(--admin-texto-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)] disabled:cursor-not-allowed disabled:opacity-60",
              deshabilitado && cargando && "cursor-wait",
              !deshabilitado && "hover:bg-[var(--admin-item-hover)]",
              claseBoton,
            )}
          />
          {cargando ? (
            <LoaderCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--admin-texto-muted)]" aria-hidden="true" />
          ) : (
            <ChevronDown
              className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-texto-muted)] transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          )}
        </div>
      ) : (
        <button
          ref={(elemento) => { botonRef.current = elemento; }}
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
      )}

      {lista && createPortal(lista, posicionLista?.contenedor ?? document.body)}
    </div>
  );
}
