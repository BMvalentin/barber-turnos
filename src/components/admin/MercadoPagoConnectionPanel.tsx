"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleDashed,
  Link2,
  Unlink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { desconectarMP } from "@/actions/mercadopago/desconectar.actions";
import type { EstadoConexionMP } from "@/actions/mercadopago/estado-conexion.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import { ZONA_HORARIA } from "@/lib/constants";
interface Props {
  estadoInicial: EstadoConexionMP;
}

const MENSAJES_ERROR: Record<string, string> = {
  sin_client_id: "La conexión no está disponible en este momento.",
  sin_app_url: "La conexión no está disponible en este momento.",
  configuracion_incompleta: "La conexión no está disponible en este momento.",
  estado_invalido:
    "La sesión de conexión expiró o fue manipulada. Intentá de nuevo.",
  sin_codigo:
    "Mercado Pago no devolvió el código de autorización. Intentá de nuevo.",
  acceso_denegado:
    "Cancelaste la autorización en Mercado Pago. Intentá de nuevo cuando estés listo.",
  conexion_fallida: "No se pudo completar la conexión. Intentá de nuevo más tarde.",
  inicio_fallido: "No se pudo iniciar la conexión. Intentá de nuevo más tarde.",
};

export default function MercadoPagoConnectionPanel({
  estadoInicial,
}: Props) {
  const [estado, setEstado] = useState(estadoInicial);
  const [pendiente, startTransicion] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const parametrosBusqueda = useSearchParams();

  useEffect(() => {
    setEstado(estadoInicial);
  }, [estadoInicial]);

  useEffect(() => {
    if (parametrosBusqueda.get("mp_success")) {
      toast.success("Cuenta conectada correctamente", {
        description:
          "Ahora podés cobrar señas online con Mercado Pago. ¡Éxitos!",
        duration: 4000,
      });
      router.refresh();
      router.replace("/admin/config/medios-pago?tab=mercado-pago");
    }

    const codigoError = parametrosBusqueda.get("mp_error");
    if (codigoError) {
      const mensaje =
        MENSAJES_ERROR[codigoError] ||
        "No se pudo conectar la cuenta de Mercado Pago.";
      toast.error("Error al conectar", {
        description: mensaje,
        duration: 4000,
      });
      router.replace("/admin/config/medios-pago?tab=mercado-pago");
    }
  }, [parametrosBusqueda, router]);

  const manejarDesconexion = () => {
    setShowConfirmModal(true);
  };

  const ejecutarDesconexion = () => {
    setShowConfirmModal(false);
    startTransicion(async () => {
      const resultado = await desconectarMP();
      if (resultado.success) {
        toast.success("Cuenta desconectada correctamente", {
          description: "La cuenta de Mercado Pago ha sido desconectada.",
          duration: 4000,
        });
        setEstado({
          conectada: false,
          nombreCuenta: null,
          actualizadaEn: null,
        });
      } else {
        toast.error("Error al desconectar", {
          description: resultado.error || "No se pudo desconectar la cuenta",
          duration: 4000,
        });
      }
    });
  };

  return (
    <>
      <div className="admin-card">
        <div className="flex items-start gap-3 p-4 sm:p-6">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--admin-surface-elevated)] text-[var(--admin-texto-secundario)]">
            {estado.conectada ? (
              <CheckCircle2 className="size-5 text-[var(--admin-exito)]" aria-hidden="true" />
            ) : (
              <CircleDashed className="size-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--admin-texto-primario)]">
              {estado.conectada ? "Cuenta conectada" : "Cuenta sin conectar"}
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-texto-secundario)]">
              {estado.conectada
                ? "Las señas de los turnos se acreditan en esta cuenta."
                : "Conectá una cuenta para cobrar señas online."}
            </p>
          </div>
        </div>

        {estado.conectada && (
          <dl className="grid grid-cols-1 gap-4 border-t border-[var(--admin-border)] p-4 text-sm sm:grid-cols-2 sm:px-6">
            <div>
              <dt className="mb-1 text-xs text-[var(--admin-texto-muted)]">
                Cuenta que recibe los cobros
              </dt>
              <dd className="break-words text-[var(--admin-texto-primario)]">
                {estado.nombreCuenta ?? "Cuenta de Mercado Pago conectada"}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs text-[var(--admin-texto-muted)]">
                Última actualización
              </dt>
              <dd className="text-[var(--admin-texto-primario)]">
                {estado.actualizadaEn
                  ? new Date(estado.actualizadaEn).toLocaleString("es-AR", {
                    timeZone: ZONA_HORARIA,
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "Sin registrar"}
              </dd>
            </div>
          </dl>
        )}

        <div className="flex justify-end border-t border-[var(--admin-border)] p-4 sm:px-6">
          {estado.conectada ? (
            <button
              type="button"
              onClick={manejarDesconexion}
              disabled={pendiente}
              className="admin-control flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              {pendiente ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4" />
              )}
              {pendiente ? "Desconectando…" : "Desconectar cuenta"}
            </button>
          ) : (
            <a href="/api/mercadopago/oauth/start" className="admin-accion inline-flex w-full items-center justify-center gap-2 sm:w-auto">
              <Link2 className="size-4" aria-hidden="true" />
              Conectar con Mercado Pago
            </a>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmDialog
          title="Desconectar cuenta de Mercado Pago"
          message="¿Estás seguro? Dejarás de recibir pagos de señas online hasta que conectes otra cuenta."
          onConfirm={ejecutarDesconexion}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </>
  );
}
