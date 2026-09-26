export default function CargandoPanelAdministrativo() {
  return (
    <div
      className="animate-pulse space-y-8"
      aria-label="Cargando panel administrativo"
      aria-busy="true"
    >
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-[var(--admin-border)]" />
        <div className="h-4 w-80 max-w-full rounded bg-[var(--admin-border)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <div
            key={indice}
            className="h-32 rounded-2xl bg-[var(--admin-border)]"
          />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-[var(--admin-border)]" />
    </div>
  );
}
