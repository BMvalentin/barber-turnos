"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { restablecerPassword } from "@/actions/usuarios/restablecer-password.actions";
import { CLASES_BOTON_MARCA } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";

type Props = {
  token: string;
};

export default function FormularioRestablecimiento({ token }: Props) {
  const router = useRouter();
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    restablecerPassword,
    { error: "", success: false },
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmPassword, setVerConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Contraseña actualizada", {
        description: "Ya podés iniciar sesión con tu nueva contraseña.",
      });
      router.push("/login");
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (state.error) toast.error("Error", { description: state.error });
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-[var(--page-primary-tinta)] ml-1">
          Nueva contraseña
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
          <input
            id="password"
            name="password"
            type={verPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-12 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
          />
          <button
            type="button"
            onClick={() => setVerPassword((valor) => !valor)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-texto-muted)] hover:text-[var(--page-primary-tinta)] transition-colors"
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-[var(--page-primary-tinta)] ml-1">
          Confirmar contraseña
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-texto-muted)] group-focus-within:text-[var(--page-primary-tinta)] transition-colors" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={verConfirmPassword ? "text" : "password"}
            placeholder="Repetí la contraseña"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(evento) => setConfirmPassword(evento.target.value)}
            className="w-full bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-xl py-3.5 pl-12 pr-12 text-[var(--admin-texto-primario)] outline-none focus:border-[var(--admin-border-fuerte)] focus:bg-[var(--admin-item)] focus:ring-1 focus:ring-[var(--page-focus-ring)] transition-all placeholder:text-[var(--admin-texto-muted)] font-medium"
          />
          <button
            type="button"
            onClick={() => setVerConfirmPassword((valor) => !valor)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--admin-texto-muted)] hover:text-[var(--page-primary-tinta)] transition-colors"
            aria-label={verConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {verConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={`w-full mt-2 ${CLASES_BOTON_MARCA} font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm active:scale- disabled:opacity-50`}
      >
        {isPending ? "GUARDANDO..." : (
          <>
            <ShieldCheck className="w-5 h-5" />
            ACTUALIZAR CONTRASEÑA
          </>
        )}
      </button>
    </form>
  );
}
