# AGENTS.md

Guía de contexto y convenciones para trabajar en este repositorio. Complementa y respeta lo establecido en `CLAUDE.md` (fuente normativa).

## Proyecto

App de reserva de turnos para barbería: Next.js 15 (App Router), TypeScript, Tailwind v4, Prisma 7 + MariaDB, Auth.js v5 (beta), Mercado Pago Checkout Pro.

## Comandos

- `npm run dev` — `next dev --turbopack`
- `npm run build` — `prisma generate && (prisma db push --accept-data-loss || echo ...) && next build`
- `npm run lint` — `next lint`
- `npx tsc --noEmit` — verificación de tipos (el build la omite, correrla siempre antes de terminar)
- Sin test framework: la validación se hace con build + typecheck manual.

## Sistema de color (parametrizado desde PageConfig)

Los colores de marca se centralizan en CSS variables globales. NO hardcodear hex de acento en componentes.

- Origen: `PageConfig.primaryColor` / `.secondaryColor` (tabla `page_config`).
- Inyección: `layout.tsx` setea `--page-primary` / `--page-secondary` en `<style>` del `<html>` (con `as React.CSSProperties`).
- Defaults (fuente única): `:root` en `src/app/globals.css` — `#d97706` / `#78350f`.
- Variantes alfa derivadas con `color-mix()`: `--page-primary-08/15/18/20/25/30/40/44/50/60/70/80` y equivalentes `--page-secondary-*`. Se usan en lugar de sufijos hex antiguos como `#d97706cc`.

Cómo usarlo (NO prop drilling):
- Inline: `style={{ color: "var(--page-primary)", backgroundColor: "var(--page-primary-30)" }}`.
- Tailwind: `bg-[var(--page-primary)] hover:bg-[var(--page-primary-80)]`, `text-[var(--page-primary)]`, `border-[var(--page-primary)]/30`, `via-[var(--page-primary)]`.
- Si un componente tenía `"--primary": "var(--page-primary)"` en un wrapper (alias a las globales), mantener ese alias local para `var(--primary)`.

FIJOS (no parametrizables, pertenecen al diseño/base de color):
- Neutros (zinc / black / white), azules (blue), rojo semántico de error (`#ef4444`).
- Paleta dorada oscura de modales/paneles: `#E8B031`, `#E4E0D9`, `#2C261D`, `#8E8675`, `#1C1812`, `#14110C`, `#251f15`.
- Acentos oscuros tipo `amber-900/xx`, `amber-100/xx`, `amber-200/xx`, `amber-950/xx` (usados como bordes besurros / text gold).
- Avisos semánticos de `test-mp` (warning amarillo).

Lo que ya NO debe existir: props `primaryColor`/`secondaryColor` entre componentes, lecturas de `pageConfig` para colores fuera de `layout.tsx`, import hex de acento durocodeado, strings como `${primaryColor}XX`, clases `amber-300/400/500/600` como acento.

## Arquitectura

- `actions/` → Server Actions: validación + autorización + service + revalidate + respuesta (máx. 100 líneas).
- `services/` o `lib/` → consultas Prisma reutilizables (máx. 80 líneas). Sin validación ni auth.
- `components/` → client components con responsabilidad única (máx. 200 líneas).
- `hooks/` → lógica reutilizable (máx. 150 líneas).
- `types/` ✓ `constants/` ✓. No crear carpetas nuevas si ya existe una apropiada.

## Gotchas del repo

- **Next.js reporta versiones distintas**: package.json dice `next 15.2.8` (real), README está desactualizado (menciona Next 16). No guiarse por el README.
- `next.config.ts`: `eslint.ignoreDuringBuilds` y `typescript.ignoreBuildErrors` en `true`. Por eso `npx tsc --noEmit` manual es OBLIGATORIO. Hay errores de types preexistentes en `actions/admin.actions.ts`, `actions/calendario.actions.ts`, `prisma/seed.ts`, `EditServicioModal.tsx` (useActionState) que no deben tocarse a menos que se pida.
- Prisma cliente generado en `generated/prisma` (raíz); singleton en `src/lib/prisma.ts` con `@prisma/adapter-mariadb`.
- MySQL/MariaDB: usar `127.0.0.1` como host, no `localhost` (evita activar SSL).
- Cron Vercel: `/api/cron/expirar-turnos`, requiere header `CRON_SECRET`.
- No hay tests. Evitar instalar dependencias nuevas sin justificación (revisar primero si ya existe solución en el repo / React / Next).
- `any`, `@ts-ignore`, `@ts-nocheck` PROHIBIDOS por CLAUDE.md; preferir `unknown`, tipos de Prisma/Zod, type guards.