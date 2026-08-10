import { Hero } from "@/components/Hero";
import { LocationSection } from "@/components/LocationSection";
import { ServiciosCarousel } from "@/components/ServiciosCarousel";

// Definís la interfaz para las props
interface HomeClientProps {
  config?: any; // O tipalo con tu modelo de Prisma
}

export default function HomeClient({ config }: HomeClientProps) {
  return (
    <div className="min-h-screen justify-center items-center mx-auto">
      <main>
        <Hero config={config} />
        <ServiciosCarousel />
        <LocationSection />
      </main>
    </div>
  );
}