# PENDIENTES.md — Plan directivo (SOLO LECTURA): auditoría y remediación integral de la app

> **Documento directivo de SOLO LECTURA.** Todos los subagentes deben leerlo antes de trabajar.
> No editar este archivo durante la ejecución. El presente plan no se modifica una vez iniciado.
> Los números de línea citados fueron **verificados contra el repo el 10-ago-2026** y pueden
> desplazarse durante la ejecución: **verificar la línea exacta antes de editar** (ver §3.11).

---

## 1. Objetivo

Ejecutar un ciclo completo de **auditoría y remediación** sobre la app de reserva de turnos de
barbería, surgido de una auditoría externa con **5 auditores** (seguridad, performance, calidad,
TypeScript, arquitectura). El plan tiene **9 fases numeradas (0 a 8)** que cubren: seguridad
crítica, SSR/performance, correctitud TypeScript, dead code, organización por dominios, desglose
boy-scout, locks de slots, endurecimiento general y eliminación de `any`.

**Meta global:** dejar la app con **0 errores de `npx tsc --noEmit`**, `npm run build` exitoso al
cierre de las Fases 2, 5 y 8, sin fugas de seguridad críticas (hash bcrypt, OAuth de Mercado Pago,
webhook/cron, PII, slot-locks/WS), sin archivos fuera de los límites de AGENTS.md, sin `any`, y con
toda la estructura organizada por dominios.

**Estructura obligatoria de cada fase:** cada fase (0 a 8) termina con un subagente **VERIFICADOR**
(V0…V8) que revisa TODO el código producido en la fase, repara las violaciones que encuentre y
**certifica** la fase. Sin su aprobación la fase NO se da por terminada (AGENTS.md §Uso de
subagentes, punto 4).

---

## 2. Antecedentes y estado actual

### Stack del proyecto
- Next.js **15.5** App Router (el README está desactualizado; no guiarse por él), TypeScript strict,
  Tailwind v4, **Prisma 7 + MariaDB**, Auth.js v5 (beta), **Mercado Pago Checkout Pro**, Cloudinary
  (`src/lib/cloudinary-uploader.ts`), **Zod 4**, nodemailer (`src/lib/email.ts`).
- Prisma generado en `generated/prisma` (raíz); singleton `src/lib/prisma.ts` con
  `@prisma/adapter-mariadb`. MariaDB: host `127.0.0.1` (no `localhost`).
- Sin framework de tests: la validación es build + typecheck manual.

### Resultados de la auditoría (estado actual conocido)
- **Baseline `npx tsc --noEmit` = 13 errores**, TODOS **YA AUTORIZADOS para corregir** por el usuario
  (los cubre la Fase 2):
  - 3 en `.next/types/app/pago/{success,pending,failure}/page.ts` (searchParams síncronos).
  - 1 en `prisma/seed.ts:21` (typo **"Mieracoles"**; verificado: está en línea 21, no 31).
  - 9 en `src/components/servicio/EditServicioModal.tsx` (useActionState / state.errors).
- **82 usos de `any`** en `src/` (la Fase 8 los elimina).
- **11 archivos > 400 líneas** (verificados): `turno.actions.ts` (726), `ServicioList.tsx` (756),
  `test-mp/MPTestClient.tsx` (675), `CreateTurnoModal.tsx` (532), `SeleccionadorHorario.tsx` (460),
  `GeneralConfigForm.tsx` (433), `CreateServicioForm.tsx` (411), `barbero.actions.ts` (410),
  `CreateBarberoForm.tsx` (405), `EditBarberoModal.tsx` (404), `servicio-actions.ts` (404).
- `next.config.ts`: `typescript.ignoreBuildErrors: true` y `eslint.ignoreDuringBuilds: true` →
  **el build NO typechequea**. `npx tsc --noEmit` manual es OBLIGATORIO en cada gate.
- `npm run build` ejecuta `prisma generate && (prisma db push --accept-data-loss || echo ...) && next build`.
- Archivos sueltos en raíz: **12** en `src/actions/` y **14** en `src/components/` (ver Fase 4).
- Decisiones previas registradas en `AUDITORIA.md`: §3.2 (modal legacy de lavadero) y preservación
  de `/test-mp`. Revertir esas decisiones requiere confirmación explícita del coordinador (ver §6).

---

## 3. Reglas transversales (obligatorias para TODOS los subagentes)

1. **TS estricto puro**: `any`, `@ts-ignore`, `@ts-nocheck` PROHIBIDOS; preferir `unknown`, type
   guards, tipos de Prisma y `z.infer` (los schemas Zod existen en `src/lib/zod.ts`,
   `src/lib/servicios-zod.ts`, `src/lib/barbero-zod.ts`, `src/lib/excepcion-zod.ts`).
2. **Nomenclatura en español**: código, comentarios, mensajes de UI y nombres de archivos/carpetas
   nuevos en español. EXCLUIDOS: APIs de librerías/sistema y convenciones universales del stack
   (`id`, `className`, props de shadcn/radix, hooks `useXxx`, modelos requeridos por el adaptador
   de next-auth: `user`, `account`, `user_role`, etc.).
