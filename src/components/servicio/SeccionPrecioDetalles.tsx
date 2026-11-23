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
    <section className="space-y-3 border-t border-[var(--admin-border)] pt-4">
      <h3 className="text-base font-semibold">Precios y duración</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CampoFormulario
          label="Duración estimada"
          name="duracion"
          type="number"
          defaultValue="30"
          unit="min"
          errors={errors?.duracion}
          required
        />

        <CampoFormulario
          label="Precio base"
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
    </section>
  );
}
