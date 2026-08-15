"use client";

import { DollarSign } from "lucide-react";
import CampoFormulario from "./CampoFormulario";

type SeccionPrecioDetallesProps = {
  errors?: Record<string, string[]>;
};

export default function SeccionPrecioDetalles({
  errors,
}: SeccionPrecioDetallesProps) {
  return (
    <div 
      className="bg-[var(--admin-surface-elevated)] border rounded-xl p-6"
      style={{ borderColor: "var(--page-secondary)" }}
    >
      <h3 
        className="text-xs font-bold uppercase tracking-wider mb-6"
        style={{ color: "var(--page-primary-tinta)" }}
      >
        Precio & Detalles
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CampoFormulario
          label="Duración Estimada"
          name="duracion"
          type="number"
          defaultValue="30"
          unit="MIN"
          errors={errors?.duracion}
          required
        />

        <CampoFormulario
          label="Precio Base"
          name="precio"
          type="number"
          step="0.01"
          icon={DollarSign}
          errors={errors?.precio}
          required
        />

        <CampoFormulario
          label="Descuento"
          name="descuento"
          type="number"
          defaultValue="0"
          unit="%"
          errors={errors?.descuento}
        />

        <CampoFormulario
          label="Seña"
          name="senia"
          type="number"
          defaultValue="0"
          icon={DollarSign}
          errors={errors?.senia}
        />
      </div>
    </div>
  );
}