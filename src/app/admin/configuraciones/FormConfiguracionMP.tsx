"use client";

import { useState } from "react";
import { guardarConfiguracionMP } from "@/actions/config";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

export function FormConfiguracionMP({ configInicial }: { configInicial: any }) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Estado para ocultar/mostrar el token en pantalla
  const [showToken, setShowToken] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await guardarConfiguracionMP(formData);

    setIsPending(false);
    if (!result.success) {
      setError(result.error ?? "Ocurrió un error inesperado");
    } else {
      setSuccess(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Access Token */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-amber-200/80 uppercase tracking-wider block">
          Mercado Pago Access Token (APP_USR_...)
        </label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            name="mpAccessToken"
            defaultValue={configInicial?.mpAccessToken ?? ""}
            placeholder="Ingresá tu Production Access Token"
            className="w-full bg-zinc-900/50 border border-amber-900/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors pr-10"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-200/40 hover:text-amber-500 transition-colors"
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Public Key */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-amber-200/80 uppercase tracking-wider block">
          Mercado Pago Public Key (APP_USR_...)
        </label>
        <input
          type="text"
          name="mpPublicKey"
          defaultValue={configInicial?.mpPublicKey ?? ""}
          placeholder="Ingresá tu Public Key (Opcional)"
          className="w-full bg-zinc-900/50 border border-amber-900/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Feedbacks de estado */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center font-medium">
          ❌ {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-center font-medium">
          ¡Credenciales guardadas y sincronizadas correctamente!
        </p>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-zinc-950 font-black py-3 rounded-lg transition-all text-xs uppercase tracking-widest"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando cambios...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar Configuración
          </>
        )}
      </button>
    </form>
  );
}
export default FormConfiguracionMP;