"use client";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import servicioCorte from "@/assets/servicio-corte.jpg";
import servicioBarba from "@/assets/servicio-barba.jpg";
import servicioTintura from "@/assets/servicio-tintura.jpg";
import Image from "next/image";

const images = [
  { 
    src: servicioCorte, 
    alt: "Corte de cabello moderno y clásico", 
    title: "Corte de Pelo",
    description: "Corte de precisión y estilo a medida de tus facciones."
  },
  { 
    src: servicioBarba, 
    alt: "Corte y perfilado de barba", 
    title: "Corte de Barba",
    description: "Diseño, recorte y cuidado impecable con productos premium."
  },
  { 
    src: servicioTintura, 
    alt: "Servicio de tintura", 
    title: "Tintura",
    description: "Tintura profesional para darle un nuevo estilo a tu cabello o barba."
  },
];

export function ImageCarousel() {
  return (
    <section id="servicios" className="py-20 md:py-32 bg-zinc-950 border-t border-white/5 mx-auto">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-white/5 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Lo que hacemos</span>
          </div>
          <h2 className="font-black text-3xl md:text-5xl text-white uppercase tracking-tighter mb-4">
            Nuestros <span className="text-amber-500 italic pr-1">Servicios</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Cada detalle cuenta. Ofrecemos una gama de servicios diseñados para 
            resaltar tu mejor versión, combinando las técnicas clásicas con un toque urbano.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 md:-ml-6 py-4">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                  <div className="group relative overflow-hidden rounded-[1.5rem] aspect-[4/5] sm:aspect-[4/3] bg-zinc-900 shadow-xl border border-white/10">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    {/* Gradiente estilo viñeta que sube */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="w-8 h-1 bg-amber-500 mb-4 rounded-full" />
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-amber-500 transition-colors">
                        {image.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 md:-left-12 lg:-left-16 bg-zinc-900 border-white/10 text-white hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-500 transition-all" />
            <CarouselNext className="hidden md:flex -right-4 md:-right-12 lg:-right-16 bg-zinc-900 border-white/10 text-white hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-500 transition-all" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
