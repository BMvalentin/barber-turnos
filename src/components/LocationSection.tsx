// components/LocationSection.tsx
"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { getHorariosCompactos } from "@/actions/margenesHorario.actions";

interface LocationSectionProps {
  config?: {
    mapsUrl?: string | null;
    address?: string | null;
  } | null;
}

export function LocationSection({ config }: LocationSectionProps) {
  const [cargando, setCargando] = useState(true);
  const [horarios, setHorarios] = useState(["Cargando..."]);

  // Valores dinámicos con respaldo (fallback) por defecto
  const defaultMapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0192837384024!2d-57.4907996!3d-37.8152345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584c31bc9e4c9c7%3A0x6b4ef821f5728a3f!2sAv.%20Montreal%20695%2C%20B7609%20Santa%20Clara%20del%20Mar%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar";
  const mapsUrl = config?.mapsUrl || defaultMapsUrl;
  const addressText = config?.address || "Av. Montreal 695, Santa Clara del Mar";

  useEffect(() => {
    try {
      getHorariosCompactos().then((res) => {
        if (res.length > 0) {
          setHorarios(res);
        } else {
          setHorarios(["Cerrado"]);
        }
      });
    } catch (error) {
      setHorarios(["Error al cargar horarios"]);
    } finally {
      setCargando(false);
    }
  }, []);

  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-linear-to-b from-black/90 to-black justify-center items-center mx-auto border-y border-amber-900/20">
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
            <Scissors className="w-5 h-5" style={{ color: "var(--page-primary)" }} />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-white">
            Nuestra <span className="italic" style={{ color: "var(--page-primary)" }}>Ubicación</span>
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
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-[var(--page-primary)]/50 transition-colors group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--page-primary-15)" }}
              >
                <MapPin className="w-6 h-6" style={{ color: "var(--page-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--page-primary)" }}>Dirección</h3>
                <p className="text-amber-100/80">{addressText}</p>
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-[var(--page-primary)]/50 transition-colors group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--page-primary-15)" }}
              >
                <Phone className="w-6 h-6" style={{ color: "var(--page-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--page-primary)" }}>Turnos y Consultas</h3>
                <p className="text-amber-100/80">+54 9 2233 42-7022</p>
              </div>
            </div>

            {/* HORARIOS */}
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-[var(--page-primary)]/50 transition-colors group">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: "var(--page-primary-15)" }}
              >
                <Clock className="w-6 h-6" style={{ color: "var(--page-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--page-primary)" }}>Horarios</h3>
                {cargando ? (
                  <p className="text-amber-100/80">Cargando horarios...</p>
                ) : (
                  horarios.map((horario, index) => (
                    <p key={index} className="text-amber-100/80">
                      {horario}
                    </p>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* MAPA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-xl overflow-hidden border border-amber-900/30 h-[450px] bg-neutral-900 shadow-2xl group"
          >
            {/* Overlay estético para el mapa */}
            <div className="absolute inset-0 bg-amber-950/5 pointer-events-none group-hover:bg-transparent transition-colors z-10" />

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
        </div>
      </div>
    </section>
  );
}