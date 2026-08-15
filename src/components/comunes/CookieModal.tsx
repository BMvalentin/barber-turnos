"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { CLASES_BOTON_MARCA, CLASES_BOTON_CERRAR } from "@/lib/constants";

interface CookieModalProps {
  onAccept?: () => void;
}

export default function CookieModal({ onAccept }: CookieModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem("cookiesAcknowledged");
    if (!acknowledged) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAcknowledged", "true");
    setVisible(false);
    onAccept?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] w-auto sm:w-full sm:max-w-sm rounded-2xl border border-[var(--page-bg-foreground)]/10 bg-[var(--page-bg)]/80 backdrop-blur-xl shadow-2xl shadow-black/40 p-5"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--page-primary-15)" }}
            >
              <Cookie
                className="h-5 w-5"
                style={{ color: "var(--page-primary)" }}
              />
            </div>
            <h2 className="flex-1 text-sm font-bold uppercase tracking-wider text-[var(--page-bg-foreground)]">
              Uso de cookies
            </h2>
            <button
              type="button"
              onClick={acceptCookies}
              className={`${CLASES_BOTON_CERRAR} rounded-md w-7 h-7`}
              aria-label="Cerrar aviso de cookies"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--page-bg-foreground)]/70">
            Este sitio utiliza cookies esenciales para gestionar la autenticación y el
            funcionamiento seguro de la aplicación. Los datos de contacto se usan únicamente
            para gestionar cuentas y turnos.
          </p>
          <button
            type="button"
            onClick={acceptCookies}
            className={`${CLASES_BOTON_MARCA} rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider mt-4`}
          >
            Entendido
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
