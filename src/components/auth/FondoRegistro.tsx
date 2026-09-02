export default function FondoRegistro() {
  return <>
    <div className="absolute inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2072&auto=format&fit=crop')" }} />
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/90 to-[var(--page-bg)]" />
    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--page-primary)]/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--page-primary)] to-transparent" />
    </div>
  </>;
}
