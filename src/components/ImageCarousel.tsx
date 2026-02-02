"use client";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import carwashDetail1 from "@/assets/carwash-detail-3.jpg";
import carwashDetail2 from "@/assets/carwash-detail-2.jpg";
import carwashDetail3 from "@/assets/carwash-detail-1.jpg";
import Image from "next/image";


const images = [
  { src: carwashDetail1, alt: "Limpieza exterior profesional", title: "Lavado Exterior" },
  { src: carwashDetail2, alt: "Limpieza interior detallada", title: "Limpieza Interior" },
  { src: carwashDetail3, alt: "Pulido con un acabado brillante", title: "Pulido" },
];

export function ImageCarousel() {
  return (
    <section id="servicios" className="py-20 md:py-32 bg-celeste/10  mx-auto">
      <div className="container  mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Nuestros <span className="text-celeste-dark">Servicios</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cada detalle cuenta. Ofrecemos un servicio integral para que tu vehículo luzca como nuevo.
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
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {images.map((image, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="group relative overflow-hidden rounded-xl aspect-[4/3] shadow-[0_10px_40px_-10px_hsl(210,25%,10%/0.3)]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60">
                      <h3 className="text-lg font-semibold text-white">{image.title}</h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 bg-secondary border-border hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="hidden md:flex -right-12 bg-secondary border-border hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
