"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

export function LocationSection() {
  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-celeste/10 justify-center items-center mx-auto">
      <div className="container justify-around items-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 justify-around items-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Nuestra <span className="text-celeste-dark">Ubicación</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Visitanos y dejá tu vehículo en las mejores manos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center justify-center px-2 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 items-center justify-center w-full md:max-w-[35vw] mx-auto "
          >
            <div className="flex gap-4 p-6 rounded-xl bg-white border border-celeste/20 shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dirección</h3>
                <p className="text-muted-foreground">Av. Principal 1234, Ciudad</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl  bg-white border border-celeste/20  shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <Phone className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                <p className="text-muted-foreground">+54 11 1234-5678</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl  bg-white border border-celeste/20  shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <Clock className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Horarios</h3>
                <p className="text-muted-foreground">Lun - Sáb: 8:00 - 19:00</p>
                <p className="text-muted-foreground">Dom: 9:00 - 14:00</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden border border-celeste/20 h-[400px] bg-white  shadow-2xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0168878895436!2d-58.38375908477032!3d-34.60373888045943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa9f0a6da5edb%3A0x11bead4e234e558b!2sObelisco!5e0!3m2!1ses!2sar!4v1620000000000!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(1) contrast(1.1)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación AutoShine"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