3. **Reglas de construcción de AGENTS.md**: máximo UNA función exportada por archivo (excluidos
   constantes/tipos); tamaño máximo 400 líneas (objetivo 300). Límites por capa: **acciones 100**,
   **services/lib 80**, **componentes 200**, **hooks 150**. Regla del boy scout: si un archivo
   tocado queda fuera de límites, se desglosa en la MISMA tanda de cambios.
4. **Imports con alias `@/`**: para cruzar dominios SIEMPRE `@/`; relativos solo dentro de una
   misma carpeta si es estrictamente necesario. En cualquier MOVIMIENTO de archivos (Fase 4),
   actualizar TODOS los imports en la misma tanda de cambios.
5. **Organización por carpetas**: todo archivo de código vive en una carpeta de dominio; prohibido
   dejar archivos sueltos en raíz de `src/`, `src/actions/` o `src/components/` (Fase 4 lo
   corrige; no crear carpetas nuevas si ya existe una apropiada).
6. **Gates obligatorios**:
   - `npx tsc --noEmit` en CADA subfase (el build NO typechequea) — sin errores nuevos respecto
     del punto de partida de la subfase (la Fase 2 lleva el total a 0 y ahí el gate es 0 errores).
   - `npm run build` al cierre de **Fase 2, Fase 5 y Fase 8**.
7. **Cada fase cierra con su VERIFICADOR (V0…V8)**: revisa TODO el código de la fase (no solo sus
   archivos), busca violaciones de estas reglas, las repara él mismo y certifica. Es el último paso
   de la fase; es requisito para cerrarla.
8. Cada subagente edita SOLO los archivos de su subfase (tablas §4). Ante un conflicto avisar al
   coordinador/verificador de la fase, NUNCA editar archivo ajeno.
9. **No instalar dependencias nuevas** sin justificación (primero revisar si ya existe solución en
   el repo / React / Next). No crear tests (no hay framework).
10. **Seguridad en código**: no exponer secretos ni datos sensibles (hash, tokens, PII) al cliente;
    errores internos devueltos al cliente como mensajes genéricos; los detalles se loguean en el
    servidor con `console.error` sanitizado.
11. **Referencias `archivo:línea`**: son aproximadas (verificadas el 10-ago-2026). Antes de cada
    edición, localizar la línea real (los números se desplazan entre tandas).

---

## 4. Organización por fases, subfases y subagentes

Dependencias: `FASE 0 → FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5 → FASE 6 → FASE 7 → FASE 8`.
Dentro de una misma fase, las subfases cuyos archivos NO se solapan pueden correr **EN PARALELO**.
Dentro de una subfase con varios subagentes, repartirse archivos disjuntos (nunca dos subagentes
sobre el mismo archivo en paralelo). Cada fase se cierra con su verificador (V0…V8), que corre
DESPUÉS de que todas sus subfases entregaron.

---

### FASE 0 — Seguridad crítica

> Coordinador: agente principal. Cierra con **V0**.

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 0.1 Hash bcrypt expuesto | `src/actions/turno.actions.ts` — `createTurno` (~166-401; `include: { user: true, … }` en ~276; bloque email ~289-303) y `actualizarTurno` (~491-620; includes en ~563 y ~601) · `src/actions/user-dashboard.ts` `getUserTurnos` (~76-96; `user: true` en 82 y `include` en 125) — devuelven `...turno` completo; el modelo `user` tiene `password String?` en `prisma/schema.prisma:97` | Reemplazar `include: { user: true }` por `user: { select: { id: true, name: true, email: true, telefono: true } }` (patrón YA usado en `turno.actions.ts:355`) | 0.1 |
| 0.2 OAuth MP sin auth | `src/app/api/mercadopago/oauth/start/route.ts` (GET público, ~L33; sin chequeo de sesión) · `src/app/api/mercadopago/oauth/callback/route.ts` (~L4; 43 líneas en total) — cualquiera conecta SU cuenta de MP y desvía las señas; los tokens se guardan en `configuracion_mercadopago` vía `src/lib/mercadopago.ts:192-218` y se usan para cobrar en `obtenerClienteMP()` (~300-314) | `requerirAdmin()` de `src/lib/seguridad.ts` en start y callback; idealmente firmar `state` con el `userId` | 0.2 |
| 0.3 Webhook fail-open + cron débil | `src/app/api/mercadopago/webhook/route.ts:17-24` (`firmaValida`: si `MP_WEBHOOK_SECRET` no está definido devuelve `true`, fail-open, solo `console.warn`) · `src/app/api/cron/expirar-turnos/route.ts:11-23` (compara `x-cron-secret === process.env.CRON_SECRET` con `===` en L15, no `crypto.timingSafeEqual`) y ~L89 devuelve `detalle: error.message` | En producción: fallar CERRADO si falta el secreto + validar skew del timestamp `ts`; `crypto.timingSafeEqual` para el secreto; NO devolver `detalle` interno. Documentar que `MP_WEBHOOK_SECRET` y `CRON_SECRET` deben setearse como env vars en Vercel | 0.3 |
| 0.4 PII en endpoint público | `src/app/api/configuracion-turno/route.ts:31-38` — `prisma.user.findMany({ select: { id, name, email } })` en GET sin auth y retorna los usuarios (~L62) | Quitar los usuarios del endpoint o mover a server action protegida con `requerirAdmin()` | 0.4 |
| 0.5 Slot-locks y WS sin auth | `src/app/api/slot-locks/route.ts:68-142` (POST/DELETE/PATCH aceptan `sessionId`/`userId` arbitrarios del body; el GET ~27-49 además ejecuta `deleteMany` de limpieza + `findMany`) · `src/app/api/ws/route.ts:18-96` (INIT ~40-49 devuelve `sessionId`/`userId` de locks de TERCEROS; UNLOCK ~80 borra por `sessionId` arbitrario; no hay broadcast) — el cliente genera `sessionId` con `crypto.randomUUID()` en `src/components/turno/CreateTurnoModal.tsx:102` y `src/components/turno/EditarTurnoModal.tsx:76` | `auth()` obligatoria en ambas rutas; `sessionId` derivado EN EL SERVIDOR ligado a la sesión; nunca devolver `sessionId`/`userId` ajenos; rate-limit | 0.5 |

