# AGENTS.md

## Reglas de escritura

- **Idioma**: todo en español (variables, funciones, exports, archivos, tipos, comentarios, keys). Solo inglés para palabras reservadas del lenguaje/framework, HTML estándar, shadcn/ui (`ui/*.tsx`, `cn()`), hooks React (`useX`), nombres de librerías y claves schema.org/JSON-LD. (Ver `CLAUDE.md`.)
- **TypeScript**: evitar `any` y `@ts-ignore` (el código existente usa casts `as any` en algunas partes para campos opcionales de MP). Nota: `CLAUDE.md` dice `strict: false`, pero `tsconfig.json` tiene `strict: true` — seguir el tsconfig.

## Comandos

- `npm run dev` — servidor de desarrollo con Turbopack.
- `npm run build` — corre `prisma generate` → `prisma db push --accept-data-loss` (o continua sin DB) → `next build`.
- `npm run lint` — `next lint`.
- No hay tests configurados en el repo.
- Seed: `npx prisma db seed` (usa `tsx prisma/seed.ts`).

## Gotchas de build y verificación

- `next.config.ts` tiene `eslint.ignoreDuringBuilds: true` y `typescript.ignoreBuildErrors: true`: **el build no valida nada**. Verificar a mano con `npx tsc --noEmit` y `npm run lint`.
- `npx tsc --noEmit` y `npm run dev` fallan si no existe el cliente de Prisma generado (ver abajo).

## Prisma (importante)

- El cliente se genera en **`/generated/prisma`** (raíz del repo), NO en `src/generated` como afirma el README (desactualizado). Se importa en `src/lib/prisma.ts` como `../../generated/prisma/client`.
- El cliente NO está versionado: tras un `git clean`/clone hay que correr `npx prisma generate` antes de dev/typecheck.
- Usa driver adapter MariaDB (`@prisma/adapter-mariadb`): necesita `DATABASE_USER/PASSWORD/NAME/HOST/PORT` en el `.env` (no basta `DATABASE_URL`). `DATABASE_HOST` debe ser `127.0.0.1`, nunca `localhost` (Windows/Node).
- El SSL se activa automáticamente si el host no es localhost.
- Cambios de schema: `npx prisma migrate dev --name <nombre>` (en build se hace `db push` con pérdida de datos permitida).

## Arquitectura

- Next.js 15 App Router + Auth.js v5 (`src/auth.ts`, `src/middleware.ts` protegen rutas). React 19, Tailwind 4, Zod.
- **Capa de negocio = server actions** en `src/actions/*.ts` (`"use server"`). Utilidades en `src/lib/*` (prisma, mercadopago, email con nodemailer, cache, cloudinary).
- **Timezone del negocio**: `America/Argentina/Buenos_Aires` (date-fns-tz `toZonedTime`/`fromZonedTime`) en `src/actions/turno.actions.ts`.
- **Caché**: `getCachedData` (`src/lib/cache.ts`) con tags tipo `turnos-{barberoId}-{fecha}`, `turnos-global`, `turnos-user-{userId}`, `turnos-mes-{barberoId}-{mes}`. Invalidar con `revalidateTag`/`revalidatePath` tras crear/editar/cancelar turnos.
- **Locks de slots**: modelo `SlotLock` + hook `useSlotLocks` + `POST /api/slot-locks`. Un turno se rechaza si hay lock ajeno activo (`expiresAt > now`).
- **Cron**: `/api/cron/expirar-turnos` (definido en `vercel.json`, diario) cancela turnos `PENDIENTE` con seña > 0 creados hace más de 5 min. Protegido por header `x-vercel-cron` en producción.
- `src/app/test-mp` es una página de prueba de Mercado Pago (no borrar sin avisar).

## Flujo de pago (seña) y WhatsApp

1. `crearPreferenciaPago(turnoId)` (`src/actions/mercadopago-actions.ts`) crea la preferencia con `external_reference = turnoId`, `notification_url = /api/mercadopago/webhook`, back_urls `/pago/success|failure|pending` y expiración de 5 min.
2. El webhook `POST /api/mercadopago/webhook` consulta el pago a la API y marca el turno: `approved` → `CONFIRMADO`, `rejected/cancelled` → `PENDIENTE`, `refunded/charged_back` → `CANCELADO`. Siempre responde 200.
3. `confirmarPagoTurno` es el respaldo desde el back_url `/pago/success` (y `/pago/status`); se llama aunque el turno ya esté confirmado por el webhook.
4. **WhatsApp**: no hay API de WhatsApp; se usa enlace `https://wa.me/<numero>?text=...` desde el cliente. El número es el del negocio en `PageConfig.whatsapp` (los `barbero` no tienen teléfono). Tras confirmar el pago, `/pago/success` redirige al cliente al WhatsApp del negocio con día, horario y servicio (componente `RedireccionWhatsApp`). El webhook solo no puede redirigir (no hay navegador): el mensaje se dispara cuando el usuario vuelve al back_url.
- Los turnos se crean `PENDIENTE`; sin seña (`seniaCongelada = 0`) no pasan por MP.
