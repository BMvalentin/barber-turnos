"use client";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay"
import { Carousel } from "@/components/ui/carousel/Carousel";
import { CarouselContent } from "@/components/ui/carousel/CarouselContent";
import { CarouselItem } from "@/components/ui/carousel/CarouselItem";
import { CarouselNext } from "@/components/ui/carousel/CarouselNext";
import { CarouselPrevious } from "@/components/ui/carousel/CarouselPrevious";
import Image from "next/image";
import type { ServicioSlide } from "@/lib/servicio-imagenes/construir-slides";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

interface ImageCarouselProps {
  slides: ServicioSlide[];
}

/* El carrusel recibe slides ya construidos (1 imagen = 1 item).
   Cada slide muestra UNA imagen + la info del servicio correspondiente.
   No se agrupan varias imágenes del mismo servicio en una misma tarjeta. */
export function ImageCarousel({ slides }: ImageCarouselProps) {
  if (!slides || slides.length === 0) return null;

  return (
    <section id="servicios" className="py-12 bg-[var(--page-bg)]">
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
            className="w-full relative"
          >
            <CarouselContent className="-ml-4">
              {slides.map(({ servicio, imagen }, indice) => {
                const precioFinal = Math.round(
                  servicio.precio - (servicio.precio * servicio.descuento) / 100
                );

                return (
                  <CarouselItem
                    key={`${servicio.id}-${indice}`}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-[var(--admin-surface)] shadow-md">
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <Image
                          src={imagen ?? servicio.srcImage ?? "/images/avatar-default.svg"}
                          alt={servicio.nombre}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="min-w-0 truncate text-lg font-bold uppercase tracking-tight text-[var(--page-bg-foreground)]">
                            {servicio.nombre}
                          </h3>

                          {servicio.descuento > 0 ? (
                            <div className="shrink-0 text-right">
                              <span className="block text-[11px] text-[var(--admin-texto-muted)] line-through">
                                ${formatearMoneda(servicio.precio)}
                              </span>
                              <div className="flex items-center justify-end gap-1.5">
                                <span
                                  className="text-lg font-bold leading-none"
                                  style={{ color: "var(--page-primary-tinta)" }}
                                >
                                  ${formatearMoneda(precioFinal)}
                                </span>
                                <span
                                  className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: "var(--page-primary)", color: "var(--page-primary-foreground)" }}
                                >
                                  {servicio.descuento}% OFF
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span
                              className="shrink-0 text-lg font-bold leading-none"
                              style={{ color: "var(--page-primary-tinta)" }}
                            >
                              ${formatearMoneda(servicio.precio)}
                            </span>
                          )}
                        </div>

                        {servicio.descripcion && (
                          <p className="line-clamp-2 text-sm text-[var(--admin-texto-muted)]">
                            {servicio.descripcion}
                          </p>
                        )}
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Flechas asociadas al carrusel, fuera del contenido de las tarjetas */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <CarouselPrevious
                className="static translate-y-0 h-9 w-9 rounded-full bg-[var(--admin-surface)] text-[var(--page-bg-foreground)] border-[var(--page-bg-foreground)]/10 hover:text-[var(--page-bg-foreground)]"
              />
              <CarouselNext
                className="static translate-y-0 h-9 w-9 rounded-full bg-[var(--admin-surface)] text-[var(--page-bg-foreground)] border-[var(--page-bg-foreground)]/10 hover:text-[var(--page-bg-foreground)]"
              />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
