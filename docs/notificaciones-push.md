# Notificaciones de turnos en el celular

Los clientes pueden activar las notificaciones en **Mis turnos** para recibir confirmaciones, cambios, cancelaciones manuales y recordatorios. Cada barbero puede activarlas en **Turnos** del panel para recibir un aviso cuando se crea una reserva en su agenda o se le asigna un turno existente, incluso si el pago todavía está pendiente. El aviso abre la vista correspondiente y la pantalla bloqueada muestra un texto general.

## Activación en un dispositivo

- En un navegador con Web Push, abrí **Mis turnos** o **Turnos** del panel, tocá **Activar avisos** y aceptá el permiso.
- En iPhone o iPad con iOS/iPadOS 16.4 o posterior, agregá el sitio a la pantalla de inicio y abrí la app desde su ícono antes de activar las notificaciones. [Compatibilidad de Web Push en WebKit](https://webkit.org/blog/13878/)
- La activación corresponde al dispositivo y a la cuenta que la realizó. Sigue activa al cerrar sesión. Para dejar de recibir avisos, usá **Desactivar avisos** con la misma cuenta en ese dispositivo. Si otra cuenta activa los avisos en el mismo navegador, el dispositivo pasa a recibir los de esa cuenta.

## Configuración del despliegue

1. Generá un par de claves para el entorno con `npx --no-install web-push generate-vapid-keys`. Guardalo como credencial del despliegue.
2. Configurá `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT` en el servidor. El asunto debe ser un contacto válido con formato `mailto:`. Conservá el mismo par de claves para que las suscripciones sigan funcionando entre despliegues.
3. Aplicá la migración `20261124120000_agregar_notificaciones_push` en la base del entorno correspondiente. El script de build del proyecto incluye `prisma migrate deploy`.
4. Serví la app por HTTPS. Para los recordatorios, configurá `CRON_SECRET` y habilitá el cron de `vercel.json`. Se ejecuta diariamente a partir de las 09:00 de Buenos Aires (12:00 UTC) para los turnos confirmados del día siguiente. Si se usa otro proveedor de hosting, programá una llamada `GET` a `/api/cron/recordar-turnos` con `Authorization: Bearer <CRON_SECRET>` en el mismo horario.

Si falta la configuración VAPID, el control se oculta y las reservas siguen disponibles. Después de rotar las claves, cada dispositivo debe volver a activar las notificaciones. [Biblioteca Web Push](https://github.com/web-push-libs/web-push)