**Qué necesita cada subagente 0.1-0.5 (plantilla común):**
- Leer este documento (§3 y §4), AGENTS.md, y los archivos de su fila (verificar líneas reales antes
  de editar).
- Aplicar SOLO el fix de su fila; respetar los límites de líneas del archivo resultante (§3.3).
- Si el archivo usa wrappers con alias `--primary`, respetar el sistema de color (§AGENTS.md).
- Correr `npx tsc --noEmit` y confirmar 0 errores NUEVOS.
- Entregable: diff, línea de estado, evidencia de grep (vector cerrado) y de tsc.

**Qué necesita el verificador V0 (se ejecuta DESPUÉS de 0.1-0.5):**
- Intenta explotar cada vector: grep de `include: { user: true }` en `src/`, llamadas a las rutas
  oauth (`oauth/start`, `oauth/callback`) sin auth, llamadas a `slot-locks`/`ws` sin sesión; revisa
  los 5 archivos de la fase completos.
- Repara lo que falle y certifica por archivo.
- Gate: `npx tsc --noEmit` sin errores nuevos. ACTA de fase.

---

### FASE 1 — SSR y performance críticos

> Cierra con **V1**.

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 1.1 AppGate client-rendered | `src/components/AppGate.tsx` (client; devuelve `null` si `!initialized`, ~L87) envuelve `{children}` en el layout raíz (`src/app/layout.tsx:94-101`) — TODA la app se sirve sin HTML (client-rendered, LCP dominado por JS, SEO sin texto) | Renderizar SIEMPRE el contenido y superponer los modales de cookies/términos/privacidad (`CookieModal`, `PrivacyModal`, `TermsModal`) como overlay | 1.1 |
| 1.2 Layout raíz dinámico | `src/app/layout.tsx:65-66` — `await auth()` + `getCachedPageConfig()` (que ejecuta Prisma, `src/actions/configPage.ts:96-107`) en el layout raíz → toda la app es dinámica | Mover `auth()` a los layouts de rutas protegidas (`/admin`, `/turno`, `/dashboard`); cachear `getPageConfig` con `unstable_cache` + tag `page-config` y revalidar el tag en `updatePageConfig` (`configPage.ts:86-87` ya hace `revalidatePath("/", "layout")`) | 1.2 |
| 1.3 Consultas sin caché | `getServiciosCarrusel` (`src/actions/servicio-actions.ts:91-108`; consulta Prisma en cada request, L93) y las ~8 consultas del dashboard `src/app/admin/page.tsx:41-110` | Cachear con `getCachedData` de `src/lib/cache.ts` (revalidate corto 30-60s) | 1.3 |
| 1.4 Modal legacy de lavadero | `src/components/BookingModal.tsx` (mock de reserva de vehículos auto/camioneta/moto ~L13-52, sin BD; 275 líneas), `src/app/context/Booking.tsx` (33 líneas) y el `BookingProvider` de `src/components/LayoutComponent.tsx` (~L17) | Eliminar los tres. **NOTA: revierte una decisión previa del usuario (AUDITORIA.md §3.2)** — el coordinador debe confirmar la baja con el usuario ANTES de borrar archivos | 1.4 |
| 1.5 Imágenes, middleware y fuentes | Ningún `Image` usa `priority` (grep = 0) · Hero (`src/components/Hero.tsx:9`, fondo Unsplash 2070px, y sección ~34-41) sin preload · `next.config.ts:18-30` con `images.unoptimized: true` y `remotePatterns: '**'` (http y https) · `src/middleware.ts` (60 líneas) SIN `matcher` (valida JWT en TODAS las rutas) · `src/app/globals.css:1` con `@import url(googleapis…)` render-blocking (Outfit + Playfair) · `src/app/layout.tsx:12-20` carga Geist con `next/font` que NADIE usa | `priority`+`preload` en el hero; decidir si activar el optimizer de `next/image` o apuntar a URLs de Cloudinary con `f_auto,q_auto`; agregar `matcher` restringido al middleware; unificar fuentes en `next/font/google` y borrar el `@import` (verificar qué usa cada componente antes) | 1.5 |

**Qué necesita cada subagente 1.1-1.5 (plantilla común):**
- Leer este documento (§3 y §4), AGENTS.md, y los archivos de su fila (verificar líneas reales).
- Aplicar SOLO el fix de su fila; no tocar el sistema de color ni la paleta FIJA.
- Correr `npx tsc --noEmit`: 0 errores nuevos. Evidencia de performance cuando corresponda
  (preload/priority presentes, matcher activo).
