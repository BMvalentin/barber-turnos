
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { ServiciosCarousel } from "@/components/ServiciosCarousel";
export default function HomeClient() {

  return (
    <div className="min-h-screen justify-center items-center mx-auto">
      <main>
        <Hero/>
        <ServiciosCarousel/>
        {/* <AboutSection /> */}
        <LocationSection />
      </main>
    </div>
  );
}
