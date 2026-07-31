import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
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
        {/* <AboutSection /> */}
        <LocationSection config={config}/>
      </main>
    </div>
  );
}