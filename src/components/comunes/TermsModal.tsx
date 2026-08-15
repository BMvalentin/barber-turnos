"use client";

import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";
import ModalBase from "@/components/ui/ModalBase";
import { cn } from "@/lib/utils/cn";
import { CLASES_BOTON_CERRAR, CLASES_BOTON_MARCA } from "@/lib/constants";

interface TermsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SECCIONES_TERMINOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Servicio 'tal cual'",
    texto: 'El presente sistema es una herramienta de gestión proporcionada "tal cual", sin garantías de ningún tipo, ya sean expresas o implícitas.',
  },
  {
    titulo: "Responsabilidad del usuario",
    texto:
      "El uso de la plataforma es responsabilidad exclusiva del usuario y/o administradores designados, quienes asumen el control total sobre los datos ingresados, modificados o eliminados dentro del sistema.",
  },
  {
    titulo: "Disponibilidad del servicio",
    texto:
      "El desarrollador no garantiza la disponibilidad continua del servicio ni la ausencia de errores, fallos técnicos o pérdidas de información.",
  },
  {
    titulo: "Exactitud de los datos",
    texto:
      "El usuario es responsable de verificar la exactitud de los datos gestionados, incluyendo pero no limitado a stock, operaciones, tickets y registros.",
  },
  {
    titulo: "Limitación de responsabilidad",
    texto:
      "El sistema no se responsabiliza por pérdidas económicas, lucro cesante, interrupción de actividades comerciales, ni daños directos o indirectos derivados del uso o imposibilidad de uso de la aplicación.",
  },
  {
    titulo: "Copias de seguridad",
    texto:
      "Es responsabilidad del usuario realizar copias de seguridad (backups) de la información almacenada. El sistema no garantiza la recuperación de datos ante fallos o incidentes.",
  },
  {
    titulo: "Múltiples administradores",
    texto:
      "En caso de existir múltiples administradores, cada uno será responsable por las acciones realizadas bajo su cuenta, incluyendo el acceso y uso de datos personales de terceros.",
  },
  {
    titulo: "Datos almacenados",
    texto:
      "El sistema puede almacenar información proporcionada por los usuarios, como correo electrónico, teléfono, historial de operaciones y tickets, los cuales serán utilizados únicamente con fines operativos internos.",
  },
  {
    titulo: "Autenticación de terceros",
    texto:
      "El acceso al sistema puede requerir autenticación mediante servicios de terceros. El uso de dichos servicios implica la aceptación de sus propios términos y políticas.",
  },
  {
    titulo: "Uso lícito",
    texto:
      "El usuario se compromete a utilizar la plataforma de manera lícita y conforme a la normativa vigente, siendo responsable por cualquier uso indebido de la misma.",
  },
  {
    titulo: "Modificaciones",
    texto:
      "El desarrollador se reserva el derecho de modificar estos términos en cualquier momento, siendo responsabilidad del usuario revisarlos periódicamente.",
  },
  {
    titulo: "Aceptación",
    texto:
      "El uso continuado del sistema implica la aceptación plena de los presentes términos y condiciones.",
  },
];

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [yaAceptados, setYaAceptados] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAccepted(false);
      setYaAceptados(localStorage.getItem("termsAccepted") === "true");
    }
  }, [isOpen]);

  const handleAccept = () => {
    if (!accepted) return;

    localStorage.setItem("termsAccepted", "true");
    setVisible(false);
    onClose?.();
  };

  const handleDismiss = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <ModalBase
      maxWidth="max-w-lg"
      animado
      overlayClase="bg-black/70 backdrop-blur-md p-4"
      contenedorClase="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-6 shadow-2xl shadow-black/50 overflow-hidden"
      header={
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--page-primary-15)" }}
            >
              <FileText className="h-5 w-5" style={{ color: "var(--page-primary)" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--admin-texto-primario)]">
                Términos y Condiciones
              </h2>
              <p className="text-xs text-[var(--admin-texto-muted)]">
                Por favor, leé atentamente antes de continuar
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleDismiss}
            className={cn(CLASES_BOTON_CERRAR, "rounded-md w-7 h-7")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="max-h-[48vh] overflow-y-auto pr-2 space-y-4">
        {SECCIONES_TERMINOS.map((seccion) => (
          <div key={seccion.titulo}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--page-primary-tinta)]">
              {seccion.titulo}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--admin-texto-secundario)]">
              {seccion.texto}
            </p>
          </div>
        ))}
      </div>

      {yaAceptados ? (
        <div className="flex justify-end mt-5 pt-5 border-t border-[var(--admin-border)]">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl px-5 py-2.5 text-sm font-bold border border-[var(--admin-border-fuerte)] text-[var(--admin-texto-primario)] hover:bg-[color-mix(in_srgb,var(--page-bg-foreground)_10%,transparent)] transition-colors"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-5 border-t border-[var(--admin-border)]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
              style={{ accentColor: "var(--page-primary)" }}
            />
            <span className="text-xs leading-relaxed text-[var(--admin-texto-muted)]">
              He leído y acepto los Términos y Condiciones. Entiendo que el uso del sistema es bajo mi
              responsabilidad.
            </span>
          </label>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!accepted}
            className={
              accepted
                ? cn(CLASES_BOTON_MARCA, "rounded-xl px-5 py-2.5 text-sm font-bold w-full sm:w-auto")
                : "rounded-xl px-5 py-2.5 text-sm font-bold w-full sm:w-auto cursor-not-allowed text-[var(--admin-texto-muted)]"
            }
            style={accepted ? undefined : { backgroundColor: "var(--page-primary-20)" }}
          >
            Aceptar y continuar
          </button>
        </div>
      )}
    </ModalBase>
  );
}
