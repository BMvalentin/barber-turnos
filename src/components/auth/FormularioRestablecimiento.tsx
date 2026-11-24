"use client";

import { useActionState, useEffect, useState } from "react";
import { CLASE_CAMPO, CLASE_ENVIO, CLASE_ERROR, CLASE_ETIQUETA, CLASE_ICONO_CAMPO, CLASE_VER_PASSWORD } from "@/components/auth/estilos-formulario";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { restablecerPassword } from "@/actions/usuarios/restablecer-password.actions";
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

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <label htmlFor="password" className={CLASE_ETIQUETA}>
          Nueva contraseña
        </label>
        <div className="relative">
          <Lock aria-hidden="true" className={CLASE_ICONO_CAMPO} />
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
            className={`${CLASE_CAMPO} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVerPassword((valor) => !valor)}
            className={CLASE_VER_PASSWORD}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className={CLASE_ETIQUETA}>
          Confirmar contraseña
        </label>
        <div className="relative">
          <Lock aria-hidden="true" className={CLASE_ICONO_CAMPO} />
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
            className={`${CLASE_CAMPO} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVerConfirmPassword((valor) => !valor)}
            className={CLASE_VER_PASSWORD}
            aria-label={verConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
          >
            {verConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {state.error && <p role="alert" className={CLASE_ERROR}>{state.error}</p>}

      <button
        type="submit"
        disabled={isPending || state.success}
        className={CLASE_ENVIO}
      >
        {isPending || state.success ? "Guardando..." : "Actualizar contraseña"}
      </button>
    </form>
  );
}
