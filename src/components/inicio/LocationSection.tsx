// src/components/inicio/LocationSection.tsx
"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { getHorariosCompactos } from "@/actions/horarios/horarios-compactos.actions";

interface LocationSectionProps {
  config?: {
    mapsUrl?: string | null;
    address?: string | null;
    whatsapp?: string | null;
  } | null;
}

export function LocationSection({ config }: LocationSectionProps) {
  const [cargando, setCargando] = useState(true);
  const [horarios, setHorarios] = useState(["Cargando..."]);

  // Valores configurables desde /admin/config/ubicacion-contacto
  const mapsUrl = config?.mapsUrl;
  const addressText = config?.address;
  const whatsapp = config?.whatsapp;

  useEffect(() => {
    try {
      getHorariosCompactos().then((res) => {
        if (res.length > 0) {
          setHorarios(res);
        } else {
          setHorarios(["Cerrado"]);
        }
      });
    } catch {
      setHorarios(["Error al cargar horarios"]);
    } finally {
      setCargando(false);
    }
  }, []);

  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-linear-to-b from-[var(--page-bg)]/90 to-[var(--page-bg)] justify-center items-center mx-auto border-y border-[var(--admin-border)]">
      <div className="container justify-around items-center mx-auto px-4">

        {/* HEADER DE LA SECCIÓN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 justify-around items-center"
        >
          <div 
            className="inline-flex items-center justify-center p-2 mb-4 rounded-full border"
            style={{ 
              backgroundColor: "var(--page-primary-15)", 
              borderColor: "var(--page-primary-30)" 
            }}
          >
            <Scissors className="w-5 h-5" style={{ color: "var(--admin-texto-primario)" }} />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-[var(--page-bg-foreground)]">
            Nuestra <span className="italic" style={{ color: "var(--page-primary-tinta)" }}>Ubicación</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center justify-center px-2 md:px-12">

          {/* TARJETAS DE INFORMACIÓN */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 items-center justify-center w-full md:max-w-[35vw] mx-auto"
          >
            {/* DIRECCIÓN */}
            {addressText && (
              <div className="flex gap-4 p-6 rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-2xl hover:border-[var(--admin-border-fuerte)] transition-colors group">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "var(--page-primary-15)" }}
                >
                  <MapPin className="w-6 h-6" style={{ color: "var(--admin-texto-primario)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--page-primary-tinta)" }}>Dirección</h3>
                  <p className="text-[var(--page-bg-foreground)]/80">{addressText}</p>
                </div>
              </div>
            )}

            {/* TELÉFONO */}
            {whatsapp && (
              <div className="flex gap-4 p-6 rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-2xl hover:border-[var(--admin-border-fuerte)] transition-colors group">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "var(--page-primary-15)" }}
                >
                  <Phone className="w-6 h-6" style={{ color: "var(--admin-texto-primario)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--page-primary-tinta)" }}>Turnos y Consultas</h3>
                  <p className="text-[var(--page-bg-foreground)]/80">{whatsapp}</p>
                </div>
              </div>
            )}

            {/* HORARIOS */}
            <div className="flex gap-4 p-6 rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-2xl hover:border-[var(--admin-border-fuerte)] transition-colors group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--page-primary-15)" }}
              >
                <Clock className="w-6 h-6" style={{ color: "var(--admin-texto-primario)" }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--page-primary-tinta)" }}>Horarios</h3>
                {cargando ? (
                  <p className="text-[var(--page-bg-foreground)]/80">Cargando horarios...</p>
                ) : (
                  horarios.map((horario, index) => (
                    <p key={index} className="text-[var(--page-bg-foreground)]/80">
                      {horario}
                    </p>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* MAPA */}
          {mapsUrl && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-xl overflow-hidden border border-[var(--admin-border)] h-[450px] bg-[var(--admin-surface)] shadow-2xl group"
            >
              {/* Overlay estético para el mapa */}
              <div className="absolute inset-0 bg-[var(--page-secondary-08)] pointer-events-none group-hover:bg-transparent transition-colors z-10" />

              <iframe
                src={mapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.8) invert(0.9) contrast(1.2)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la Barbería"
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
