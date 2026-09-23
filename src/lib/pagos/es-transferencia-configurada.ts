import type { DatosTransferencia } from "@/types/pago";

/** La transferencia solo se ofrece cuando todos sus datos visibles están completos. */
export function esTransferenciaConfigurada(datos: DatosTransferencia): boolean {
  return [
    datos.transferenciaTitular,
    datos.transferenciaCuit,
    datos.transferenciaAlias,
    datos.transferenciaCbu,
    datos.transferenciaBanco,
  ].every((valor) => valor.trim().length > 0);
}
