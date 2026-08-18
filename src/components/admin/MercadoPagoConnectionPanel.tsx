"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
  Loader2,
  Lock,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { desconectarMP } from "@/actions/mercadopago/desconectar.actions";
import type { EstadoConexionMP } from "@/actions/mercadopago/estado-conexion.actions";
import type { ConfiguracionOAuthMP } from "@/actions/mercadopago/estado-oauth.actions";
import { ConfirmDialog } from "@/components/ui/confirm-modal";
import { ZONA_HORARIA } from "@/lib/constants";
interface Props {
  estadoInicial: EstadoConexionMP;
  configuracionOAuth: ConfiguracionOAuthMP;
}

const MENSAJES_ERROR: Record<string, string> = {
  bloqueado:
    "La conexión está bloqueada. Pedile al equipo de desarrollo que desbloquee la configuración.",
  sin_client_id:
    "Falta configurar MP_CLIENT_ID en el archivo .env del servidor.",
  sin_app_url:
    "Falta configurar NEXT_PUBLIC_APP_URL en el archivo .env del servidor.",
  configuracion_incompleta:
    "Falta configurar MP_CLIENT_SECRET en el archivo .env del servidor.",
  estado_invalido:
    "La sesión de conexión expiró o fue manipulada. Intentá de nuevo.",
  sin_codigo:
    "Mercado Pago no devolvió el código de autorización. Intentá de nuevo.",
  acceso_denegado:
    "Cancelaste la autorización en Mercado Pago. Intentá de nuevo cuando estés listo.",
  conexion_fallida:
    "No se pudo completar la conexión. Revisá los logs del servidor para más detalles.",
  inicio_fallido:
    "No se pudo iniciar el flujo de conexión. Revisá la configuración del .env.",
};

