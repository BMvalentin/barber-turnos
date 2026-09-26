export default function CargandoTurnos() {
  return (
    <div className="min-h-screen w-full overflow-x-clip p-2 pt-24 sm:p-6 md:pt-24">
      <div
        className="container mx-auto max-w-7xl animate-pulse space-y-5"
        aria-label="Cargando turnos"
        aria-busy="true"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-lg bg-[var(--admin-border)]" />
            <div className="h-4 w-80 max-w-full rounded bg-[var(--admin-border)]" />
          </div>
          <div className="h-12 w-44 rounded-xl bg-[var(--admin-border)]" />
        </div>
        <div className="h-10 w-full rounded-xl bg-[var(--admin-border)]" />
        <div className="space-y-3 rounded-xl border border-[var(--admin-border)] p-4">
          {Array.from({ length: 5 }).map((_, indice) => (
            <div key={indice} className="h-16 rounded-xl bg-[var(--admin-border)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
