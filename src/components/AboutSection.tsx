"use client";
import { motion } from "framer-motion";
import { Scissors, Star, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Scissors,
    title: "Cortes de Precisión",
    description: "Técnicas modernas y clásicas para un estilo impecable que resalte tu personalidad.",
  },
  {
    icon: Star,
    title: "Barberos Expertos",
    description: "Profesionales capacitados con años de experiencia en el mundo del grooming masculino.",
  },
  {
    icon: ShieldCheck,
    title: "Productos Premium",
    description: "Utilizamos solo las mejores marcas para el cuidado óptimo de tu cabello y barba.",
  },
];

export function AboutSection() {
  return (
    <section id="nosotros" className="py-20 md:py-32 bg-zinc-950 border-t border-white/5 mx-auto">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-zinc-900/50 rounded-[2rem] border border-white/10 px-6 py-10 md:p-10 shadow-2xl relative overflow-hidden group"
          >
            {/* Brillo sutil de fondo */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/10 to-zinc-600/10 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition duration-700" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-white/5 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Nuestra Esencia</span>
              </div>
              
              <h2 className="font-black text-3xl md:text-5xl text-white uppercase tracking-tighter mb-6">
                Sobre <span className="text-amber-500 italic pr-1">Nosotros</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                Somos una barbería nacida de la pasión por el estilo y la excelencia. 
                Nuestro objetivo es llevar el arte del grooming tradicional al siguiente nivel, 
                brindándote una experiencia superior donde cada detalle importa.
              </p>
              <p className="text-zinc-500 leading-relaxed">
                En nuestro espacio, un corte no es un trámite, es un ritual. 
                Relajate, disfrutá de una buena charla (o un buen silencio) y dejá 
                tu imagen en las mejores manos.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 md:space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex gap-4 p-5 md:p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-amber-500/30 hover:bg-zinc-900/60 transition-all shadow-xl group"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg tracking-wide mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