function PanelConfiguracion({
  configuracion,
}: {
  configuracion: ConfiguracionOAuthMP;
}) {
  const [copiado, setCopiado] = useState(false);
  const todaConfigurada =
    configuracion.clientIdConfigurado &&
    configuracion.clientSecretConfigurado &&
    configuracion.urlAppConfigurada;

  if (todaConfigurada) return null;

  const copiarUri = () => {
    if (configuracion.uriRedireccion) {
      navigator.clipboard.writeText(configuracion.uriRedireccion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
        <p className="text-sm font-semibold text-red-400">
          Faltan variables de entorno
        </p>
      </div>

      <div className="space-y-2">
        <ItemConfiguracion
          label="MP_CLIENT_ID"
          configurado={configuracion.clientIdConfigurado}
        />
        <ItemConfiguracion
          label="MP_CLIENT_SECRET"
          configurado={configuracion.clientSecretConfigurado}
        />
        <ItemConfiguracion
          label="NEXT_PUBLIC_APP_URL"
          configurado={configuracion.urlAppConfigurada}
        />
      </div>

      <p className="text-xs text-[var(--admin-texto-muted)] pt-1">
        Agregá estas variables al <code className="text-[var(--page-primary-80)]">.env</code> y
        reiniciá el servidor.
      </p>

      {configuracion.uriRedireccion && (
        <div className="pt-2 border-t border-red-500/10">
          <p className="text-xs text-[var(--admin-texto-muted)] mb-2">
            URI de redirección (registrala en tu app de MP):
          </p>
          <div className="flex items-center gap-2 bg-[var(--admin-surface-elevated)] border border-[var(--admin-border)] rounded-lg px-3 py-2">
            <code className="text-xs text-[var(--page-primary-80)] flex-1 truncate">
              {configuracion.uriRedireccion}
            </code>
            <button
              onClick={copiarUri}
              className="text-[var(--admin-texto-muted)] hover:text-[var(--page-primary-80)] transition-colors duration-150 flex-shrink-0"
              title="Copiar URI"
            >
              {copiado ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemConfiguracion({
  label,
  configurado,
}: {
  label: string;
  configurado: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {configurado ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
      )}
      <code
        className={`text-xs ${configurado ? "text-green-400" : "text-red-400"}`}
      >
        {label}
      </code>
      <span className="text-xs text-[var(--admin-texto-muted)]">
        {configurado ? "✓ configurado" : "✗ falta configurar"}
      </span>
    </div>
  );
}

export default function MercadoPagoConnectionPanel({
  estadoInicial,
  configuracionOAuth,
}: Props) {
  const [estado, setEstado] = useState(estadoInicial);
  const [pendiente, startTransicion] = useTransition();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const parametrosBusqueda = useSearchParams();

  useEffect(() => {
    if (parametrosBusqueda.get("mp_success")) {
      toast.success("Cuenta conectada correctamente", {
        description:
          "Ahora podés cobrar señas online con Mercado Pago. ¡Éxitos!",
        duration: 4000,
      });
      // Actualizamos el estado local para reflejar la conexión (opcional, luego la página se recarga)
      setEstado((prev) => ({ ...prev, conectada: true, bloqueada: true }));
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
          bloqueada: false,
          clavePublica: null,
          idUsuarioMP: null,
          modoProduccion: null,
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

  const configuracionCompleta =
    configuracionOAuth.clientIdConfigurado &&
    configuracionOAuth.clientSecretConfigurado &&
    configuracionOAuth.urlAppConfigurada;

  return (
    <div className="space-y-6">
      <PanelConfiguracion configuracion={configuracionOAuth} />

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

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {estado.bloqueada && (
              <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[var(--page-primary)]/20 text-[var(--page-primary-80)] border border-[var(--page-primary)]/30">
                <Lock className="h-3 w-3" />
                BLOQUEADA
              </span>
            )}
            {estado.conectada && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                {estado.modoProduccion ? "PRODUCCIÓN" : "PRUEBA"}
              </span>
            )}
          </div>
        </div>

        {estado.conectada && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[var(--admin-border)] pt-4">
            <div>
              <p className="text-[var(--admin-texto-muted)] text-xs uppercase tracking-wider mb-1">
                ID de usuario en Mercado Pago
              </p>
              <p className="text-[var(--admin-texto-primario)] font-mono">{estado.idUsuarioMP}</p>
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
          {estado.bloqueada ? (
            <div className="flex items-start gap-3 p-4 bg-[var(--page-primary)]/5 border border-[var(--page-primary)]/20 rounded-lg">
              <Lock className="h-4 w-4 text-[var(--page-primary-80)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--admin-texto-secundario)] leading-relaxed">
                Esta conexión está{" "}
                <strong className="text-[var(--page-primary-80)]">
                  bloqueada por seguridad
                </strong>{" "}
                para evitar que se cambien los tokens sin autorización. Si
                necesitás conectar otra cuenta, pedile al equipo de desarrollo
                que desbloquee la configuración.
              </p>
            </div>
          ) : estado.conectada ? (
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
            <div className="space-y-3">
              <a
                href={
                  configuracionCompleta
                    ? "/api/mercadopago/oauth/start"
                    : undefined
                }
                onClick={
                  !configuracionCompleta
                    ? (e) => {
                      e.preventDefault();
                      toast.error("Configuración incompleta", {
                        description:
                          "Completá la configuración del .env antes de conectar",
                        duration: 4000,
                      });
                    }
                    : undefined
                }
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold transition-colors duration-150 ${configuracionCompleta
                    ? "bg-[#009EE3] hover:bg-[#0088CC] cursor-pointer"
                    : "bg-zinc-700 cursor-not-allowed opacity-60"
                  }`}
              >
                <Link2 className="h-4 w-4" />
                Conectar con Mercado Pago
              </a>
              {!configuracionCompleta && (
                <p className="text-xs text-[var(--admin-texto-muted)]">
                  Completá las variables de entorno de arriba para habilitar el
                  botón.
                </p>
              )}
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