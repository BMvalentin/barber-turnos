"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import { getHorariosCompactos } from "@/actions/margenesHorario.actions";
export function LocationSection() {
  const [cargando, setCargando] = useState(true);
  const [horarios, setHorarios] = useState(["Cargando..."]);

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
  }, [])
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
                <p className="text-amber-100/80">Av. Montreal 1234, Santa Clara del Mar</p>
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-amber-500/50 transition-colors group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Phone className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-500 mb-1">Turnos y Consultas</h3>
                <p className="text-amber-100/80">+54 9 2233 42-7022</p>
              </div>
            </div>

            {/* HORARIOS */}
            <div className="flex gap-4 p-6 rounded-xl bg-neutral-900/50 border border-amber-900/30 shadow-2xl hover:border-amber-500/50 transition-colors group">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-500 mb-1">Horarios</h3>
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
              src=" https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.9940606991167!2d-57.512061936388314!3d-37.83702490472258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584d1ff53f35b6f%3A0x8e8b9a62a9991a2a!2z8J2RtPCdkoLwnZKa8J2SkPCdkpPwnZKC8J2Sm-KAmfCdkpQg8J2Sg_CdkoLwnZKT8J2Sg_CdkobwnZKT8J2SlPCdkonwnZKQ8J2SkQ!5e0!3m2!1ses-419!2sar!4v1783627136270!5m2!1ses-419!2sar"
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