- Entregable: diff + línea de estado + evidencia de grep/tsc.

**Qué necesita el verificador V1:**
- Revisa los 5 archivos y el layout resultante: contenido siempre en HTML inicial (curl del HTML),
  rutas protegidas con su propio auth, caché de config activa con tag, imágenes con priority solo
  donde corresponde, matcher presente, sin `@import` render-blocking.
- Repara lo que falle y certifica. Gate: `npx tsc --noEmit` sin errores nuevos. ACTA de fase.

---

### FASE 2 — Correctitud TypeScript (objetivo: 0 errores tsc)

> Cierra con **V2** + `npm run build`. La Fase 2 absorbe el baseline de 13 errores (autorizado, §2).

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 2.1 searchParams síncronos | `src/app/pago/success/page.tsx`, `src/app/pago/pending/page.tsx`, `src/app/pago/failure/page.tsx` — tipan `searchParams` como objeto síncrono; Next 15.5 exige `searchParams: Promise<...>` + `await searchParams` (3 errores TS2344 en `.next/types`) | Copiar el patrón que YA funciona en `src/app/pago/status/page.tsx:8-15` (interfaz con `Promise<…>`) y su `await searchParams` en L21 | 2.1 |
| 2.2 EditServicioModal useActionState | `src/components/servicio/EditServicioModal.tsx` (9-10 errores): `useState(initialState)` sin anotar (~L45) en vez de `useActionState(actualizarServicio, initialState)` — su gemelo `CreateServicioForm.tsx:11,35` ya usa `useState<ActionState>`; causas TS2345 y TS2551 (`state.errors` no existe) | Migrar a `useActionState` con `ActionState` tipado. Además es un BUG de UI: los errores de validación por campo nunca se muestran — dejarlos visibles | 2.2 |
| 2.3 Typo en seed | `prisma/seed.ts:21` — "Mieracoles" (verificado: línea 21; enum `dias_laborales` en `prisma/schema.prisma:250`) | "Mieracoles" → "Miercoles". Es bug de runtime si se ejecuta el seed y de coherencia con el enum | 2.3 |
| 2.4 Regresión | Todo el proyecto | `npx tsc --noEmit` = **0 errores** | V2 |

**Qué necesita cada subagente 2.1-2.3:**
- Leer este documento (§3), AGENTS.md, el archivo propio y el patrón de referencia indicado.
- Corregir SOLO su error; no tocar otros errores.
- Entregable: diff + `npx tsc --noEmit` mostrando la reducción del countdown.

**Qué necesita el verificador V2:**
- Corre `npx tsc --noEmit` → **0 errores** (objetivo de la fase). Repara remanentes.
- Corre `npm run build` → exitoso.
- ACTA de fase + certificación del objetivo 0 errores.

---

### FASE 3 — Dead code y limpieza

> Cierra con **V3**.

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 3.1 Modelo huérfano | Modelo `Configuracion` en `prisma/schema.prisma:60-67` (tabla `configuraciones` con `mpAccessToken`/`mpPublicKey`) — 0 usos en `src/` (verificarlo con grep) | Borrarlo + `prisma db push` (o documentar si no hay schema de migraciones; hay migraciones en `prisma/migrations/`, decidir con el coordinador) | 3.1 |
| 3.2 Guardas obsoletas | 5 guardas "campo aún no migrado": `src/actions/mercadopago-actions.ts:113-120, 229, 291-292` y `src/app/api/mercadopago/webhook/route.ts:131, 145-149` — `mpPaymentId`/`mpPreferenceId` YA existen en `prisma/schema.prisma:80-81` | Quitar las guardas y los casts `as any` asociados | 3.2 |
| 3.3 `/test-mp` | `src/app/test-mp/page.tsx` (42 líneas) y `src/app/test-mp/MPTestClient.tsx` (675 líneas) — preservado por decisión previa | Propuesta: proteger con `requerirAdmin()` además del auto-disable actual en `NODE_ENV === "production"`; el desglose de archivo va en Fase 5. **Requiere confirmación del coordinador** (revierte/aumenta decisión previa) | 3.3 |
| 3.4 Logs de debug | `src/actions/auth-actions.ts:52-91` (8 `console.log` numerados con emojis e emails), `src/app/api/mercadopago/webhook/route.ts:60` (loguea el body completo), `src/lib/mercadopago.ts:126, 182-190` (loguea prefijos de tokens) | Reemplazar por nada o por `console.error` del error real SANITIZADO (sin emails, bodies ni tokens) | 3.4 |
| 3.5 Dead code | `getServicioById` (`src/actions/servicio-actions.ts:368`, export sin importadores — verificar con grep), `getBarberoById` (`src/actions/barbero.actions.ts:192`), assets carwash en `src/assets/` (`hero-carwash.jpg`, `carwash-detail-1/2/3.jpg`), `src/hooks/use-toast.ts` (151 líneas) vs `src/components/ui/use-toast.ts` (3 líneas, re-export duplicado — elegir UNA y borrar la otra), `package.json:2` name `"lavadero-web"` → `"barber-turnos"` | Eliminar lo muerto; unificar toast; renombrar package | 3.5 |

