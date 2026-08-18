# Guía de Configuración de Variables de Entorno

Esta carpeta contiene los pasos a paso para obtener y configurar cada variable de entorno de la aplicación.

## Cómo empezar

1. Copiá el archivo `.env.example` (en la raíz del proyecto) a `.env`:

   ```bash
   # Linux / Mac
   cp .env.example .env

   # Windows
   copy .env.example .env
   ```

2. Completá cada valor siguiendo la guía correspondiente de la tabla de abajo.
3. Reiniciá el servidor de desarrollo (`npm run dev`) después de cada cambio.

> ⚠️ **Nunca** subas el archivo `.env` real al repositorio (está excluido en `.gitignore`). El archivo `.env.example` es el único que debe versionarse.

## Índice de guías

| Guía | Variables que explica | Link |
| --- | --- | --- |
| Base de datos (XAMPP local / TiDB Cloud) | `DATABASE_URL`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `CA` | [1-base-de-datos.md](./1-base-de-datos.md) |
| Google OAuth (login con Google) | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | [2-google-oauth.md](./2-google-oauth.md) |
| Secretos y URL de la app | `AUTH_SECRET`, `CRON_SECRET`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_APP_URL`, `VERCEL_URL`, `IS_PRODUCTION` | [3-secretos-y-url.md](./3-secretos-y-url.md) |
| Mercado Pago (pagos y conexión) | `MP_CLIENT_ID`, `MP_CLIENT_SECRET`, `MP_AUTH_BASE_URL`, `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY` | [4-mercadopago.md](./4-mercadopago.md) |
| Cloudinary (imágenes) | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | [5-cloudinary.md](./5-cloudinary.md) |
| Resend (emails de turnos) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | [6-resend.md](./6-resend.md) |

## Referencia rápida de variables

| Variable | Obligatoria | Para qué sirve |
| --- | --- | --- |
| `DATABASE_URL` | Sí | URL que usa el CLI de Prisma (`npx prisma db push`, `generate`) |
| `DATABASE_HOST` / `DATABASE_PORT` / `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` | Sí | Conexión en runtime (adaptador nativo MariaDB) |
| `CA` | Solo TiDB Cloud | Ruta al certificado CA de la base de datos cloud |
| `AUTH_SECRET` | Sí | Firma las sesiones JWT de Auth.js |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Sí (si usás login con Google) | Credenciales OAuth de Google |
| `AUTH_TRUST_HOST` | Sí (desarrollo) | Permite que Auth.js confíe en el host local |
| `MP_CLIENT_ID` / `MP_CLIENT_SECRET` | Sí (para cobrar online) | App de Mercado Pago para el flujo OAuth |
| `MP_AUTH_BASE_URL` | No | URL de autorización OAuth por país (default Argentina) |
| `MP_ACCESS_TOKEN` / `MP_PUBLIC_KEY` | No (legacy) | Los tokens reales se guardan en la BD tras conectar |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Sí (si usás imágenes) | Almacenamiento de imágenes en Cloudinary |
| `NEXT_PUBLIC_APP_URL` | Sí | URL base de la app (redirect URIs y back_urls) |
| `VERCEL_URL` | No | Inyectada por Vercel; fallback de la URL base |
| `CRON_SECRET` | No | Respaldo para proteger el cron de expiración de turnos |
| `RESEND_API_KEY` | No (emails opcionales) | Envío de emails de turnos |
| `RESEND_FROM_EMAIL` | No | Remitente de los emails |
