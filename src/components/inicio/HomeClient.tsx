import { Hero } from "@/components/inicio/Hero";
import { LocationSection } from "@/components/inicio/LocationSection";
import { ServiciosCarousel } from "@/components/inicio/ServiciosCarousel";
import type { PageConfig } from "../../../generated/prisma/client";

// Definís la interfaz para las props
interface HomeClientProps {
  config?: PageConfig | null;
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