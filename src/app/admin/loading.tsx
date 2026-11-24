export default function CargandoPanelAdministrativo() {
  return (
    <div className="admin-pagina" role="status" aria-label="Cargando panel administrativo" aria-busy="true">
      <div className="space-y-3 motion-safe:animate-pulse" aria-hidden="true">
        <div className="h-8 w-40 rounded-lg bg-[var(--admin-item-hover)]" />
        <div className="h-4 w-72 max-w-full rounded bg-[var(--admin-item)]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div key={indice} className="admin-card grid gap-3 p-4 motion-safe:animate-pulse">
            <div className="size-5 rounded bg-[var(--admin-item)]" />
            <div className="h-6 w-1/3 rounded bg-[var(--admin-item)]" />
          </div>
        ))}
      </div>
      <div className="admin-card h-60 motion-safe:animate-pulse" aria-hidden="true" />
    </div>
  );
}
