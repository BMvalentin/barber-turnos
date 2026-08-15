"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import ModalBase from "@/components/ui/ModalBase";
import { cn } from "@/lib/utils/cn";
import { CLASES_BOTON_CERRAR } from "@/lib/constants";

interface PrivacyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SeccionPrivacidad {
  titulo: string;
  texto: string;
}

const SECCIONES_PRIVACIDAD: SeccionPrivacidad[] = [
  {
    titulo: "Datos recopilados",
    texto:
      "Esta aplicación recopila y almacena datos proporcionados por los usuarios, como correo electrónico y teléfono, con el único fin de gestionar cuentas, operaciones y tickets dentro del sistema.",
  },
  {
    titulo: "Uso de los datos",
    texto:
      "Los datos no son vendidos ni compartidos con terceros, salvo cuando sea necesario para autenticación mediante servicios externos o por obligación legal.",
  },
  {
    titulo: "Acceso a la información",
    texto:
      "El acceso a la información está limitado a administradores del sistema, quienes pueden utilizar los datos únicamente con fines operativos.",
  },
  {
    titulo: "Derechos del usuario",
    texto:
      "Los usuarios pueden solicitar la modificación o eliminación de sus datos en cualquier momento.",
  },
  {
    titulo: "Seguridad",
    texto:
      "Se aplican medidas de seguridad razonables para proteger la información, aunque no se garantiza seguridad absoluta.",
  },
];

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem("cookiesAcknowledged");
    const privacySeen = localStorage.getItem("privacySeen");

    if (cookiesAccepted && !privacySeen) {
      const timer = setTimeout(() => {
        setVisible(true);
        localStorage.setItem("privacySeen", "true");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <ModalBase
      header={
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--page-primary-15)" }}
            >
              <ShieldCheck
                className="h-5 w-5"
                style={{ color: "var(--page-primary)" }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--admin-texto-primario)]">
                Política de Privacidad
              </h2>
              <p className="text-xs text-[var(--admin-texto-muted)]">
                Cómo tratamos y protegemos tus datos
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleClose}
            className={cn(CLASES_BOTON_CERRAR, "rounded-md w-7 h-7")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      }
      maxWidth="max-w-lg"
      animado
      overlayClase="bg-black/70 backdrop-blur-md p-4"
      contenedorClase="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface-elevated)] p-6 shadow-2xl shadow-black/50 overflow-hidden"
    >
      <div className="max-h-[48vh] overflow-y-auto pr-2 space-y-4">
        {SECCIONES_PRIVACIDAD.map((seccion) => (
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

      <div className="flex justify-end mt-5 pt-5 border-t border-[var(--admin-border)]">
        <button
          onClick={handleClose}
          className="rounded-xl px-5 py-2.5 text-sm font-bold border border-[var(--admin-border-fuerte)] text-[var(--admin-texto-primario)] hover:bg-[color-mix(in_srgb,var(--page-bg-foreground)_10%,transparent)] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </ModalBase>
  );
}
