const IMAGEN_FONDO = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2072&auto=format&fit=crop";

export default function FondoRegistro({ imagen = IMAGEN_FONDO }: { imagen?: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden sm:block">
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url('${imagen}')` }} />
      <div className="absolute inset-0 bg-linear-to-b from-[var(--page-bg)]/35 to-[var(--page-bg)]" />
    </div>
  );
}
