"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
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
      router.replace("/admin/mercadopago");
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
      router.replace("/admin/mercadopago");
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
    <div className="space-y-6">
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {estado.conectada ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <div>
              <p className="font-semibold text-[var(--admin-texto-primario)]">
                {estado.conectada ? "Cuenta conectada" : "Sin conectar"}
              </p>
              <p className="text-xs text-[var(--admin-texto-secundario)]">
                {estado.conectada
                  ? "Las señas de los turnos se acreditan en esta cuenta"
                  : "Conectá una cuenta para poder cobrar señas online"}
              </p>
            </div>
          </div>
        </div>

        {estado.conectada && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[var(--admin-border)] pt-4">
            <div>
              <p className="text-[var(--admin-texto-muted)] text-xs uppercase tracking-wider mb-1">
                Cuenta que recibe los cobros
              </p>
              <p className="text-[var(--admin-texto-primario)]">
                {estado.nombreCuenta ?? "Cuenta de Mercado Pago conectada"}
              </p>
            </div>
            <div>
              <p className="text-[var(--admin-texto-muted)] text-xs uppercase tracking-wider mb-1">
                Última actualización
              </p>
              <p className="text-[var(--admin-texto-primario)]">
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
                  : "-"}
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--admin-border)]">
          {estado.conectada ? (
            <button
              onClick={manejarDesconexion}
              disabled={pendiente}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors duration-150 text-sm font-semibold disabled:opacity-50"
            >
              {pendiente ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4" />
              )}
              Desconectar cuenta
            </button>
          ) : (
            <div>
              <a
                href="/api/mercadopago/oauth/start"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold transition-colors duration-150 bg-[#009EE3] hover:bg-[#0088CC] cursor-pointer"
              >
                <Link2 className="h-4 w-4" />
                Conectar con Mercado Pago
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación - usando ConfirmDialog correctamente */}
      {showConfirmModal && (
        <ConfirmDialog
          title="Desconectar cuenta de Mercado Pago"
          message="¿Estás seguro? Dejarás de recibir pagos de señas online hasta que conectes otra cuenta."
          onConfirm={ejecutarDesconexion}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
