// Sección de configuración de medios de pago.
import { Landmark } from "lucide-react";
import { InterruptorAdmin } from "@/components/admin/InterruptorAdmin";
import type { ManejarCambio } from "@/components/admin/config/tipos";

const CLASES_INPUT =
  "w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] px-3 py-2.5 text-sm text-[var(--admin-texto-primario)] placeholder:text-[var(--admin-texto-muted)] transition-colors duration-150 hover:border-[var(--admin-border-fuerte)] focus:border-[var(--page-primary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--page-focus-ring)]";

interface SeccionMediosPagoProps {
  titular: string;
  cuit: string;
  alias: string;
  cbu: string;
  banco: string;
  activa: boolean;
  manejarCambio: ManejarCambio;
  manejarCambioActiva: (activa: boolean) => void;
}

export default function SeccionMediosPago({
  titular,
  cuit,
  alias,
  cbu,
  banco,
  activa,
  manejarCambio,
  manejarCambioActiva,
}: SeccionMediosPagoProps) {
  return (
    <div>
      <div className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-[var(--admin-texto-muted)]" />
          <h2 className="text-lg font-semibold tracking-tight text-[var(--admin-texto-primario)]">
            Transferencia bancaria
          </h2>
        </div>
        <p className="mt-1 text-sm text-[var(--admin-texto-muted)]">
          Configurá los datos de transferencia que querés mostrar a tus clientes al elegir este medio de pago.
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[var(--admin-surface-elevated)] px-4 py-2">
        <div>
          <p className="text-sm font-semibold text-[var(--admin-texto-primario)]">
            {activa ? "Transferencia activa" : "Transferencia inactiva"}
          </p>
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            {activa
              ? "La transferencia puede aparecer entre las opciones de pago cuando sus datos estén completos."
              : "La transferencia no se mostrará a tus clientes."}
          </p>
        </div>
        <InterruptorAdmin etiqueta="Activar transferencia bancaria" activo={activa} alCambiar={manejarCambioActiva} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="config-titular" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            Titular de la cuenta
          </label>
          <input
            type="text"
            id="config-titular"
            name="transferenciaTitular"
            value={titular}
            onChange={manejarCambio}
            placeholder="Nombre y apellido o razón social"
            className={CLASES_INPUT}
          />
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            Nombre de la persona o empresa titular de la cuenta.
          </p>
        </div>

        <div>
          <label htmlFor="config-cuit" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            CUIT
          </label>
          <input
            type="text"
            id="config-cuit"
            name="transferenciaCuit"
            value={cuit}
            onChange={manejarCambio}
            placeholder="Ej: 20-12345678-9"
            className={CLASES_INPUT}
          />
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            CUIT asociado a la cuenta bancaria, si corresponde.
          </p>
        </div>

        <div>
          <label htmlFor="config-alias" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            Alias
          </label>
          <input
            type="text"
            id="config-alias"
            name="transferenciaAlias"
            value={alias}
            onChange={manejarCambio}
            placeholder="Ej: barberia.pagos"
            className={CLASES_INPUT}
          />
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            Alias bancario para recibir la transferencia.
          </p>
        </div>

        <div>
          <label htmlFor="config-cbu" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            CBU
          </label>
          <input
            type="text"
            id="config-cbu"
            inputMode="numeric"
            name="transferenciaCbu"
            value={cbu}
            onChange={manejarCambio}
            placeholder="Ingresá los 22 dígitos"
            className={CLASES_INPUT}
          />
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            CBU de la cuenta, si preferís ofrecerlo junto con el alias.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="config-banco" className="mb-1.5 block text-sm font-medium text-[var(--admin-texto-secundario)]">
            Banco
          </label>
          <input
            type="text"
            id="config-banco"
            name="transferenciaBanco"
            value={banco}
            onChange={manejarCambio}
            placeholder="Ej: Banco Nación"
            className={CLASES_INPUT}
          />
          <p className="mt-1 text-xs text-[var(--admin-texto-muted)]">
            Nombre del banco donde está radicada la cuenta.
          </p>
        </div>
      </div>
    </div>
  );
}
