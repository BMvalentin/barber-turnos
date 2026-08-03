"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const TIMEZONE_NEGOCIO = "America/Argentina/Buenos_Aires";

type Props = {
  numeroWhatsApp: string;
  servicioNombre?: string;
  barberoNombre?: string;
  clienteNombre?: string | null;
  horarioReservado?: string | Date | null;
};

export default function RedireccionWhatsApp({
  numeroWhatsApp,
  servicioNombre,
  barberoNombre,
  clienteNombre,
  horarioReservado,
}: Props) {
  const [mostrarBoton, setMostrarBoton] = useState(false);

  const urlWhatsApp = useMemo(() => {
    const numeroLimpio = (numeroWhatsApp || "").replace(/\D/g, "");
    if (!numeroLimpio) return "";

    const partes: string[] = ["Hola! Confirmé mi turno:"];

    if (horarioReservado) {
      const fecha = new Date(horarioReservado);
      if (!isNaN(fecha.getTime())) {
        const formateadorDia = new Intl.DateTimeFormat("es-AR", {
          weekday: "long",
          timeZone: TIMEZONE_NEGOCIO,
        });
        const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: TIMEZONE_NEGOCIO,
        });
        const formateadorHora = new Intl.DateTimeFormat("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: TIMEZONE_NEGOCIO,
        });

        const dia = formateadorDia.format(fecha);
        const diaCapitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
        partes.push(`📅 Día: ${diaCapitalizado} ${formateadorFecha.format(fecha)}`);
        partes.push(`⏰ Horario: ${formateadorHora.format(fecha)}`);
      }
    }

    if (servicioNombre) partes.push(`✂️ Servicio: ${servicioNombre}`);
    if (barberoNombre) partes.push(`💈 Barbero: ${barberoNombre}`);
    if (clienteNombre) partes.push(`👤 Cliente: ${clienteNombre}`);

    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(partes.join("\n"))}`;
  }, [numeroWhatsApp, servicioNombre, barberoNombre, clienteNombre, horarioReservado]);

  useEffect(() => {
    if (!urlWhatsApp) return;

    // Pequeña pausa para que la página de éxito se vea y el servidor confirme
    const timeout = setTimeout(() => {
      window.location.href = urlWhatsApp;
    }, 800);

    return () => clearTimeout(timeout);
  }, [urlWhatsApp]);

  useEffect(() => {
    if (!urlWhatsApp) return;
    // Fallback: si el navegador bloqueó la redirección, mostramos el botón
    const timeout = setTimeout(() => setMostrarBoton(true), 4000);
    return () => clearTimeout(timeout);
  }, [urlWhatsApp]);

  if (!urlWhatsApp) return null;

  return (
    <div className="space-y-3">
      {mostrarBoton && (
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Abrir WhatsApp
        </a>
      )}
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
      >
        <ArrowRight className="w-5 h-5" />
        Ver mis turnos
      </Link>
    </div>
  );
}
