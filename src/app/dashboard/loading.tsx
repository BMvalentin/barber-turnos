export default function CargandoPanelUsuario() {
  return (
    <main
      className="min-h-screen w-full px-4 pb-12 pt-24"
      aria-label="Cargando panel de usuario"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-9 w-64 rounded-lg bg-[var(--admin-border)]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-2xl bg-[var(--admin-border)]" />
          <div className="h-28 rounded-2xl bg-[var(--admin-border)]" />
          <div className="h-28 rounded-2xl bg-[var(--admin-border)]" />
        </div>
        <div className="h-96 rounded-2xl bg-[var(--admin-border)]" />
      </div>
    </main>
  );
}
