import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const DEFAULT_BACKGROUND =
  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2070&auto=format&fit=crop";

interface HeroProps {
  config?: {
    slogan?: string | null;
    description?: string | null;
    backgroundImage?: string | null;
  } | null;
}

export function Hero({ config }: HeroProps) {
  const backgroundImage = config?.backgroundImage || DEFAULT_BACKGROUND;
  const slogan = config?.slogan || "Corte Impecable - Actitud y Estilo";
  const description = config?.description || "Más que un corte, brindamos un servicio pensado para que te veas y te sientas bien. Atención profesional, precisión en cada detalle.";
  const [primera, segunda, ...resto] = slogan.trim().split(/\s+/);
  const textoPrincipal = [primera, segunda].filter(Boolean).join(" ");

  return (
    <section id="home" className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-zinc-950 pt-28 pb-24 text-white sm:pt-32 sm:pb-28">
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/80" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-16 bg-linear-to-t from-[var(--page-bg)] to-transparent sm:h-20" />

      <div className="entrada-inicio mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
        <h1 className="mx-auto max-w-4xl text-4xl leading-[1.08] font-black tracking-[-0.04em] uppercase text-balance [overflow-wrap:anywhere] sm:text-5xl md:text-6xl lg:text-7xl">
          {textoPrincipal}{resto.length > 0 && <> <span className="pr-1 text-[var(--page-primary-sobre-oscuro)] italic">{resto.join(" ")}</span></>}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed font-medium text-zinc-200 [overflow-wrap:anywhere] sm:mt-6 sm:text-lg">
          {description}
        </p>
        <Link href="/dashboard?tab=turnos" className="boton-foto mx-auto mt-8 inline-flex min-h-12 max-w-full items-center justify-center gap-2.5 rounded-md border px-6 py-3 text-sm font-bold tracking-wide uppercase transition-colors sm:mt-10 sm:px-8 sm:text-base">
          Reservá tu turno <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
