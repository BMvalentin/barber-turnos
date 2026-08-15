# Configurar Resend para el envío de emails

Guía para configurar [Resend](https://resend.com/) en la app de reserva de turnos. Resend es el proveedor de email que utiliza la aplicación para enviar las notificaciones de turnos (confirmación, modificación y cancelación) a los clientes y al barbero asignado al turno.

## 1. Crear cuenta

- Ingresá al sitio oficial: [https://resend.com/](https://resend.com/).
- Registrate con tu email o directamente con tu cuenta de **GitHub**.
- Empezá con el **plan gratuito** (suficiente para pruebas y puesta en marcha, aprox. 100 emails por día). Podés escalar el plan más adelante si el volumen lo requiere.

## 2. Obtener la API Key

- Ingresá a la sección de keys: [https://resend.com/api-keys](https://resend.com/api-keys).
- Clic en **"Create API Key"**.
- Ponéle un nombre identificable, por ejemplo `barber-turnos`.
- Elegí el permiso **Full access**.
- Hacé clic para crearla y **copiá la key inmediatamente**: solo se muestra una vez y empieza con `re_`.
- Guardala en la variable `RESEND_API_KEY` del `.env`.

## 3. Dominio de envío (remitente)

- Para **producción** se recomienda usar un dominio propio: [https://resend.com/domains](https://resend.com/domains) → **"Add Domain"**.
- Seguí los pasos para verificar el dominio agregando los **registros DNS** (SPF, DKIM, DMARC) en el proveedor donde está gestionado el dominio.
- Una vez verificados los registros, marcá la casilla que habilita el envío desde ese dominio.

La variable `RESEND_FROM_EMAIL` define el remitente:

- En **desarrollo o puesta a mano** se puede usar `onboarding@resend.dev` (es el valor por defecto que ya maneja el código, por lo que no hace falta configurar nada).
- Con un **dominio verificado**, usá algo como `turnos@TU_DOMINIO.com`.
- El remitente se muestra como `NombreDeLaBarbería <from>`: el nombre que aparece sale de la configuración de la aplicación (config de la barbería), no del email.

## 4. .env final

```env
RESEND_API_KEY="re_TU_RESEND_API_KEY"
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

## 5. Cómo probar

- Levantá la aplicación con `npm run dev`.
- Creá un turno (o confirmalo) y revisá que llegue el email al cliente y al barbero asignado (requiere que el barbero tenga email cargado en el admin).
- Si **no llega nada**, verificá lo siguiente:
  - Que `RESEND_API_KEY` esté correcta y completa en el `.env` (recordá reiniciar el servidor tras modificar variables de entorno).
  - Que el remitente (`from`) use un dominio verificado: en la fase inicial, `onboarding@resend.dev` solo envía a cuentas verificadas del usuario de Resend. Para probar con otros destinatarios, configurá y verificá tu propio dominio.
- Documentación oficial con errores comunes: [https://resend.com/docs/dashboard/emails/introduction](https://resend.com/docs/dashboard/emails/introduction).

> Nota: si `RESEND_API_KEY` no está configurada, el turno se guarda igual en la base de datos; el email falla silenciosamente sin interrumpir el flujo.
