"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Scissors } from "lucide-react";

export function LocationSection() {
  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-linear-to-b from-black/90 to-black  justify-center items-center mx-auto border-y border-amber-900/20">
      <div className="container justify-around items-center mx-auto px-4">
        
        {/* HEADER DE LA SECCIÓN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 justify-around items-center"
        >
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-amber-500/10 border border-amber-500/20">
             <Scissors className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-white">
            Nuestra <span className="text-amber-500 text-shadow-amber">Ubicación</span>
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
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-amber-500/50 transition-colors group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <MapPin className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-500 mb-1">Dirección</h3>
                <p className="text-amber-100/80">Av. de los Barberos 1234, Barrio Norte</p>
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-amber-500/50 transition-colors group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Phone className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-500 mb-1">Turnos y Consultas</h3>
                <p className="text-amber-100/80">+54 11 1234-5678</p>
              </div>
            </div>

            {/* HORARIOS */}
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-amber-500/50 transition-colors group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-500 mb-1">Horarios de Atención</h3>
                <p className="text-amber-100/80">Mar - Vie: 10:00 - 20:00</p>
                <p className="text-amber-100/80">Sábados: 09:00 - 21:00</p>
                <p className="text-amber-200/40 text-xs mt-1 italic font-light">Domingos y Lunes cerrado</p>
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016887889407!2d-58.3815704!3d-34.6037389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa0d3049103f57f%3A0x6961474d2b27137b!2sObelisco!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
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