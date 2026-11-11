"use client";

import { Hero } from "@/components/inicio/Hero";
import { LocationSection } from "@/components/inicio/LocationSection";
import { ServiciosCarousel } from "@/components/inicio/ServiciosCarousel";

interface HomeClientProps {
  config?: {
    slogan: string | null;
    description: string | null;
    backgroundImage: string | null;
    mapsUrl: string | null;
    address: string | null;
    whatsapp: string | null;
  } | null;
}

export default function HomeClient({ config }: HomeClientProps) {
  return (
    <div className="min-h-screen justify-center items-center mx-auto">
      <main>
        <Hero config={config} />
        <ServiciosCarousel />
          <LocationSection config={config} />
      </main>
    </div>
  );
}
