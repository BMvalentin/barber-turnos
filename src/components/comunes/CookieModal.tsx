"use client";
import { useState, useEffect } from "react";
import ModalBase from "@/components/ui/ModalBase";

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
    onAccept?.(); // 🔥 dispara el siguiente paso
  };

  if (!visible) return null;

  return (
    <ModalBase
      titulo="Uso de cookies"
      maxWidth="max-w-md"
      overlayClase="z-[9999]"
      contenedorClase="bg-black rounded-2xl p-6 border-2 border-white text-center"
      tituloClase="text-xl font-semibold mb-2 text-white"
    >
      <p className="text-gray-400 text-sm mb-4">
          Este sitio utiliza cookies esenciales para gestionar la autenticación
          de usuarios y garantizar el funcionamiento seguro de la aplicación.
          Además, pueden almacenarse datos de contacto proporcionados por los
          usuarios con el único fin de gestionar cuentas, tickets y operaciones
          dentro del sistema.
        </p>

        <button
          onClick={acceptCookies}
          className="px-4 py-2 rounded-xl border border-gray-300 text-white hover:bg-white hover:text-black transition"
        >
          Entendido
        </button>

        <p className="text-xs text-gray-500 mt-3">
          Debés aceptar para continuar.
        </p>

    </ModalBase>
  );
}