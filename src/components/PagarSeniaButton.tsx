"use client";
// components/PagarSeniaButton.tsx

import { useState } from "react";
import { crearPreferenciaPago } from "@/actions/mercadopago-actions";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";

interface PagarSeniaButtonProps {
  turnoId: string;
  montoSenia: number;
  disabled?: boolean;
  className?: string;
}

export function PagarSeniaButton({
  turnoId,
  montoSenia,
  disabled = false,
  className = "",
}: PagarSeniaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePago = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await crearPreferenciaPago(turnoId);

      if (!result.success || !result.data?.checkoutUrl) {
        setError(result.error ?? "No se pudo iniciar el pago");
        return;
      }

      // Redirigir al checkout de Mercado Pago
      window.location.href = result.data.checkoutUrl;
    } catch (err: any) {
      setError("Error inesperado al procesar el pago");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (montoSenia <= 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={handlePago}
        disabled={disabled || loading}
        className={`
          flex items-center justify-center gap-2 w-full
          bg-[#009EE3] hover:bg-[#0088CC] 
          text-white font-bold py-3 px-6 rounded-xl
          transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            {/* Logo MP */}
            <svg className="w-5 h-5" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z" fill="#009EE3"/>
              <path d="M19 6c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 11.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="white"/>
            </svg>
            <span>Pagar seña ${montoSenia.toLocaleString("es-AR")}</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-center text-zinc-500">
        Pagás solo la seña. El resto se abona en el local.
      </p>
    </div>
  );
}