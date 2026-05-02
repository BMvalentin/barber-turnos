"use client";

import { Hero } from "@/components/Hero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { AboutSection } from "@/components/AboutSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";

export default function HomeClient() {

  return (
      <div className="min-h-screen justify-center items-center mx-auto">
        <main>
          <Hero onBookingClick={() => {}} />
          <ImageCarousel />
          <AboutSection />
          <LocationSection />
        </main>
      </div>
  );
}
