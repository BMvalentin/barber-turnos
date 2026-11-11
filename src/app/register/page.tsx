"use client";

import FormularioRegistro from "@/components/auth/FormularioRegistro";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PaginaRegistro() {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center">Cargando registro...</p>}>
      <ContenidoRegistro />
    </Suspense>
  );
}

function ContenidoRegistro() {
  const parametros = useSearchParams();
  return <FormularioRegistro consentimientoRequerido={parametros.get("consentimiento") === "requerido"} />;
}
