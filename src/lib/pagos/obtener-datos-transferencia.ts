import type { DatosTransferencia } from "@/types/pago";

type ConfiguracionTransferencia = {
  transferenciaTitular: string | null;
  transferenciaCuit: string | null;
  transferenciaAlias: string | null;
  transferenciaCbu: string | null;
  transferenciaBanco: string | null;
  transferenciaActiva: boolean;
};

export function obtenerDatosTransferencia(
  config: ConfiguracionTransferencia | null,
): DatosTransferencia {
  return {
    transferenciaTitular: config?.transferenciaTitular ?? "",
    transferenciaCuit: config?.transferenciaCuit ?? "",
    transferenciaAlias: config?.transferenciaAlias ?? "",
    transferenciaCbu: config?.transferenciaCbu ?? "",
    transferenciaBanco: config?.transferenciaBanco ?? "",
    transferenciaActiva: config?.transferenciaActiva ?? false,
  };
}