**Qué necesita cada subagente 3.1-3.5:**
- Confirmar con grep cada claim de "0 usos / sin importadores" ANTES de borrar (el boy scout de la
  Fase 4 y el verificador rechequean).
- Entregable: diff + grep de evidencia + `npx tsc --noEmit` sin errores nuevos.

**Qué necesita el verificador V3:**
- Re-barre `src/` para confirmar que los símbolos borrados no tienen importadores (grep), que no
  quedan logs con emails/bodies/tokens, y que `Configuracion` no tiene usos.
- Repara lo que falle y certifica. Gate: `npx tsc --noEmit` sin errores nuevos. ACTA de fase.

---

### FASE 4 — Organización por dominios (mover + actualizar imports en la MISMA tanda)

> Cierra con **V4**. Regla crítica: todo movimiento actualiza los imports en la misma tanda;
> imports siempre con `@/`.

| Subfase | Archivos | Destino | Subagente |
|---|---|---|---|
| 4.1 `src/actions/` — 12 archivos sueltos en raíz (verificados) | `turno.actions.ts` → `turnos/turno.actions.ts` · `barbero.actions.ts` → `barberos/barbero.actions.ts` · `servicio-actions.ts` → `servicios/servicio-actions.ts` · `margenesHorario.actions.ts` → `horarios/` · `diaLaboral.actions.ts` → `horarios/` · `excepcionesLaborales.actions.ts` → `excepciones/` · `configPage.ts` → `configuracion/configPage.ts` · `mercadopago-actions.ts`, `mercadopago-oauth.actions.ts`, `upload-images.actions.ts` → `mercadopago/` · `auth-actions.ts`, `user-dashboard.ts` → `sesion/` | Convención única `<dominio>.actions.ts` | 4.1a */
| 4.2 `src/components/` — 14 archivos sueltos en raíz (verificados; no 16) | `Hero.tsx`, `AboutSection.tsx`, `Header.tsx`, `Footer.tsx`, `LocationSection.tsx`, `ImageCarousel.tsx`, `ServiciosCarousel.tsx`, `HomeClient.tsx` → `inicio/` · `AppGate.tsx`, `LayoutComponent.tsx`, `CookieModal.tsx`, `PrivacyModal.tsx`, `TermsModal.tsx` → `comunes/` · `src/components/admin/AdminShell.tsx` + `AdminSidebar.tsx` → `panel/navegacion/` (moverlos de `admin/`) | Carpetas de dominio según AGENTS.md | 4.2a */
| 4.3 Contextos y test-mp | `src/app/context/Booking.tsx` → `src/contextos/` (crear carpeta) SOLO si sobrevive la Fase 1.4 · `src/app/test-mp/MPTestClient.tsx` → `src/components/test-mp/` | — | 4.3 |

**Qué necesita cada subagente 4.1-4.3:**
- Antes de mover: grep de TODOS los importadores (`rg "actions/archivo"` / rutas relativas
  `../..`, `./` que apunten al archivo).
- Mover el archivo + actualizar TODOS los imports (relativos → `@/...`) + ajustar rutas en
  tsconfig/aliases SI hiciera falta (no se espera: `@/` mapea a `src/`).
- No cambiar el contenido de la lógica (esta fase NO refactoriza; el desglose es Fase 5).
- Entregable: lista de archivos movidos + lista de imports actualizados + `npx tsc --noEmit` sin
  errores nuevos.

**Qué necesita el verificador V4:**
- `grep` de imports relativos rotos (que apunten a rutas viejas: cualquier `../actions/`,
  `../components/` inexistente o imports que no resuelvan).
- Confirmar que NO quedan archivos sueltos en la raíz de `src/components/` ni `src/actions/`.
- Repara lo que falle y certifica. Gate: `npx tsc --noEmit` sin errores nuevos. ACTA de fase.

---

### FASE 5 — Desglose boy-scout (archivos monstruo)

> Cierra con **V5** + `npm run build`. Límites: acciones 100, componentes 200, hooks 150, archivo
> 400; objetivo ≤ 300 y 1 función exportada por archivo (AGENTS.md).

| Subfase | Archivo (líneas verificadas) | Desglose objetivo | Subagente |
|---|---|---|---|
| 5.1 `src/actions/turno.actions.ts` (726, 8 exports) | → `src/actions/turnos/{crear,listar,estado,disponibilidad}.actions.ts`; extraer el algoritmo de slots DUPLICADO (~L98-135 `obtenerDiasDisponibles` vs ~L444-461 `obtenerHorariosDisponibles`) a `src/lib/disponibilidad.ts` (única implementación); extraer el bloque de email duplicado 5 veces — `turno.actions.ts` ~289-303, ~573-587, ~609-623, ~705-719 y `user-dashboard.ts` ~128-143 (mismo `Intl.DateTimeFormat("es-AR")` + `sendTurnoEmail`) — a un helper único en `src/lib/email.ts` | 5.1a (turnos) · 5.1b (disponibilidad) · 5.1c (email) |
| 5.2 `src/components/servicio/ServicioList.tsx` (756, 3 componentes: `ServicioList` ~68, `FilterTag` ~616, `ServicioRow` ~643 con estado y modal propios) | → `ServicioStats`, `PanelFiltros`, `ServicioTabla`, `Filas`, `Paginacion` en archivos propios | 5.2 |
| 5.3 Modales de turno | `src/components/turno/CreateTurnoModal.tsx` (532: formulario + modal de pago + `SubmitButton` ~519) y `src/components/turno/SeleccionadorHorario.tsx` (460) | Desglosar en archivos con responsabilidad única | 5.3a (CreateTurnoModal) · 5.3b (SeleccionadorHorario) |
| 5.4 Resto de monstruos | `src/app/test-mp/MPTestClient.tsx` (675), `src/components/admin/config/GeneralConfigForm.tsx` (433), `src/components/servicio/CreateServicioForm.tsx` (411), `src/actions/barbero.actions.ts` (410), `src/components/barbero/CreateBarberoForm.tsx` (405), `src/components/barbero/EditBarberoModal.tsx` (404), `src/actions/servicio-actions.ts` (404) | Objetivo ≤ 300 líneas y 1 función exportada por archivo (extraer subcomponentes y helpers) | 5.4a-f (uno por archivo, en paralelo) |

