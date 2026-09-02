"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
    ? "flex items-center gap-2 text-[var(--admin-texto-primario)] text-xs p-2 bg-[var(--admin-item)] rounded hover:bg-[var(--admin-item-hover)] transition cursor-pointer"
    : "flex items-center gap-2 p-2 rounded cursor-pointer transition hover:bg-[var(--admin-item-hover)]";

  const renderOpcion = (opcion: OpcionCheckbox) => (
    <label key={opcion.valor} className={claseEtiqueta}>
      <input
        type="checkbox"
        checked={seleccionados.includes(opcion.valor)}
        onChange={() => onAlternarSeleccion(opcion.valor)}
      />
      <span className={grupos ? "" : "text-[var(--admin-texto-primario)] text-sm"}>
        {opcion.etiqueta}
      </span>
    </label>
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onAlternarAbierto}
        aria-expanded={abierto}
        className="w-full cursor-pointer flex items-center justify-between p-3 bg-[var(--admin-surface-elevated)] rounded-lg transition border hover:bg-[var(--admin-item)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
        style={{ borderColor: "var(--admin-border)" }}
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold" style={{ color: "var(--page-primary-tinta)" }}>
            {titulo}
          </span>
          <span className="text-xs" style={{ color: "var(--page-primary-tinta)" }}>
            {seleccionados.length} seleccionados
          </span>
        </div>

        <motion.span animate={{ rotate: abierto ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="h-4 w-4" style={{ color: "var(--page-primary-tinta)" }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
      {abierto && (
        <motion.div
          className={`p-4 bg-[var(--admin-surface-elevated)] rounded-lg ${
            grupos ? "space-y-4" : "space-y-2"
          } ${maxAltura} overflow-y-auto border`}
          style={{ borderColor: "var(--admin-border)" }}
          initial={{ opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {seleccionados.length === 0 && (
            <p className="text-xs italic" style={{ color: "var(--page-primary-tinta)" }}>
              {mensajeVacio}
            </p>
          )}

          {grupos
            ? grupos.map((grupo) => (
                <div key={grupo.titulo} className="space-y-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--page-primary-tinta)" }}>
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
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
