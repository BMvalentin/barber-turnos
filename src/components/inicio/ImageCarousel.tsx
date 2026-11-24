"use client";

import Image from "next/image";
import { Carousel } from "@/components/ui/carousel/Carousel";
import { CarouselContent } from "@/components/ui/carousel/CarouselContent";
import { CarouselItem } from "@/components/ui/carousel/CarouselItem";
import { CarouselNext } from "@/components/ui/carousel/CarouselNext";
import { CarouselPrevious } from "@/components/ui/carousel/CarouselPrevious";
import type { ServicioSlide } from "@/lib/servicio-imagenes/construir-slides";
import { formatearMoneda } from "@/lib/utils/formatear-moneda";

const CLASE_FLECHA = "control-publico static size-11 translate-y-0 rounded-md border-[var(--admin-border-fuerte)] bg-[var(--admin-surface)] text-[var(--admin-texto-primario)] transition-colors hover:bg-[var(--admin-item)] hover:text-[var(--admin-texto-primario)]";

export function ImageCarousel({ slides }: { slides: ServicioSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <section id="servicios" aria-labelledby="titulo-servicios" className="scroll-mt-16 bg-[var(--page-bg)] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="titulo-servicios" className="mb-8 text-center text-3xl font-black tracking-[-0.04em] uppercase sm:text-4xl">
          Nuestros <span className="text-[var(--page-primary-tinta)] italic">Servicios</span>
        </h2>
        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps", breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } } }}
          aria-label="Galería de servicios"
          aria-roledescription="carrusel"
          className="mx-auto w-full max-w-4xl"
        >
          <CarouselContent className="-ml-3">
            {slides.map(({ servicio, imagen }, indice) => {
              const precioFinal = servicio.descuento > 0
                ? Math.round(servicio.precio * (1 - servicio.descuento / 100))
                : servicio.precio;

              return (
                <CarouselItem key={`${servicio.id}-${indice}`} className="basis-[80%] pl-3 min-[400px]:basis-1/2 md:basis-1/3">
                  <article className="relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-zinc-950 sm:aspect-square">
                    <Image
                      src={imagen ?? servicio.srcImage ?? "/images/avatar-default.svg"}
                      alt=""
                      fill
                      sizes="(max-width: 399px) 80vw, (max-width: 767px) 50vw, (max-width: 900px) 33vw, 300px"
                      className="-z-10 object-cover"
                    />
                    <div className="bg-zinc-950/90 p-3 sm:p-4">
                      <h3 className="text-sm leading-snug font-bold text-white [overflow-wrap:anywhere] sm:text-base">
                        {servicio.nombre}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums">
                        <span className="text-lg leading-tight font-bold text-[var(--page-primary-sobre-oscuro)]">
                          <span className="sr-only">Precio actual </span>${formatearMoneda(precioFinal)}
                        </span>
                        {servicio.descuento > 0 && (
                          <>
                            <s className="text-sm text-zinc-300"><span className="sr-only">Precio anterior </span>${formatearMoneda(servicio.precio)}</s>
                            <span className="rounded px-1.5 py-0.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/45">
                              <span aria-hidden="true">−{servicio.descuento}%</span>
                              <span className="sr-only">{servicio.descuento}% de descuento</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {slides.length > 1 && (
            <div className="mt-4 flex justify-end gap-2">
              <CarouselPrevious className={CLASE_FLECHA} aria-label="Servicio anterior" />
              <CarouselNext className={CLASE_FLECHA} aria-label="Servicio siguiente" />
            </div>
          )}
        </Carousel>
      </div>
    </section>
  );
}