**Qué necesita cada subagente 5.x:**
- Leer AGENTS.md §reglas de construcción y este documento §3.
- Respetar las convenciones de Convención `<dominio>.actions.ts` de la Fase 4 (si la Fase 5
  arranca antes de que termine la 4, coordinar las rutas de destino con el coordinador).
- Los helpers extraídos van a `src/lib/` (máx. 80 líneas) con nombres en español.
- Verificar que los exports se mantienen (mismos nombres de función en las mismas rutas de import
  o importadores actualizados).
- Entregable: estructura nueva + diff + `npx tsc --noEmit` sin errores nuevos.

**Qué necesita el verificador V5:**
- Verifica tamaño final de TODOS los archivos de la fase (≤ 400, objetivo 300) y 1 función
  exportada por archivo; confirmar que `turno.actions.ts` ya no existe o no supera límites.
- Repara lo que falle y certifica. Gates: `npx tsc --noEmit` sin errores + `npm run build` OK. ACTA.

---

### FASE 6 — Locks de slots (un solo canal)

> Cierra con **V6**.

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 6.1 Canal único | `src/hooks/useSlotLocks.ts` — REST polling cada 3s (doble armado: ~L139 y ~L186) + WebSocket (`src/app/api/ws/route.ts`) que NO hace broadcast (solo responde al emisor: INIT ~40-49, LOCK_OK/UNLOCK_OK/HEARTBEAT_OK ~71, 82, 94) + heartbeat REST PATCH cada 60s (~141-152) | **Recomendación: REST-only** con polling 10-15s; eliminar `/api/ws` y el `conectarWS` del hook (en desarrollo el WS ya está desactivado ~L93). Decisión final del coordinador si hay argumentos en contra | 6.1 |
| 6.2 Unificar TTL y zona horaria | TTL repetido en `ws/route.ts:4`, `slot-locks/route.ts:6` y el hook; zona horaria divergente: `ws/route.ts:32-33` parsea `new Date(fecha+"T00:00:00Z")` (UTC) vs `slot-locks/route.ts:33-34` usa `-03:00`; el GET de slot-locks ejecuta `deleteMany` de limpieza (~27-29) | TTL en `src/lib/constants.ts` (única fuente); usar `fromZonedTime` como el resto del código; sacar el `deleteMany` de limpieza del GET y moverlo al cron `expirar-turnos` | 6.2 |

**Qué necesita cada subagente 6.x:**
- Entender el flujo completo cliente → hook → API (REST y WS) antes de tocar.
- 6.1: si elimina el WS, borrar `ws/route.ts`, quitar el `conectarWS` del hook y confirmar que no
  quedan importadores (grep).
- Entregable: diff + grep de evidencia + `npx tsc --noEmit` sin errores nuevos.

**Qué necesita el verificador V6:**
- Confirma UNA fuente de TTL (`src/lib/constants.ts`), coherente entre hook y rutas REST; una sola
  convención de zona horaria (`fromZonedTime`); GET de slot-locks sin efectos de escritura.
- Repara lo que falle y certifica. Gate: `npx tsc --noEmit` sin errores nuevos. ACTA de fase.

---

### FASE 7 — Endurecimiento general

