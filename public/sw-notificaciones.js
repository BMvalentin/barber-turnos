const TURNOS_CLIENTE = "/dashboard?tab=turnos";
const DESTINOS_AVISOS = new Set([TURNOS_CLIENTE, "/admin/turno?agenda=personal"]);

function destinoSeguro(valor) {
  return DESTINOS_AVISOS.has(valor) ? valor : TURNOS_CLIENTE;
}

self.addEventListener("push", (evento) => {
  let datos;
  try {
    datos = evento.data?.json();
  } catch {
    // El aviso genérico también cubre mensajes sin datos válidos.
  }
  const titulo = typeof datos?.titulo === "string" && datos.titulo ? datos.titulo : "Aviso de turnos";
  const opciones = {
    body: typeof datos?.cuerpo === "string" ? datos.cuerpo : "Abrí la app para consultar tus turnos.",
    icon: "/images/app-icon-192.png",
    tag: typeof datos?.tag === "string" ? datos.tag : undefined,
    data: { destino: destinoSeguro(datos?.destino) },
  };
  evento.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const destino = new URL(destinoSeguro(evento.notification.data?.destino), self.location.origin);
  if (destino.pathname === "/dashboard") destino.searchParams.set("desde", "aviso");
  evento.waitUntil(abrirAgenda(destino));
});

async function abrirAgenda(destino) {
  const ventanas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const agenda = ventanas.find((ventana) => ventana.url === destino.href) ??
    ventanas.find((ventana) => new URL(ventana.url).pathname === destino.pathname);
  if (agenda) {
    try {
      const ventana = await agenda.navigate(destino.href);
      if (ventana) return ventana.focus();
    } catch {
      // La ventana puede haberse cerrado después de consultar las ventanas abiertas.
    }
  }
  return self.clients.openWindow(destino.href);
}
