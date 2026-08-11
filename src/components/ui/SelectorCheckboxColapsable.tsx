"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

type OpcionCheckbox = {
  valor: string;
  etiqueta: string;
};

type GrupoCheckbox = {
  titulo: string;
  opciones: OpcionCheckbox[];
};

type Props = {
  titulo: string;
  abierto: boolean;
  onAlternarAbierto: () => void;
  seleccionados: string[];
  onAlternarSeleccion: (valor: string) => void;
  opciones?: OpcionCheckbox[];
  grupos?: GrupoCheckbox[];
  mensajeVacio?: string;
  mensajeSinOpciones?: string;
  maxAltura?: string;
};

export default function SelectorCheckboxColapsable({
  titulo,
  abierto,
  onAlternarAbierto,
  seleccionados,
  onAlternarSeleccion,
  opciones = [],
  grupos,
  mensajeVacio = "No seleccionaste ninguna opción",
  mensajeSinOpciones,
  maxAltura = "max-h-60",
}: Props) {
  const claseEtiqueta = grupos
    ? "flex items-center gap-2 text-white text-xs p-2 bg-black/40 rounded hover:bg-black/60 transition cursor-pointer"
    : "flex items-center gap-2 p-2 rounded cursor-pointer transition hover:bg-white/5";

  const renderOpcion = (opcion: OpcionCheckbox) => (
    <label key={opcion.valor} className={claseEtiqueta}>
      <input
        type="checkbox"
        checked={seleccionados.includes(opcion.valor)}
        onChange={() => onAlternarSeleccion(opcion.valor)}
      />
      <span className={grupos ? "" : "text-white text-sm"}>{opcion.etiqueta}</span>
    </label>
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAlternarAbierto}
        className="w-full flex items-center justify-between p-3 bg-black/60 rounded-lg transition border"
        style={{ borderColor: "var(--page-primary-30)" }}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold" style={{ color: "var(--page-primary-70)" }}>
            {titulo}
          </span>
          <span className="text-xs" style={{ color: "var(--page-primary)" }}>
            {seleccionados.length} seleccionados
          </span>
        </div>

        {abierto ? (
          <ChevronUp className="h-4 w-4" style={{ color: "var(--page-primary)" }} />
        ) : (
          <ChevronDown className="h-4 w-4" style={{ color: "var(--page-primary)" }} />
        )}
      </button>

      {abierto && (
        <div
          className={`p-4 bg-black/60 rounded-lg ${
            grupos ? "space-y-4" : "space-y-2"
          } ${maxAltura} overflow-y-auto border`}
          style={{ borderColor: "var(--page-primary-30)" }}
        >
          {seleccionados.length === 0 && (
            <p className="text-xs italic" style={{ color: "var(--page-primary-80)" }}>
              {mensajeVacio}
            </p>
          )}

          {grupos
            ? grupos.map((grupo) => (
                <div key={grupo.titulo} className="space-y-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--page-primary)" }}>
                    {grupo.titulo}:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {grupo.opciones.map(renderOpcion)}
                  </div>
                </div>
              ))
            : opciones.map(renderOpcion)}

          {!grupos && mensajeSinOpciones && opciones.length === 0 && (
            <p className="text-xs text-red-400">{mensajeSinOpciones}</p>
          )}
        </div>
      )}
    </div>
  );
}