> Cierra con **V7**.

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 7.1 Rate limiting auth | `src/actions/auth-actions.ts:16-49` `loginAction` y `51-95` `registerAction` sin throttle; `src/lib/zod.ts:5` password mínima 6 | Password ≥ 8 (OWASP) + limitador por IP/email en login/register | 7.1 |
| 7.2 Uploads | `src/actions/upload-images.actions.ts:45-67` `uploadBarberImages` y `22-28` `uploadConfigImage` (solo validan `file.type` `startsWith("image/")`, MIME spoofeable); `src/actions/servicio-actions.ts:153-168` y `255-270` sin validación | Magic bytes, límite de tamaño en TODAS, `resource_type: "image"`, denegar SVG/HTML | 7.2 |
| 7.3 Headers de seguridad | `next.config.ts` (33 líneas) sin `headers()`; `images.remotePatterns` '**' http/https (L18-30) | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy vía `headers()` de next.config.ts o middleware; restringir `remotePatterns` a Cloudinary + dominios propios | 7.3 |
| 7.4 XSS en emails | `src/lib/email.ts:79` — interpola `clienteNombre` sin escapar en el HTML del email | Escapar TODAS las interpolaciones + `name` con regex/whitelist y máx. 100 en `src/lib/zod.ts:8-10` | 7.4 |
| 7.5 Errores internos al cliente | `src/actions/auth-actions.ts:93` ("Error interno: " + error.message), `src/actions/servicio-actions.ts:198, 306, 361`, `src/actions/mercadopago-actions.ts:136, 250` | Loguear el detalle en servidor con `console.error`, devolver mensaje genérico al cliente | 7.5 |
| 7.6 Rol ADMIN stale en JWT | `src/auth.config.ts:7-18` fija `token.role` al login; `src/lib/seguridad.ts:21-25` confía en `session.user.role` | `requerirAdmin()` puede leer el rol desde BD con caché corta, o acortar `maxAge` de la sesión | 7.6 |
| 7.7 Nodemailer en camino crítico | `sendTurnoEmail` await en `turno.actions.ts` ~289-303, ~573-587, ~609-623, ~705-719, `user-dashboard.ts` ~128-143 y `mercadopago-actions.ts` | Fire-and-forget con `.catch` o `waitUntil` (no bloquear la respuesta del usuario con el envío del mail) | 7.7 |

**Qué necesita cada subagente 7.x:**
- Aplica SOLO el endurecimiento de su fila; respetar el patrón de errores genéricos (log en server,
  mensaje genérico en cliente).
- No agregar dependencias (revisar qué ofrece Node/next/react antes).
- Entregable: diff + `npx tsc --noEmit` sin errores nuevos.

**Qué necesita el verificador V7:**
- Recorre cada fijación: login con throttle, uploads sin spoofeo viable, headers presentes
  (curl/inspección), emails escapados, errores genéricos, rol no stale, email fuera del camino
  crítico.
- Repara lo que falle y certifica. Gate: `npx tsc --noEmit` sin errores nuevos. ACTA de fase.

---

### FASE 8 — Eliminar los ~82 `any`

> Cierra con **V8** + **QA GLOBAL final** (§7).

| Subfase | Archivos (líneas verificadas) | Fix objetivo | Subagente |
|---|---|---|---|
| 8.1 Tipo de estado genérico | `src/types/action-state.ts:8` — `data?: any` | `ActionState<TData = unknown>` genérico | 8.1 |
| 8.2 `session: any` | `src/app/context/Booking.tsx:8`, `src/components/Header.tsx:11`, `src/components/LayoutComponent.tsx:12-13`, `src/components/dashboard/DashboardPanel.tsx:15`, `src/components/turno/TurnoManager.tsx:6`, `src/components/turno/TurnoList.tsx:37, 204`, `src/components/turno/CreateTurnoModal.tsx:49` | Tipo `Session` AUMENTADO (ya existe `src/types/next-auth.d.ts`, 26 líneas) | 8.2 |
| 8.3 `src/actions/turno.actions.ts` (~14 anys) | ~98, 104, 125 (MAP_DIA_SEMANA indexado en `Record<string, dias_laborales>`), 211, 233, 243, 332 (`const where: any = {}`), 445-446, 461, 513, 554 (`dataUpdate`), 683 (`prevState`) | Tipar con Prisma/Zod y `ActionState` | 8.3 |
| 8.4 `catch (error: any)` ×10 + casts | `servicio-actions.ts:81, 114` · `mercadopago-oauth.actions.ts:74` · `mercadopago-actions.ts:132, 246, 295` · `auth-actions.ts:88` · `webhook/route.ts:181` · `cron/expirar-turnos/route.ts:82` · `oauth/callback/route.ts:35` · `cloudinary-uploader.ts:80` · `MPTestClient.tsx:242` — casts innecesarios `src/auth.config.ts:9-12` (`(user as any).id/.role/.telefono/.image`, el tipo YA está aumentado) — `src/auth.ts:12` `PrismaAdapter(prisma) as any` | `error instanceof Error ? error.message : …`; quitar casts; documentar `as any` de `auth.ts` con comentario (workaround Prisma 7 — mantener SOLO ese) | 8.4 |
| 8.5 Props `any` en componentes | `src/app/admin/page.tsx:283, 299, 311` (`StatCard`/`DetailCard`/`Item`/`Empty` → extraer a archivos y tipar) · `barbero/BarberoList.tsx:53-54, 101-102` · `barbero/EditBarberoModal.tsx:16-17, 22-23` · `barbero/CreateBarberoModal.tsx:18-19` · `diaLaboral/diaLaboralClient.tsx:25, 51` · `HomeClient.tsx:7` · `ImageCarousel.tsx:14` · `api/ws/route.ts:12` | Tipar con `generated/prisma` o `zod z.infer` (los schemas existen en `src/lib/zod.ts`, `servicios-zod.ts`, `barbero-zod.ts`, `excepcion-zod.ts`; hoy nadie usa `z.infer`) | 8.5 |

**Qué necesita cada subagente 8.x:**
- Barrer TODO `src/` con grep (`\bany\b`), no solo los archivos listados (la tabla es el mínimo).
- No usar `@ts-ignore` ni `@ts-nocheck` para silenciar: TIPAR de verdad (Prisma `generated/prisma`,
  `z.infer`, `unknown` + type guards).
