"use client";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface ImageCarouselProps {
  servicios: any[];
  config?: {
    primaryColor?: string | null;
  } | null;
}

export function ImageCarousel({ servicios, config }: ImageCarouselProps) {
  if (!servicios || servicios.length === 0) return null;

  const primaryColor = config?.primaryColor || "#d97706"; // Color por defecto (amber)

  return (
    <section id="servicios" className="py-12 bg-zinc-950 border-t border-white/5">
      <div className="container px-4 max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
            Nuestros <span className="italic" style={{ color: primaryColor }}>Servicios</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
            className="w-full max-w-4xl mx-auto relative"
          >
            <CarouselContent className="-ml-2">
              {servicios.map((servicio) => (
                <CarouselItem key={servicio.id} className="pl-2 basis-1/2 md:basis-1/3 lg:basis-1/3">

                  <div className="group relative overflow-hidden rounded-2xl aspect-square bg-zinc-900 shadow-lg border border-white/5">
                    <Image
                      src={servicio.srcImage || "/placeholder.jpg"}
                      alt={servicio.nombre}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black to-black/20 transition-opacity" />

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate">
                        {servicio.nombre}
                      </h3>
                      <div className="flex items-end gap-2">
                        {servicio.descuento > 0 ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ${servicio.precio}
                            </span>

                            <h2 className="text-xl font-bold leading-none" style={{ color: primaryColor }}>
                              $
                              {Math.round(
                                servicio.precio - (servicio.precio * servicio.descuento) / 100
                              )}
                            </h2>

                            <span className="text-xs font-semibold text-green-400 mb-0.5">
                              {servicio.descuento}% OFF
                            </span>
                          </>
                        ) : (
                          <h2 className="text-lg font-bold" style={{ color: primaryColor }}>
                            ${servicio.precio}
                          </h2>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Flechas con hover dinámico usando el color primario */}
            <CarouselPrevious 
              className="absolute left-2 z-50 h-8 w-8 bg-zinc-900 text-white border-white/10 hover:text-white" 
              style={{ ['--tw-hover-bg' as any]: primaryColor }}
            />
            <CarouselNext 
              className="absolute right-2 z-50 h-8 w-8 bg-zinc-900 text-white border-white/10 hover:text-white" 
            />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}