"use client";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay"
import { Carousel } from "@/components/ui/carousel/Carousel";
import { CarouselContent } from "@/components/ui/carousel/CarouselContent";
import { CarouselItem } from "@/components/ui/carousel/CarouselItem";
import { CarouselNext } from "@/components/ui/carousel/CarouselNext";
import { CarouselPrevious } from "@/components/ui/carousel/CarouselPrevious";
import Image from "next/image";
import type { ServicioCarrusel } from "@/types/servicio";

interface ImageCarouselProps {
  servicios: ServicioCarrusel[];
}

export function ImageCarousel({ servicios }: ImageCarouselProps) {
  if (!servicios || servicios.length === 0) return null;

  return (
    <section id="servicios" className="py-12 bg-[var(--page-bg)] border-t border-[var(--page-bg-foreground)]/5">
      <div className="container px-4 max-w-6xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-black text-[var(--page-bg-foreground)] uppercase tracking-tighter">
            Nuestros <span className="italic" style={{ color: "var(--page-primary-tinta)" }}>Servicios</span>
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

                  <div className="group relative overflow-hidden rounded-2xl aspect-square bg-[var(--admin-surface)] shadow-lg border border-[var(--page-bg-foreground)]/5">
                    <Image
                      src={servicio.srcImage || "/images/avatar-default.svg"}
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

                            <h2 className="text-xl font-bold leading-none" style={{ color: "var(--page-primary-sobre-oscuro)" }}>
                              $
                              {Math.round(
                                servicio.precio - (servicio.precio * servicio.descuento) / 100
                              )}
                            </h2>

                            <span 
                              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-0.5"
                              style={{ backgroundColor: "var(--page-primary)", color: "var(--page-primary-foreground)" }}
                            >
                              {servicio.descuento}% OFF
                            </span>
                          </>
                        ) : (
                          <h2 className="text-lg font-bold" style={{ color: "var(--page-primary-sobre-oscuro)" }}>
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
              className="absolute left-2 z-50 h-8 w-8 bg-[var(--admin-surface)] text-[var(--page-bg-foreground)] border-[var(--page-bg-foreground)]/10 hover:text-[var(--page-bg-foreground)]" 
            />
            <CarouselNext 
              className="absolute right-2 z-50 h-8 w-8 bg-[var(--admin-surface)] text-[var(--page-bg-foreground)] border-[var(--page-bg-foreground)]/10 hover:text-[var(--page-bg-foreground)]" 
            />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