- Entregable: diff + grep de `any` restante + `npx tsc --noEmit` sin errores.

**Qué necesita el verificador V8 (QA GLOBAL):**
- `rg -n "\bany\b" src/` → 0 (excepto el `as any` documentado de `src/auth.ts`).
- Gate completo: `npx tsc --noEmit` = **0 errores** y `npm run build` OK.
- Ejecuta el QA final de §7 y emite el acta final. Certifica el cierre del ciclo.

---

## 5. Inventario de subagentes (total 48: 36 implementadores + 9 verificadores + 3 roles 5.x)

| Fase | Subagentes | Rol |
|---|---|---|
| FASE 0 | 0.1, 0.2, 0.3, 0.4, 0.5 + V0 | 5 implementadores + 1 verificador |
| FASE 1 | 1.1, 1.2, 1.3, 1.4, 1.5 + V1 | 5 implementadores + 1 verificador |
| FASE 2 | 2.1, 2.2, 2.3 + V2 | 3 implementadores + 1 verificador (+ build) |
| FASE 3 | 3.1, 3.2, 3.3, 3.4, 3.5 + V3 | 5 implementadores + 1 verificador |
| FASE 4 | 4.1, 4.2, 4.3 + V4 | 3 implementadores + 1 verificador |
| FASE 5 | 5.1a, 5.1b, 5.1c, 5.2, 5.3a, 5.3b, 5.4a-f + V5 | 10 implementadores + 1 verificador (+ build) |
| FASE 6 | 6.1, 6.2 + V6 | 2 implementadores + 1 verificador |
| FASE 7 | 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7 + V7 | 7 implementadores + 1 verificador |
| FASE 8 | 8.1, 8.2, 8.3, 8.4, 8.5 + V8 | 5 implementadores + 1 verificador (+ QA global) |

Orden de arranque (resumen): `0.1-0.5 (paralelo) → V0 → 1.1-1.5 (paralelo) → V1 → 2.1-2.3 (paralelo)
→ V2 + build → 3.1-3.5 (paralelo) → V3 → 4.1-4.3 (paralelo) → V4 → 5.1a-5.4f (paralelo, archivos
disjuntos) → V5 + build → 6.1-6.2 (paralelo) → V6 → 7.1-7.7 (paralelo) → V7 → 8.1-8.5 (paralelo)
→ V8 + QA global`.
Nota: si Fases 1.4 y 6.1 eliminan archivos (`BookingModal.tsx`, `ws/route.ts`), los movimientos de
Fase 4 y los tipados de Fase 8 deben omitir esos archivos (coordinador lo propaga).

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Colisiones de archivos entre subagentes paralelos | Tablas por subfase con archivos disjuntos; el coordinador verifica el reparto antes de arrancar cada tanda |
| Fase 4 deja imports rotos (rutas viejas) | Mover + actualizar imports en la MISMA tanda; V4 hace grep de imports relativos viejos y compila con tsc |
| BookingModal / test-mp revierten decisiones previas (AUDITORIA.md §3.2) | Confirmación del coordinador CON EL USUARIO antes de borrar o blindar; queda registrado en el acta |
| Baseline de 13 errores tsc previos | Está autorizado y lo absorbe la Fase 2 (2.1-2.3); hasta la Fase 2 el gate es "0 errores NUEVOS" |
| El build NO typechequea (ignoreBuildErrors) | `npx tsc --noEmit` obligatorio en cada subfase y en cada gate de verificador |
| Archivos que vuelven a superar 400 líneas tras una modificación | Regla del boy scout: se desglosan en la misma tanda (los monstruos conocidos van en Fase 5) |
| No instalar dependencias nuevas | Prohibido salvo justificación; primero buscar solución en repo / React / Next / Node |
| `prisma db push --accept-data-loss` dropea datos en BD de desarrollo | Comportamiento preexistente del script de build; operar solo contra BD de desarrollo, nunca producción |
| Números de línea desplazados entre tandas | Este documento marca "verificar línea antes de editar"; el verificador reubica referencias |
| Fases 4/8 dependen de archivos eliminados en 1.4/6.1 | Orden secuencial de fases + coordinador propaga la lista de archivos eliminados a cada subagente |

## 7. Cierre

Al terminar el **QA GLOBAL (V8 + §7)**, el coordinador global (opencode) confirma contra este
checklist y cierra el ciclo:

1. `npx tsc --noEmit` = **0 errores** (objetivo global).
2. `npm run build` **OK** (Fases 2, 5 y 8; confirmar de nuevo al cierre).
3. `rg -n "\bany\b" src/` = 0 (salvo el `as any` documentado de `src/auth.ts:12`, workaround Prisma 7).
4. **Smoke test manual** de rutas: `/` (público), `/admin`, `/turno`, `/login`, `/register` y
   `/pago` (success/pending/failure/status) — sin regresiones visuales (sistema de color intacto),
   texto SSR presente, auth funcionando, errores genéricos al cliente.
5. **Acta final**: checklist completada + lista de archivos modificados/creados/eliminados por fase
   + cualquier pendiente documentado explícitamente (nunca silenciado).
6. **Actualizar `AUDITORIA.md`** con el resultado del ciclo (qué se remedió, qué sigue pendiente y
   las decisiones de coordinación tomadas).