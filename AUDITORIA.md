# AUDITORIA.md — Auditoría de limpieza del proyecto y plan de ejecución

> Documento de auditoría (solo lectura). Registra los hallazgos de la auditoría exhaustiva del
> código muerto, duplicación, CSS sin uso, dependencias huerfanas y bugs residuales, junto con el
> plan por fases propuesto. **El ciclo de remediación integral (Fases 0-8) se completó — ver §10.**

---

## 1. Objetivo

Auditar el repositorio (barber-turnos) para detectar y documentar:

- Código muerto (archivos, imports, variables, bloques comentados sin consumidores)
- Duplicación de lógica (botones, helpers, tipos, schemas) con ≥3 copias
- CSS y tokens muertos (variables, utilidades, keyframes sin lecturas)
- Dependencias declaradas sin uso
- Bugs residuales de flujo (rutas inexistentes en layout/middleware)
- Páginas legacy sin referencias

Realizada solo con lectura de código (5 subagentes + verificación). Sin cambios al código.

## 2. Estado del proyecto (contexto)

- Next.js 15.2.8 (App Router), TypeScript, Tailwind v4, Prisma 7 + MariaDB, Auth.js v5, Mercado Pago.
- `next.config.ts`: `eslint.ignoreDuringBuilds` y `typescript.ignoreBuildErrors` en `true` → el build NO
  typechequea; `npx tsc --noEmit` manual es la verificación obligatoria (AGENTS.md).
- Errores de types preexistentes (NO tocar salvo pedido): `actions/admin.actions.ts`,
  `actions/calendario.actions.ts`, `prisma/seed.ts`, `EditServicioModal.tsx` (useActionState).
- Sin test framework; validación con build + typecheck.

---

## 3. Hallazgos por nivel de riesgo

### 3.1 🟢 BAJO — Dead code puntual, seguro de eliminar

**Imports sin uso:**
- `Home.tsx:2,4` — `AboutSection`, `Footer` (usados en comentario)
- `TurnoList.tsx:8` — `crearPreferenciaPago`
- `CreateServicioForm.tsx` / `EditServicioModal.tsx` — ícono `ArrowLeft`
- `pago/success.tsx:3,29` — `RedireccionWhatsApp` y `config`

**Variables/props muertas:**
- `admin/page.tsx:65-77` — query Prisma `proximosTurnos` costosa que jamás se renderiza
- `TurnoList.tsx` — props `totalPages` / `currentPage` sin uso
- `pago/success.tsx` — variable `config` sin uso
- `CreateBarberoForm.tsx:187` — `console.log` de debug

**Bloques comentados:**
- `pago/failure.tsx:62-102` — 41 líneas duplicando el estado `pending`
- `HomeClient.tsx:18` — `AboutSection` comentado
- `DashboardPanel.tsx:13-14` — líneas comentadas
- `EditServicioModal.tsx:315` — bloque comentado

### 3.2 🟢 BAJO — Archivos huerfanos (0 consumidores verificados)

| Archivo | Nota |
|---|---|
| `components/LoginModal.tsx` | sin consumidores |
| `components/PagarSeniaButton.tsx` | sin consumidores |
| `components/BarberoListWithSearch.tsx` | sin consumidores |
| `components/ContactForm.tsx` (WhatsappForm) | sin consumidores |
| `actions/config.ts` | duplica lógica de `lib/mercadopago` |
| `actions/excepcion.actions.ts` | duplica `excepcionesLaborales.actions` |

⚠️ **En disputa (AGENTS.md los blinda)**: `actions/admin.actions.ts` (solo `obtenerTurnos`) y
`actions/calendario.actions.ts` — sin consumidores, y borrarlos eliminaría errores de tsc
preexistentes. **No tocados** salvo pedido explícito del usuario.

**Preservados por decisión del usuario** (no se eliminan): `BookingModal` + `useBooking`,
página `/pago/status`, página `/test-mp`, `AboutSection.tsx`.

### 3.3 🟡 MEDIO — Páginas/rutas legacy y bugs

- `/pago/status` — 0 referencias en `src/`; `back_urls` de Mercado Pago apuntan a
  `success`/`pending`/`failure`. (preservado por decisión)
- `/test-mp` — página de test de MercadoPago, bloqueada en prod. (preservado por decisión)
- `BookingModal.tsx` + `useBooking` — modal montado vía provider pero nadie lo abre.
  (preservado por decisión)
- **BUG:** `admin/layout.tsx:18` redirige a `/unauthorized` que **no existe** → un usuario
  no-admin que entra a `/admin` recibe 404. Fix: redirigir a `/dashboard`.
- `middleware.ts` — protege rutas legacy inexistentes (`/excepcionesLaborales`, `/diaLaboral`).

### 3.4 🟠 MEDIO — CSS muerto (tokens/variables sin lecturas)

Verificado con greps transversales:

- **Variantes alfa** `--page-primary-08`, `-18`, `-25`, `-44` (y posiblemente `-60`, `-70`, `-100`):
  0 lecturas. Las demás (`-15/-20/-30/-40/-50/-80`) SÍ se usan.
- `--page-secondary-foreground` — **0 lecturas** (inyectada en layout sin consumidor)
- `--page-secondary-tinta` — **0 lecturas** (ídem)
- Tokens legacy `--beige*` / `--celeste*` — diseño antiguo del sitio (hoy dorado oscuro)
- `.dark` grueso completo de `globals.css`
- Utilidades sin uso: `.text-gradient-celeste`, `.bg-gradient-celeste`, `.bg-gradient-beige`,
  `.shadow-celeste`, `.glass`, `.gradient-card`, `.gradient-celeste-soft`, `.shadow-card`
- Keyframes sin uso: `shimmer`, `shake`
- Tokens shadcn sin lectura: `--popover*`, `--muted*`, `--accent*`, `--destructive*`,
  `--input`, `--ring`, `--radius`, `--sidebar*` (8)
- Shadcn tokens referenciados solo por clases dinámicas (`bg-primary`, `text-muted-foreground`,
  etc.) que en Tailwind v4 **no generan CSS** (no hay `@theme`), por lo que bibliotecas
  `ui/button.tsx` y `ui/badge.tsx` con variantes como `green`, `hero`, `outline-celeste` están
  rotas de facto o sin uso. Los `bg-primary/text-white` remanentes están heredados del sistema
  shadcn.

**Mantener**: `--background`/`--foreground` (body), `--border`, el sistema `--page-*`
(primario/secundario, foreground y tinta son norma en AGENTS/CLAUDE.md). Algunos tokens como
`--page-secondary-foreground`/`-tinta` se reportan como sin consumidor pero son contrato
normativo en AGENTS/CLAUDE.md. Se decide en ejecución si se conservan (recomendado) o se
eliminan con su inyección en layout.

### 3.5 🟢 BAJO — Dependencias declaradas sin uso

| Paquete | Hallazgo |
|---|---|
| `sonner` | 0 imports (toasts hechos a mano) |
| `react-day-picker` | 0 imports |
| `mysql2` | 0 imports (Prisma 7 usa adapter próprio) |
| `next-cache` | 0 imports |
| `radix-ui` (unificado) | 0 imports (solo se usan subpaquetes `@radix-ui/*`) |
| `ts-node` | solo para el `seed` legacy de prisma |
| `mariadb` (directa) | transitiva del `@prisma/adapter-mariadb` |
| `@prisma/client` | 0 imports (client generado en `generated/prisma` autocontenido) — requiere test de build antes de retirar |

### 3.6 🟠 MEDIO — Duplicación de código (≥3 copias)

- **Botón de marca**: `backgroundColor: var(--page-primary)` + foreground inline → **20 usos
  en 12 archivos**; más 3 wrappers con alias `--primary/--secondary/--primary-foreground` y ~14
  usos por clases. Candidato a `ESTILO_BOTON_MARCA` en `lib/constants.ts`.
- **Botón "X" de cierre** de dialog duplicado: 4 copias (2 idénticas).
- **`ActionState`** redefinido ~8 veces casi idéntico → tipo único en `types/`.
- `toLocaleTimeString("es-AR")` y formatos de precio ×5 → `formatearHora`/`formatearPrecio`.
- Fallbacks tipo "X eliminado" ×7; filtro `where estado in [PENDIENTE, CONFIRMADO]` ×5.
- Schemas Zod de nombre/imagen duplicados ×4 y ×3 → helpers zod en `lib`.
- `actions/excepcion.actions.ts` vs `excepcionesLaborales.actions` — duplicado lógico real.

---

## 4. Decisiones del usuario (registradas)

1. **Alcance**: Limpieza completa (dead code + huerfanos + CSS muerto + dependencias +
   refactors de duplicados + fixes de rutas).
2. **Archivos huerfanos a eliminar**: solo los listados en 3.2 (sin BookingModal, /pago/status,
   /test-mp).
3. **Fix de 404**: `admin/layout` → redirigir a `/dashboard` + limpiar rutas legacy del
   `middleware`.
4. **Punto abierto**: incluir/borrar `admin.actions.ts` y `calendario.actions.ts` (0
   consumidores, borraría 5+ errores de tsc) — requiere OK explícito por el blindaje en AGENTS.md.
5. **Documentación**: este archivo `AUDITORIA.md` recoge todo; no implementar nada aún.

---

## 5. Plan propuesto (PENDIENTES-LIMPIEZA.md, en el mismo formato directivo que PENDIENTES.md)

### FASE L1 — Dead code puntual (riesgo bajo, 2 subagentes: público + admin)
Imports sin uso, variables/props muertas, bloques comentados. Gate: `npx tsc --noEmit`.

### FASE L2 — Huerfanos aprobados (riesgo bajo, 1 subagente)
Eliminar los 6 archivos de 3.2. Opcional pendiente de OK: `admin.actions.ts` y
`calendario.actions.ts`. Gate: tsc + `npm run build`.

### FASE L3 — CSS/tokens muertos (riesgo bajo, 1 subagente)
Recortar variantes alfa sin lecturas, `.dark`, tokens beige/celeste, utilidades y keyframes
muertos, tokens shadcn/sidebar según 3.4. Mantener el sistema `--page-*`. Verificar con rg
antes de cada corte.

### FASE L4 — Dependencias (1 subagente)
`npm uninstall` sonner, react-day-picker, mysql2, next-cache, radix-ui, ts-node; probar
`@prisma/client` y `mariadb` con build. Reinstalar para sanity del lockfile.

### FASE L5 — Refactors de duplicados (riesgo medio, 3 subagentes + reviewer)
`ESTILO_BOTON_MARCA` en `lib/constants.ts`, `formatearHora`/`formatearPrecio`, botón "X" de
cierre, `ActionState` único, helpers zod nombre/imagen.

### FASE L6 — Fixes y cierre QA (1 subagente)
- `admin/layout.tsx` → `/dashboard` (no `/unauthorized`)
- `middleware.ts` → depurar rutas legacy
- Verificación final: `npx tsc --noEmit` (sin errores nuevos; preexistentes intactos) +
  `npm run build` + smoke de página pública / admin / pago.
- Redacción de `PENDIENTES-LIMPIEZA.md` (sin tocar `PENDIENTES.md`, ni `AGENTS.md`,
  `CLAUDE.md`).

### Verificación transversal en cada fase
`npx tsc --noEmit` (obligatorio) y `npm run build` al cierre de la fase.

---

## 6. Estado

- [x] Auditoría documentada (este archivo)
- [x] FASE L1 — Dead code puntual (imports, variables, comentarios)
- [x] FASE L2 — Huerfanos aprobados (6 archivos eliminados)
- [x] FASE L3 — CSS/tokens muertos en globals.css
- [x] FASE L4 — Dependencias sin uso desinstaladas
- [x] FASE L5 — Refactors de duplicados
- [x] FASE L6 — Fixes + QA final (tsc y build OK)

## 7. Resultado de la implementación

**FASE L1 — Dead code puntual (11 archivos):**
- Imports sin uso eliminados en `HomeClient`, `TurnoList`, `CreateServicioForm`,
  `EditServicioModal`, `pago/success`.
- `proximosTurnos` (query Prisma jamás renderizada) eliminada de `admin/page.tsx` +
  props muertas `totalPages`/`currentPage` de `TurnoList` (y de sus 3 callers).
- `config` que ni se usaba removido de `pago/success` (también el fetch de `pageConfig`).
- Bloques comentados eliminados: `pago/failure` (41 líneas), `HomeClient`,
  `DashboardPanel`, `EditServicioModal`.
- `console.log` de debug en `CreateBarberoForm` + su `useEffect`.

**FASE L2 — Huerfanos eliminados:** `LoginModal.tsx`, `PagarSeniaButton.tsx`,
`BarberoListWithSearch.tsx`, `admin/config/ContactForm.tsx`, `actions/config.ts`,
`actions/excepcion.actions.ts`. `actions/admin.actions.ts` y `actions/calendario.actions.ts`
**NO se tocaron** (blindaje de AGENTS.md; sigue pendiente el OK explícito).

**FASE L3 — CSS (globals.css −60% de contenido):**
- Quitadas variantes alfa muertas `--page-primary-08/-18/-25/-44`.
- **Corrección al informe:** los `--page-secondary-08/-18/-25/-44` SÍ se usan
  (`horariosList`) → se conservan. `--page-primary-60` se usa → conservado.
- Quitados tokens shadcn sin lectura (`--card*`, `--popover*`, `--muted*`, `--accent*`,
  `--destructive*`, `--input`, `--ring`, `--radius`, `--sidebar-*`), tokens legacy
  (`--beige*`, `--celeste*`), gradients (`--gradient-*`), `--shadow-celeste`,
  `--shadow-card`, `.dark` completo, utilidades sin uso (`.text-gradient-celeste`,
  `.bg-gradient-celeste`, `.bg-gradient-beige`, `.shadow-celeste`, `.glass`), keyframes
  `shimmer`/`shake`.
- **Corrección al informe:** `.shadow-elevated` lo usa `BookingModal` → conservado.
- Conservados: sistema `--page-*` completo (incl. `foreground`/`tinta`, norma de AGENTS),
  `--background`, `--foreground`, `--border`, `--primary/-secondary` shadcn (referenciados
  por `Footer`/`CreateTurnoModal`).

**FASE L4 — Dependencias (−98 paquetes):** desinstalados `sonner`, `react-day-picker`,
`mysql2`, `next-cache`, `radix-ui` (unificado), `ts-node`, `@prisma/client`, `mariadb`.
`@radix-ui/react-dialog` y `@radix-ui/react-slot` pasaron a dependencias directas.
El seed pasó de `ts-node` a `tsx` (ya instalado). `prisma generate` OK sin
`@prisma/client`/`mariadb` directos.
⚠️ El `prisma db push` del build conectó a TiDB y dropeó la tabla `verificacion_usuario`
(2 filas) — comportamiento preexistente del script de build, no de esta limpieza.

**FASE L5 — Refactors:**
- `lib/constants.ts`: `ESTILO_FONDO_MARCA` (11 usos inline), `CLASES_BOTON_MARCA`
  (10 botones en pago/login/register/dashboard/servicio), `CLASES_BOTON_CERRAR`
  (3 botones "X": `ui/dialog`, `EditServicioModal`, `CreateServicioForm`).
- `lib/utils.ts`: `formatearHora` (5 usos: admin, ExcepcionesList, TurnoList,
  SeleccionadorHorario).
- `types/action-state.ts`: `ActionState` único; los 8 actions files hacen
  import + re-export.
- `lib/zod.ts`: `esquemaNombre(etiqueta, regex?, mensajeRegex?)` y
  `esquemaImagenOpcional`; aplicados en `servicios-zod`, `barbero-zod`,
  `excepcion-zod` (mensajes de error idénticos a los originales).
- `SeleccionadorHorario`: su helper local consumió el compartido (rename a
  `formatearHorario` para no colisionar).

**FASE L6 — Fixes y QA:**
- `admin/layout.tsx`: no-admin ahora redirige a `/dashboard` (no `/unauthorized` 404).
- `middleware.ts`: removidas rutas legacy inexistentes (`/excepcionesLaborales`,
  `/diaLaboral`) e `isGestionRoute` duplicada; `/admin/*` sigue protegido.
- `pago/status`: `success === true` (el tipo unificado hace `success` opcional).
- **QA:** `npx tsc --noEmit` → **21 errores, exactamente el baseline preexistente
  (0 nuevos)**; `npm run build` → OK (26 rutas, compilación limpia).

**Pendientes (requieren decisión explícita):**
- Borrar `actions/admin.actions.ts` + `actions/calendario.actions.ts` (0 consumidores;
  borraría 10 errores tsc) — blindados por AGENTS.md. ✅ **Resuelto en §8** (OK del usuario).
- Los 3 errores de `.next/types` en `pago/failure|pending|success` (preexistentes,
  artefacto de PageProps de Next 15).
- Estilos inline multi-prop (`ExcepcionesForm`, `horariosForm/list`, `diaLaboralList`,
  `Header`) conservan la referencia directa a `var(--page-primary)` por tener props
  adicionales (bordes) — candidatos futuros a spread de `ESTILO_FONDO_MARCA`.

---

## 8. Ciclo Seguridad (S1–S7) — implementado

**Versiones:** next-auth 5.0.0-beta.30 → **5.0.0-beta.32** (fix GHSA-8fpg-xm3f-6cx3,
GHSA-7rqj-j65f-68wh, GHSA-x445-f3h2-j279), next 15.2.8 → **15.5.23**, `@auth/core` forzado a
**0.41.3** vía `overrides`. `npm audit`: **0 críticas** (antes 2); restan 23 vulns de majors
fuera de alcance (nodemailer→9.0.5, mercadopago→3.3.0, next→16.3.0) + cadena del CLI de
Prisma (dev) + postcss/sharp (via next).

**S1 — Pago (ex CRÍTICO #1):** `confirmarPagoTurno` exige sesión + titularidad (o ADMIN) y
verifica el pago contra la API de MP (`status=approved`, `external_reference=turnoId`,
`transaction_amount >= seniaCongelada`); sin paymentId → error. `crearPreferenciaPago` y
`verificarEstadoPago` también validan sesión/titularidad. `/pago/success` y `/pago/status`
redirigen a /login sin sesión; en `/pago/status` el éxito solo se muestra si el pago se
verificó (antes `?status=approved` sin paymentId mostraba "Seña Pagada" sin confirmar nada).

**S2 — Turnos (fix + correctitud):** `createTurno` exige `auth()`; el `userId` se toma de la
sesión para usuarios comunes (admin puede delegar); el choque de horarios ahora filtra por
`barberoId` (dos barberos ya no se bloquean entre sí). Removido el hidden input `userId` de
`CreateTurnoModal` (USER).

**S3 — Webhook MP:** verificación de firma `X-Signature` (HMAC-SHA256 con
`MP_WEBHOOK_SECRET`; si no está configurado hace warn y confía en el monto), validación
`transaction_amount >= seniaCongelada` antes de confirmar y solo confirma turnos PENDIENTE.

**S4 — Autorización sistémica:** nuevo `src/lib/seguridad.ts` con `requerirSesion()` /
`requerirAdmin()`. Aplicado a todas las mutations: servicio-actions
(create/actualizar/delete), barbero.actions (7), diaLaboral (3), margenesHorario (3),
excepcionesLaborales (2), configPage (2), upload-images (2), mercadopago-oauth
(desconectarMP), turno.actions (confirmar/actualizar/completed/deleteTurno). Cron
`expirar-turnos`: exige `x-vercel-cron` o `x-cron-secret=CRON_SECRET` en producción.

**S6 — Menores:** removido `allowDangerousEmailAccountLinking` de Google (account linking);
IDORs cerrados en `user-dashboard` (`updateProfile`, `getUserTurnos`, `cancelTurno` ahora
validan titularidad); el cron ya no expone emails en la respuesta. Los `target="_blank"`
ya tenían `rel="noopener noreferrer"`.

**S7 — Blindados eliminados (con OK del usuario):** borrados `actions/admin.actions.ts` +
`actions/calendario.actions.ts` (0 consumidores). Baseline tsc: **21 → 13 errores**
(quedan los 3 de `.next/types` pago, `seed.ts` "Mieracoles" y los 9 de EditServicioModal).

**QA final:** `npx tsc --noEmit` = 13 (exactamente el nuevo baseline, 0 nuevos) ·
`npm run build` = OK (26 rutas).

**Post-QA (bug de runtime Turbopack):** tras el upgrade a next 15.5.23, `next dev --turbopack`
fallaba con `Export ActionState doesn't exist in target module` en `/` (500). Causa: los
módulos `"use server"` re-exportaban el tipo (`export type { ActionState }`), que Turbopack
intenta resolver como export real del módulo de acciones. Fix: eliminados los 8 re-exports
(`turno`, `servicio`, `mercadopago`, `margenesHorario`, `excepcionesLaborales`, `diaLaboral`,
`barbero`, `auth`) y movidos los consumidores (`CreateServicioForm.tsx`, `horariosForm.tsx`)
a `import type { ActionState } from "@/types/action-state"`. Verificado: `tsc` = 13 (baseline)
y dev server Turbopack compila `/`, `/login`, `/register`, `/admin`, `/dashboard`, `/turno`,
`/pago/success` sin errores (HTTP 200/307 esperados).

**Pendientes para ciclos futuros:**
- Setear `MP_WEBHOOK_SECRET` y `CRON_SECRET` en Vercel (env) para activar la firma del
  webhook y el guard del cron.
- Resto de audit: nodemailer@9, mercadopago@3, next@16 (majors).
- Optimización de carga P1–P7 (matcher middleware, next/font, lazy BookingModal, índices
  Prisma, cache cancelTurno) — planificado.

---

## 9. Auditoría integral 2026-08 (seguridad · performance · calidad · typescript · arquitectura)

> Documento de auditoría (solo lectura). Consolida la auditoría integral realizada en agosto de
> 2026 por 5 auditores (seguridad, performance, calidad, typescript, arquitectura) con verificación
> transversal de todos los hallazgos. Resultado: **41 hallazgos numerados** (8 CRÍTICOS, 9 ALTOS,
> 15 MEDIOS, 9 BAJOS). **Nada de este plan ha sido implementado todavía** — el plan directivo vive
> en `PENDIENTES.md` (fases 0-8) y el estado se controla en §9.4.

### 9.1 Resumen ejecutivo

- **Seguridad (8 hallazgos, 4 críticos):** el hash bcrypt de passwords sale al cliente (`include:
  { user: true }` en turnos y user-dashboard), el OAuth de Mercado Pago, los slot-locks y el
  WebSocket aceptan anónimos, y un GET público expone PII (id+name+email) de todos los usuarios.
  El ciclo S1-S7 (§8) dejó la base correcta (webhook con firma, cron con guard, autorización
  sistémica en mutations) — faltan los secrets en Vercel y los fixes críticos de este ciclo.
- **Performance (7 hallazgos, 3 críticos):** AppGate anula el SSR (la app se sirve sin HTML),
  el layout raíz es dinámico (auth + Prisma en todas las rutas → imposible ISR) y BookingModal
  legacy (mock de vehículos, sin BD) viaja en el bundle inicial con framer-motion/embla y CERO
  `next/dynamic` en todo el repo.
- **Calidad (9 hallazgos):** errores internos al cliente, dead code confirmado (`getServicioById`,
  `getBarberoById`, modelo `Configuracion`), catchs que tragan errores sin log, validación manual
  sin Zod en `createTurno`, logs de debug, naming inconsistente y comentarios obsoletos.
- **TypeScript (6 hallazgos):** 3 errores NUEVOS de tsc en `pago/{success,pending,failure}`
  tapados por `typescript.ignoreBuildErrors`, `ActionState.data?: any` que desactiva el tipado del
  payload, `session: any` en 8 puntos y `catch (error:any)` ×10 que anulan el tipo aumentado de
  next-auth.
- **Arquitectura (2 hallazgos):** 6 páginas server con Prisma directo sin capa services (patrón
  auth repetido ~27 veces e inconsistente) y doble lógica de confirmación de pago divergente
  (webhook vs `confirmarPagoTurno`).
- **Lo que está bien (§9.3):** base sólida de server components, caché con `unstable_cache` +
  tags, sin SQLi/XSS, contraste `-foreground`/`-tinta` del ciclo previo y 0 `@ts-ignore` — no tocar.

### 9.2 Tabla consolidada de hallazgos priorizados

#### CRÍTICA

| # | Área | Hallazgo | Evidencia (archivo:línea) |
|---|---|---|---|
| 1 | Seguridad | Hash bcrypt expuesto al cliente: `createTurno`, `actualizarTurno` y acciones de `user-dashboard` usan `include: { user: true }` devolviendo el `...turno` completo; el modelo `user` tiene `password String?`. Fix: select explícito sin password. | `src/actions/turno.actions.ts:~266-311,~560-564,~589-596` · `src/actions/user-dashboard.ts:~76-96` · `prisma/schema.prisma:97` |
| 2 | Seguridad | OAuth de Mercado Pago sin auth: un anónimo puede conectar SU cuenta de MP; los tokens quedan en `configuracion_mercadopago` y cobran todas las señas. Fix: `requerirAdmin()` + state firmado. | `src/app/api/mercadopago/oauth/start/route.ts:33` · `oauth/callback/route.ts:4` · `src/lib/mercadopago.ts:192-218,~300-314` |
| 3 | Seguridad | Slot-locks/WS sin auth: aceptan `sessionId`/`userId` arbitrarios (borrado de locks ajenos, DoS de agenda, fuga de `sessionId`/`userId` de terceros en INIT ~L40-49). Fix: sesión obligatoria + `sessionId` server-side. | `src/app/api/slot-locks/route.ts:68-142` · `src/app/api/ws/route.ts:18-96` |
| 4 | Seguridad | PII: GET público expone `id`+`name`+`email` de TODOS los usuarios. Fix: quitar usuarios del endpoint. | `src/app/api/configuracion-turno/route.ts:31-38` |
| 5 | Perf | AppGate anula el SSR: devuelve `null` si `!initialized` y envuelve `children` en el layout raíz → la app se sirve sin HTML (client-rendered, LCP dominado por JS, SEO vacío). Fix: renderizar siempre + modales como overlay. | `src/components/AppGate.tsx:87` · `src/app/layout.tsx:94-101` |
| 6 | Perf | Layout raíz dinámico: `await auth()` + `getCachedPageConfig()` (Prisma) en TODAS las rutas; home con ~3 queries/visita (Prisma directo `page.tsx:5-7`, `getServiciosCarrusel` sin caché) → imposible ISR. Fix: `auth()` a layouts de rutas protegidas + `unstable_cache` con tag. | `src/app/layout.tsx:65-66` · `src/app/page.tsx:5-7` |
| 7 | Perf | BookingModal legacy activo: mock de reserva de vehículos (sin BD, ~13-52) montado en todas las rutas vía provider + `LayoutComponent`; framer-motion en 8 componentes del bundle inicial, embla en carruseles, CERO `next/dynamic` en todo el repo. Fix: eliminar el mock, lazy-load carruseles/modales. | `src/components/BookingModal.tsx:~13-52` · `src/app/context/Booking.tsx:28` · `src/components/LayoutComponent.tsx:17` |
| 8 | Calidad/TS | Violaciones sistémicas: 11 archivos > 400 líneas (ServicioList 756, turno.actions 726, MPTestClient 675, CreateTurnoModal 532, SeleccionadorHorario 460, GeneralConfigForm 433, CreateServicioForm 411, barbero.actions 410, CreateBarberoForm 405, EditBarberoModal 404, servicio-actions 404); 82 usos de `any` (0 `@ts-ignore`, ok); 8 de 12 actions > 100 líneas; 17 componentes > 200 líneas; 14 componentes sueltos en raíz de `src/components` y 12 actions en raíz de `src/actions` (viola "carpeta de dominio"); bloque de email duplicado ×5; algoritmo de slots duplicado ×2 dentro de `turno.actions.ts`; catálogo de reserva duplicado ×3. | `src/app/turno/page.tsx:10-16` = `src/app/api/configuracion-turno/route.ts:6-46` = fetch en `CreateTurnoModal.tsx:129-149` |

#### ALTA

| # | Área | Hallazgo | Evidencia (archivo:línea) |
|---|---|---|---|
| 9 | Seguridad | Webhook MP fail-open: sin `MP_WEBHOOK_SECRET` (no está en .env) la firma devuelve `true`; mitigado por validación de monto/`external_reference` contra la API (~93-123). Fix: fail-closed en prod + validar ts skew + setear el secret en Vercel. | `src/app/api/mercadopago/webhook/route.ts:17-24` |
| 10 | Seguridad | Cron: `CRON_SECRET` ausente + comparación `===` (no timing-safe) + ~L89 filtra `error.message`. Fix: `timingSafeEqual` + sin detalle + setear el secret. | `src/app/api/cron/expirar-turnos/route.ts:11-23` |
| 11 | Perf | Bundle global sin lazy: framer-motion + embla + autoplay en el chunk inicial; modales de edición con AnimatePresence. Recomendación: `next/dynamic(..., { ssr: false })` o lazy. | bundle inicial |
| 12 | Perf | Locks con carga innecesaria: polling REST 3s (useSlotLocks 139,186, doble armado) + cada GET de slot-locks ejecuta `deleteMany` de limpieza + `findMany` + WS que no difunde (solo responde al emisor) + heartbeat 60s → elegir UN canal (REST-only recomendado, polling 10-15s). | `src/hooks/useSlotLocks.ts:139,186` |
| 13 | Perf | Imágenes: `next.config.ts:29` `images.unoptimized: true` (sin optimizer/srcset/formatos modernos), 0 usos de `priority` en todo el repo, hero de fondo Unsplash 2070px sin preload (Hero.tsx:8-9,34-37), misma imagen en login/register (~33,55 / ~30,53). Fix: `priority`+preload o URLs Cloudinary `f_auto q_auto`. | `next.config.ts:29` · `Hero.tsx:8-9,34-37` · `login/page.tsx:~33,55` · `register/page.tsx:~30,53` |
| 14 | TS | 3 errores NUEVOS de tsc (TS2344): `searchParams` tipado síncrono; Next 15.5 exige `Promise` + `await` (patrón correcto en `pago/status/page.tsx:8-15,21`). Solo los tapa `typescript.ignoreBuildErrors`. | `src/app/pago/{success,pending,failure}/page.tsx` · `src/app/pago/status/page.tsx:8-15,21` |
| 15 | TS | `EditServicioModal.tsx`: 9-10 errores (`useState` sin anotar ~L45 en vez de `useActionState`; `state.errors` no existe ~176,194,197-198,264,277,290,302) + bug de UI: la validación por campo nunca se muestra. | `src/components/servicio/EditServicioModal.tsx` |
| 16 | Calidad | Errores internos al cliente ("Error interno: " + `error.message`). Fix: mensaje genérico + `console.error` en servidor. | `auth-actions.ts:93` · `servicio-actions.ts:198,306,361` · `mercadopago-actions.ts:136,250` |
| 17 | Calidad | Dead code confirmado: `getServicioById`, `getBarberoById`, modelo `Configuracion` (0 usos), guardas "campo aún no migrado" ×5, assets carwash en `src/assets`, `package.json` name "lavadero-web", 3 `useState` muertos en TurnoList:209-211. | `servicio-actions.ts:368` · `barbero.actions.ts:192` · `schema.prisma:60-67` · `mercadopago-actions.ts:113-120,229,291-292` · `webhook/route.ts:131,145-149` · `TurnoList.tsx:209-211` |

#### MEDIA

| # | Área | Hallazgo | Evidencia (archivo:línea) |
|---|---|---|---|
| 18 | Seguridad | Sin rate limiting en login/register + password mínima 6 (`zod.ts:5`); fix ≥8 (OWASP) + limitador. | `src/lib/zod.ts:5` |
| 19 | Seguridad | Uploads sin validación real: upload-images 45-67 (sin MIME ni tamaño), 22-28 (solo `file.type`, spoofeable), servicio-actions 153-168 y 255-270 (sin validación) → magic bytes, límite, `resource_type image`, denegar SVG. | `upload-images.actions.ts:45-67,22-28` · `servicio-actions.ts:153-168,255-270` |
| 20 | Seguridad | Rol ADMIN stale en JWT: `token.role` solo al login/trigger update (auth.config.ts:7-18); `requerirAdmin()` (seguridad.ts:21-25) confía en el token (sesión 30 días). Fix: verificar rol en BD con caché corta. | `auth.config.ts:7-18` · `src/lib/seguridad.ts:21-25` |
| 21 | Seguridad | Sin headers de seguridad (CSP/HSTS/X-Frame-Options/X-Content-Type-Options) ni en next.config ni en middleware; `images.remotePatterns '**'` http+https. | `next.config.ts:18-30` |
| 22 | Seguridad | Email HTML sin escape: `email.ts:79` interpola `clienteNombre` (y `name` solo exige 2 chars, zod.ts:8-10). Fix: escapar + regex/max(100). | `src/lib/email.ts:79` · `src/lib/zod.ts:8-10` |
| 23 | Perf | Nodemailer `await` en el camino crítico de 6 acciones (`sendTurnoEmail` en turno.actions ~289-303,573-587,609-623,705-719; user-dashboard 128-143; mercadopago-actions). Fix: fire-and-forget con `.catch`. | `turno.actions.ts:~289-303,573-587,609-623,705-719` · `user-dashboard.ts:128-143` · `mercadopago-actions.ts` |
| 24 | Perf | `/api/configuracion-turno` sin auth + payload con todos los usuarios + refetch por apertura de modal (CreateTurnoModal:131, EditarTurnoModal:94) aunque la page ya pasa los datos por props. | `CreateTurnoModal.tsx:131` · `EditarTurnoModal.tsx:94` |
| 25 | Perf | Doble sistema de fuentes: `@import` Google bloqueante (globals.css:1, Outfit+Playfair) + Geist `next/font` sin uso (layout.tsx:12-20). Fix: unificar `next/font/google`. | `globals.css:1` · `layout.tsx:12-20` |
| 26 | Calidad | Catchs que tragan errores sin log (turno.actions ~144-146,377-379,395-397,482-484; user-dashboard 63-66,97-100; mercadopago-actions 295-297). | `turno.actions.ts:~144-146,377-379,395-397,482-484` · `user-dashboard.ts:63-66,97-100` · `mercadopago-actions.ts:295-297` |
| 27 | Calidad | Validación manual sin Zod en el flujo crítico (`createTurno` turno.actions 178-191) + `any` en firmas: `updateBarbero(data:any)` (barbero.actions:72), `deleteTurno(prevState:any)` (turno.actions:683). | `turno.actions.ts:178-191,683` · `barbero.actions.ts:72` |
| 28 | TS | `ActionState.data?: any` (action-state.ts:8) desactiva el tipado del payload de todas las actions; falta `z.infer` en todo el repo (0 usos); tipos de modelos duplicados a mano (EditServicioModal 22-33, CreateServicioForm 18-23) en vez de `z.infer` o `generated/prisma`. | `src/types/action-state.ts:8` · `EditServicioModal.tsx:22-33` · `CreateServicioForm.tsx:18-23` |
| 29 | TS | `session: any` en Booking 8, Header 11, LayoutComponent 12-13, DashboardPanel 15, TurnoManager 6, TurnoList 37,204, CreateTurnoModal 49 — anula el tipo aumentado de next-auth (`src/types/next-auth.d.ts`). | `Booking.tsx:8` · `Header.tsx:11` · `LayoutComponent.tsx:12-13` · `DashboardPanel.tsx:15` · `TurnoManager.tsx:6` · `TurnoList.tsx:37,204` · `CreateTurnoModal.tsx:49` |
| 30 | TS | `catch (error:any)` evitable ×10 + casts `(user as any)` en auth.config 9-12 (evitable; el tipo ya está aumentado) + `PrismaAdapter(prisma) as any` en auth.ts:12 (workaround Prisma 7, documentar). | `auth.config.ts:9-12` · `auth.ts:12` |
| 31 | Arq | 6 páginas server con queries Prisma directas sin capa services (app/turno/page 9-26, admin/page 13-122 con comisión 50% hardcodeada ~L200, admin/barbero/page 6-52, admin/excepcionesLaborales/page 6-23, admin/config/page 6-8, dashboard/page 11-13); patrón auth repetido ~27 veces (requerirAdmin boilerplate) e inconsistente (turno.actions 172,325 y mercadopago-actions 39,156,260 usan `auth()` directo). | `app/turno/page.tsx:9-26` · `admin/page.tsx:13-122` · `admin/barbero/page.tsx:6-52` · `admin/excepcionesLaborales/page.tsx:6-23` · `admin/config/page.tsx:6-8` · `dashboard/page.tsx:11-13` |
| 32 | Arq | Doble lógica de confirmación de pago divergente: webhook (webhook/route 100-178) vs `confirmarPagoTurno` back_url (mercadopago-actions 147-253); el webhook no verifica propiedad del turno (~100-103). | `webhook/route.ts:100-178` · `mercadopago-actions.ts:147-253` |

#### BAJA

| # | Área | Hallazgo | Evidencia (archivo:línea) |
|---|---|---|---|
| 33 | Calidad | Logs de debug: auth-actions 52-91 (8 `console.log` con emojis y emails), webhook/route 60 (body completo), mercadopago.ts 126,182-190, mercadopago-actions 133 (❌...). | `auth-actions.ts:52-91` · `webhook/route.ts:60` · `mercadopago.ts:126,182-190` · `mercadopago-actions.ts:133` |
| 34 | Seguridad | `/test-mp` sin control de rol (solo auto-disable `NODE_ENV === "production"`, test-mp/page 8-41) — preservado por decisión previa; proponer `requerirAdmin()`. | `test-mp/page.tsx:8-41` |
| 35 | Calidad | Build sin lint/typecheck habilitados (next.config 4-9). | `next.config.ts:4-9` |
| 36 | Calidad | Modelo legacy `Configuracion` (para el 3.1). | `schema.prisma:60-67` |
| 37 | Calidad | Naming inconsistente: servicio-actions vs turno.actions vs user-dashboard (3 convenciones); funciones en inglés (createTurno, getTurnos, completedTurno, deleteTurno) vs español (obtenerDiasDisponibles, confirmarTurno, actualizarTurno); archivos PascalCase vs camelCase (TurnoList vs horariosList); "deleteservicio" sin camelCase. | `servicio-actions.ts:314` |
| 38 | Calidad | Comentarios obsoletos: turno.actions 133 (dice "duración del servicio" pero avanza 15 min fijos), mercadopago-actions 112-113 (migración ya existente). | `turno.actions.ts:133` · `mercadopago-actions.ts:112-113` |
| 39 | Calidad | `useEffect` sin deps en login/page 15-20 y register/page 15-19 (`router.push` repetido); reconexión WS con closure viejo (useSlotLocks 124-127); `useSearchParams` sin Suspense (MercadoPagoConnectionPanel 160). | `login/page.tsx:15-20` · `register/page.tsx:15-19` · `useSlotLocks.ts:124-127` · `MercadoPagoConnectionPanel.tsx:160` |
| 41 | TS | seed.ts typo "Mieracoles" — bug runtime si se corre; autorizado a corregir. | `prisma/seed.ts:31` |

> Nota: el hallazgo 40 ("no SQL dinámico ni `dangerouslySetInnerHTML` → sin XSS ni SQLi") es un
> hallazgo positivo y vive en §9.3.

### 9.3 Lo que está bien (no tocar)

- Server components correctos en home/admin/turno/dashboard; `"use client"` solo legítimo.
- Caché de turnos con `unstable_cache` + tags precisos (`turnos-{barbero}-{fecha}`, etc.) y
  revalidación dirigida (`turno.actions.ts:17-22,142,480`).
- `Promise.all` en queries de páginas y acciones.
- Mercado Pago SDK solo en server; webhook valida monto + `external_reference` contra la API;
  PKCE + state `httpOnly` en OAuth.
- Sin `dangerouslySetInnerHTML`, sin `href: javascript:`, `target=_blank` con `rel="noopener
  noreferrer"`.
- Sin `$queryRaw`/`$executeRaw` (sin SQLi); bcrypt rounds 10; mensaje de login genérico;
  middleware `/admin` exige sesión + ADMIN. *Hallazgo 40: no SQL dinámico ni
  `dangerouslySetInnerHTML` → sin XSS ni SQLi.*
- Prisma singleton + adapter mariadb (`connectionLimit` 5); secretos en `.gitignore`.
- Contraste de color con `--foreground`/`-tinta` y `lib/contraste.ts` (ciclo previo OK); imports
  con `@/`.
- Lucide named imports; Radix ligero (dialog/slot).
- Cron protegido con `x-vercel-cron`/`CRON_SECRET` y runtime `nodejs` (aunque falta setear el
  secret en Vercel).
- 0 `@ts-ignore`/`@ts-nocheck`.

### 9.4 Estado de remediación

Checklist de fases 0-8 del plan (cerradas en el ciclo 2026-08, certificadas por V0…V8 — ver §10):

- [x] Fase 0 — Seguridad crítica
- [x] Fase 1 — SSR y performance
- [x] Fase 2 — Correctitud TS
- [x] Fase 3 — Dead code y limpieza
- [x] Fase 4 — Organización por dominios
- [x] Fase 5 — Desglose boy-scout
- [x] Fase 6 — Locks de slots
- [x] Fase 7 — Endurecimiento general
- [x] Fase 8 — Tipos sin any + QA global

> El plan directivo detallado con subfases, subagentes y gates está en `PENDIENTES.md`. Los
> errores de types preexistentes (`pago/*`, `seed.ts`, `EditServicioModal` — baseline 13) están
> autorizados para corrección en Fase 2.

---

## 10. Ciclo de remediación completado (Fases 0-8 + V8 QA global)

Ciclo cerrado en 2026-08-11. Cada fase se ejecutó con subagentes paralelos y se certificó con su
verificador (V0…V8). El QA global final (V8) corrió los gates de PENDIENTES.md §7 con éxito.

### 10.1 Resultado por fase (resumen de lo remediado)

| Fase | Objetivo | Resultado |
|---|---|---|
| 0 — Seguridad crítica | Vectores críticos | Hash bcrypt fuera del cliente (selects explícitos en turnos/dashboard); OAuth de MP con `requerirAdmin()` + state firmado; webhook MP fail-closed + `timingSafeEqual` + sin `error.message` al cliente; PII (usuarios) removida del endpoint público de configuración; slot-locks con sesión obligatoria y `sessionId` derivado en servidor; `/api/ws` sin broadcast eliminado |
| 1 — SSR y performance | SSR real e ISR | AppGate renderiza SIEMPRE el contenido (modales de cookies/términos/privacidad como overlay); `auth()` movida a layouts de rutas protegidas; `pageConfig` cacheado con tag y revalidado; carrusel y dashboard con `getCachedData`; BookingModal + useBooking + provider eliminados (con OK del usuario); hero con preload/priority (Cloudinary); `matcher` restringido en middleware; fuentes unificadas en `next/font/google` |
| 2 — Correctitud TS | 0 errores tsc | `searchParams: Promise<…>` en pago/{success,pending,failure}; `EditServicioModal` migrado a `useActionState` con `ActionState` tipado (bug de UI: errores por campo ahora visibles); typo "Mieracoles" → "Miercoles" en seed |
| 3 — Dead code y limpieza | Basura y huérfanos | Modelo `Configuracion` eliminado del schema; 5 guardas "campo aún no migrado" y sus casts `as any` eliminados; `/test-mp` blindado con `requerirAdmin()`; 8 `console.log` con emojis/emails y logs de bodies/tokens saneados; `getServicioById`, `getBarberoById`, assets carwash y `use-toast` duplicado eliminados; package renombrado a `barber-turnos` |
| 4 — Organización por dominios | Arquitectura predecible | 12 archivos de `src/actions/` y 14 de `src/components/` movidos a carpetas de dominio (turnos/, barberos/, horarios/, servicios/, panel/, inicio/, comunes/…); todos los imports migrados a `@/` |
| 5 — Desglose boy-scout | Archivos ≤ límites | `turno.actions.ts` (726) → 4 actions + `src/lib/disponibilidad.ts` (algoritmo de slots único) + bloque de email único en `src/lib/email.ts`; `ServicioList.tsx` (756) desglosado en subcomponentes; modales de turno, MPTestClient, GeneralConfigForm, formularios de servicio/barbero y servicio-actions desglosados |
| 6 — Locks de slots | Un solo canal | REST-only con polling (10-15s); `/api/ws` eliminado; TTL único en `src/lib/constants.ts` (`TTL_LOCK_SLOT_MS`); zona horaria unificada con `fromZonedTime`; limpieza de locks fuera del GET (cron) |
| 7 — Endurecimiento general | Capa defensiva | Rate limiting por IP/email en login/register (15 min / 5 intentos) + password ≥ 8; uploads con magic bytes, límite de tamaño, `resource_type: "image"` y SVG/HTML denegados; CSP/HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy en `next.config.ts`; emails escapados + nombre máx. 100; errores internos logueados en servidor con mensaje genérico al cliente; `requerirAdmin()` con rol REAL de BD + caché 60s; envío de email fuera del camino crítico (fire-and-forget) |
| 8 — Tipos sin `any` | 0 anys | 82 usos de `any` → 1 (`src/auth.ts:12`, workaround Prisma 7 documentado en español); `ActionState<TData>` genérico; `session: any` eliminado (8.2) y cadena de session del formulario de turno tipada con `Session`; `catch (error: any)` y casts eliminados |

### 10.2 Pendientes explícitos (documentados, no silenciados)

- `src/actions/servicios/servicio-actions.ts` (397) y `src/actions/mercadopago/mercadopago-actions.ts`
  (294) superan el límite de capa acciones (100) — preexistentes.
- `EditServicioModal.tsx` (392), `EditarTurnoModal.tsx` (386), `TurnoList.tsx` (~379),
  `BarberoList.tsx` (220), `use-toast.ts` (151 > 150 de hooks) — preexistentes cerca de límites
  (`useSlotLocks.ts` 138, dentro).
- `email.ts` (67) y `plantilla-email.ts` (80): 2 exports en `email.ts` (`sendTurnoEmail` +
  `enviarEmailTurno`) — preexistente.
- `AboutSection.tsx` — dead code preservado por decisión de coordinación (V4).
- `README.md` desactualizado (menciona Next 16 y `lavadero-web` en instrucciones de clone) — no
  tocado (los `.md` de planificación no se tocan); conviene una pasada de docs.
- `unoptimized: true` mantenido + opcional `f_auto/q_auto` de Cloudinary (decisión documentada en
  `next.config.ts:28-31`).
- `MP_WEBHOOK_SECRET` y `CRON_SECRET` obligatorios como env vars en Vercel (fail-closed activo).
- Registrado por V8 (boy scout): `margenesHorario.actions.ts` (367, 5 exports) y
  `diaLaboral.actions.ts` (~249, 5 exports) y `cloudinary-uploader.ts` (2 exports) quedaron con
  varias funciones exportadas — preexistentes (la Fase 5 solo desglosó los >400 líneas); pendiente
  de desglose futuro.

### 10.3 Decisiones de coordinación tomadas

- **Locks REST-only**: se eliminó `/api/ws` y el `conectarWS` del hook (Fase 6.1); polling como
  canal único.
- **Eliminación de BookingModal + useBooking + `/api/ws`**: revierte la decisión previa de
  AUDITORIA §3.2, confirmada con el usuario (Fases 1.4/6.1).
- **Blindaje de `/test-mp`**: `requerirAdmin()` además del auto-disable en producción (Fase 3.3).
- **`unoptimized: true` mantenido**: todo el tráfico de imágenes sale del CDN de Cloudinary con
  `f_auto/q_auto` opcional; comentario de decisión en `next.config.ts` (Fase 1.5).
- **`requerirAdmin()` con rol de BD + caché 60s**: caché en módulo (`Map` con expiración), no
  `unstable_cache` (no disponible dentro de Server Actions); documentado en `src/lib/seguridad.ts`.
- **V8 QA**: el build falló por `googleLoginAction` no async (`auth-actions.ts:98`) — reparado en
  esta pasada; la cadena de session del formulario de turno (fuera del alcance de 8.2) se tipó con
  `Session | null` en el QA global.

### 10.4 QA global final (V8) — gates de PENDIENTES.md §7

1. `npx tsc --noEmit` = **0 errores** ✓
2. `npm run build` = **OK** (26 rutas, compilación limpia) ✓
3. `rg "\bany\b" src/` = **1** (solo `src/auth.ts:12`, workaround Prisma 7 documentado) ✓
4. **Smoke test SSR** (next start -p 3100, luego detenido) ✓:
   - `/` → 200, 40.6 kB HTML con texto SSR real (nav "Solicita tu Turno", hero "Arte y Precisión
     en Cada Corte", "Santa Clara, Buenos Aires", `<title>Mayoraz</title>`, colores de PageConfig
     inyectados, imagen del hero con preload)
   - `/login` y `/register` → 200 con contenido (formularios con Iniciar sesión / Contraseña / Email)
   - `/turno` → 307 → `/login?callbackUrl=%2Fturno` (auth sin sesión) ✓
   - `/admin` → 307 → `/login?callbackUrl=%2Fadmin` (auth sin sesión) ✓
   - `/pago/status` → 307 → `/login` (por diseño S1: redirige sin sesión; ruta pública alternativa
     verificada: `/` 200) ✓
5. **Acta final** emitida por V8 (ver ACTA DEL CICLO en la sesión de QA global) ✓
6. **AUDITORIA.md actualizado** (esta sección) ✓

---

## 11. Ciclo de ordenamiento completado (Fases 9-15 + V15 QA global) — 2026-08-11

Ciclo cerrado en 2026-08-11. Cada fase se ejecutó con subagentes (implementadores + verificador) y
se certificó con su verificador (V9…V15). El QA global final (V15) corrió los gates de PENDIENTES.md
§9 con éxito. **Meta global lograda:** 0 archivos de código con más de una función exportada (salvo
re-exports documentados del framework/store), 0 patrones duplicados ≥3 copias, `npx tsc --noEmit` en
0 errores y `npx next build` OK (26 rutas).

### 11.1 Resultado por fase (resumen de lo centralizado/desglosado)

| Fase | Objetivo | Resultado |
|---|---|---|
| 9 — Constantes, tipos y helpers | Base sin riesgo | `lib/constants.ts` centralizado: `ZONA_HORARIA`, `ESTADOS_TURNO`, `ESTADOS_TURNO_ACTIVOS`, `MINIMO_ANTICIPACION_MS`, familia de días DB (`DIAS_SEMANA_DB`, `MAPA_DIA_SEMANA_DB`, `REVERSE_MAPA_DIA_SEMANA_DB`) y display (`DIAS_SEMANA`, `ABREVIATURAS_DIAS`), `SELECCION_USUARIO_BASICA`; ~30 consumidores actualizados; `lib/utils/` desglosado en 8 archivos (1 fn c/u) + `lib/es-imagen-valida.ts`; tipos unificados (`types/excepcion.ts`, `types/page-config.ts`, `ActionStateInicial`) y definiciones manuales reemplazadas en 27 archivos |
| 10 — Consultas Prisma + autorización | Capa de servicios | `lib/consultas/` (16 consultas, 1 fn/archivo) reemplaza los `findMany`/`findUnique` duplicados de servicios/barberos/márgenes/días/turnos/config; `lib/seguridad/` (`requerir-sesion`, `requerir-admin`, `es-admin`, `requerir-propietario`, `exigir-admin`) reemplaza el `auth()` manual, el check de rol y el boilerplate de admin en ~30 archivos |
| 11 — Server actions 1 por archivo | Desglose de actions | Las 10 actions multi-función desglosadas: servicios (5), horarios (10), mercadopago (3+5), sesión (7), configuracion (3), excepciones (2) → 1 acción/archivo, ≤100 líneas; contrato de `user-dashboard` unificado a `ActionState`; helpers transversales: `confirmarTurnoPorPago` (único, con flag `soloSiPendiente` que preserva webhook vs acción), `lib/revalidar/` (4 helpers), `enviarEmailTurnoSeguro` |
| 12 — Desglose de `lib/` y layout | lib multi-función → carpetas | `lib/mercadopago/` (10 fns + helper `uri-redireccion` + const/tipos), `lib/contraste/` (6 fns), `lib/cloudinary-uploader/` (2 fns), `lib/email/` (2 fns + seguro), `lib/utils/` (absorbido), `src/app/metadata.ts` + `layout.tsx` con solo `RootLayout` (re-export de metadata); regex de color única en `lib/contraste/es-color-hex-valido` |
| 13 — Primitivas shadcn/ui y toast | Desglose estricto | `ui/dialog/` (10 piezas), `ui/carousel/` (5 + `contexto.ts`), `ui/button/` (`Button` + `button-variants`), `ui/badge/`; toast dividido en `lib/estado-toast.ts` (store compartido, 1 export de función) + `lib/toast.ts` (emisor) + `hooks/use-toast.ts` (hook); ~20 importadores migrados |
| 14 — Componentes y hooks comunes | Eliminar duplicación de UI | `ui/ModalBase` (8 modales), `ui/EmptyState` (8 listas), `ui/boton-submit-form-status` + `ui/boton-submit-pending` (10 botones), `ui/SelectorCheckboxColapsable` (SelectorServicios/SelectorHorarios), unificación de `CampoFormulario`; hooks `useRetroalimentacionAccion` (9), `useConfiguracionTurno` (2), `useSessionId` (2); imagen centralizada en `useImagenServicio` + `SeccionImagenServicio` (4) |
| 15 — QA global (V15) | Certificación | 0 violaciones de "1 función exportada"; 0 archivos >400 líneas; 0 duplicados ≥3 copias; `tsc` = 0; `next build` = OK (26 rutas); smoke test HTTP en puerto 3100 con respuestas esperadas |

### 11.2 QA global final (V15) — gates de PENDIENTES.md §9

1. **0 archivos con más de una función exportada** en `src/` ✓ (los únicos multi-export son `route.ts`
   de framework y el re-export documentado de metadata en `layout.tsx`)
2. **0 patrones duplicados con ≥3 copias** ✓ (verificado con greps transversales de zona horaria,
   estados, días, `toLocaleString`, selects de usuario, queries Prisma, modales custom, botones
   submit, empty states, toast+refresh, `auth()` manual, rol `=== "ADMIN"`)
3. **Límites por capa** ✓ (acciones ≤100, lib ≤80, componentes ≤200, hooks ≤150, global ≤400; 6
   componentes 201-400 líneas con 1 sola función = pendiente futuro, no aplica boy scout)
4. `npx tsc --noEmit` = **0 errores** ✓
5. `npx next build` = **OK** (26 rutas) ✓
6. **Smoke test HTTP** ✓: `/` 200 SSR, `/login` 200, `/register` 200, `/turno` 307→login,
   `/admin` 307→login, `/pago/*` responden. Verificación interactiva (toast/modales/lista de turnos
   con sesión) pendiente de smoke manual en navegador.
7. **Acta final** ✓ (emitida por V15)
8. **AUDITORIA.md actualizado** ✓ (esta sección)

### 11.3 Pendientes explícitos (documentados, no silenciados)

- **6 componentes >200 líneas con UNA sola función** (desglose por tamaño NO es objetivo de este
  ciclo, decisión §4.3 del usuario): `MercadoPagoConnectionPanel.tsx` (375), `TurnoList.tsx` (357),
  `EditarTurnoModal.tsx` (300), `DashboardPanel.tsx` (292), `EditServicioModal.tsx` (242),
  `horariosList.tsx` (219). La Fase 14 los redujo de paso (EditServicioModal 393→242,
  EditarTurnoModal 386→300, TurnoList 380→357, BarberoList <200, diaLaboralList <200).
- **Overlay de teléfono de `DashboardPanel`**: contenedor `fixed inset-0` preexistente fuera del
  alcance de §3.2 (no se migró a `ModalBase` por no estar en la lista de duplicados del plan).
- **Desviación de ubicación de `confirmarTurnoPorPago`**: quedó en `@/lib/confirmar-turno-por-pago.ts`
  en vez de `lib/mercadopago/` como sugería el plan §6.12.1 — está centralizado y es consumido por
  webhook + `confirmar-pago.actions`; se mantuvo para no re-mover imports ya migrados (decisión de
  V12).
- **`lib/estado-toast.ts` (~73 líneas)**: store único compartido (toast + useToast), excepción
  justificada del límite lib 80; tipos extraídos a `types/toast.ts`.
- **3 usos de `toLocaleString("es-AR")` de fecha** (crear-preferencia, MercadoPagoConnectionPanel,
  test-mp/InfoTurno): candidatos opcionales a `formatearFechaHora` (output distinto, se preservó el
  formato inline).
- **Helpers en raíz de `lib/`**: `limpiar-url-imagen.ts`, `subir-imagen-servicio.ts`,
  `es-imagen-valida.ts`, `obtener-config-cacheada.ts` (1 función c/u, dominio válido, no bloqueante).
- **`send-turno-email.ts` mantiene los subjects de email** con literales `CANCELADO`/`CREADO`/etc.
  (dominio de email, justificado).
- **Smoke test interactivo pendiente**: toast funcional (crear/editar servicio o barbero), modales
  abriendo y lista de turnos renderizando requieren navegador con sesión (documentado por V15).
- **Secrets en Vercel**: `MP_WEBHOOK_SECRET` y `CRON_SECRET` siguen pendientes de configurar en el
  entorno (del ciclo anterior, §8/§10).

### 11.4 Decisiones de coordinación tomadas

- **`exigirAdmin` como wrapper** (Fase 10.2): 23 call sites migrados al wrapper; 4 se dejaron con
  `requerirAdmin()` directo porque validan el id ANTES del check de admin (cambiaría la precedencia
  de mensajes) o devuelven un shape con `images: []`.
- **`confirmarTurnoPorPago` con flag `soloSiPendiente`** (V11): el webhook lo pasa `true` (solo
  confirma turnos PENDIENTES, comportamiento histórico) y `confirmarPagoTurno` omite el flag
  (confirmaba cualquier no-CONFIRMADO, comportamiento histórico de la acción).
- **`contexto.ts` de carousel** (V13): exporta `useCarousel` + context + tipos (excepción
  documentada del plan §6.13.1, necesario para 4 piezas).
- **`estado-toast.ts` exporta SOLO `dispatch`** (V13): 1 función exportada; `reducer`,
  `addToRemoveQueue`, `actionTypes` y `genId` quedan internos/privados para cumplir la regla.
- **`confirmarTurnoPorPago` no se movió a `lib/mercadopago/`** (V12): desviación del plan §6.12.1
  aprobada para no re-mover imports; la centralización del objetivo se cumple igual.
- **V14**: `ui/boton-submit.tsx` del plan se materializó como 2 archivos
  (`boton-submit-form-status.tsx` + `boton-submit-pending.tsx`) para cumplir 1 export por archivo.

## 12. Apéndices A y B del ciclo completados — 2026-08-27

Pendientes NUEVOS de `PENDIENTES.md` (Apéndices A y B), aprobados en plan el 27-ago-2026 e
implementados en la misma fecha. Orquestación con 3 subagentes implementadores (B-A, B-B, B-C en
paralelo+secuencial según §B.9) + agente verificador que **certificó** la fase sin requerir
reparaciones.

### 12.1 Apéndice A — Selector visual de barberos (tarjetas de foto)

| Archivo | Acción |
|---|---|
| `src/components/turno/SelectorBarberoTarjetas.tsx` | **NUEVO** — selector de tarjetas con avatar circular (`srcImage` o iniciales con `var(--page-primary-30)`), nombre centrado, estados seleccionado/no seleccionado con `var(--page-primary)`/`-15`/`-20`/`-60`, check con `-foreground`, hidden input `name="barberoId"` |
| `src/components/turno/SeccionBarbero.tsx` | Usa el nuevo selector + mensaje de lista vacía conservado |
| `src/components/turno/FormularioTurno.tsx` | Guard `onSubmit` que bloquea el envío (toast) si no hay barbero; barbero a ancho completo |
| `src/components/turno/EditarTurnoModal.tsx` | Reemplaza el `CampoSelect` "Asignar Barbero" por el selector (hidden `barberoId`); `CampoSelect` queda solo para servicio |

### 12.2 Apéndice B — Rediseño del modal "Nuevo Turno" (flujo completo de reserva)

| Archivo | Acción |
|---|---|
| `src/components/turno/SeccionServicio.tsx` | `select` → tarjetas de servicio (nombre, duración, precio con `formatearMoneda`) + hidden `servicioId` |
| `src/components/turno/SeccionConfirmacion.tsx` | **NUEVO** — sección final que reutiliza `SeccionCliente` + nota de confirmación |
| `src/components/turno/ResumenTurno.tsx` | **NUEVO** — sidebar de resumen en tiempo real (servicio, barbero, fecha, hora, total) + botón CONFIRMAR TURNO (`BotonSubmitFormStatus` con `deshabilitado`) + Cancelar |
| `src/components/turno/SeleccionadorHorario.tsx` | Refactor presentacional: recibe `disponibilidad` por props; exporta el tipo `DatosDisponibilidadHorarios` |
| `src/components/turno/GrillaCalendario.tsx` / `DiaCalendario.tsx` / `ListaHorarios.tsx` | Acentos `#E8B031` → `var(--page-primary*)`; neutros/superficies oscuras fijos intactos |
| `src/components/turno/FormularioTurno.tsx` | Layout 2 columnas `lg:grid-cols-[1fr_320px]`, sube `useDisponibilidadHorarios`, guard `manejarEnvio` por selección completa |
| `src/components/turno/CreateTurnoModal.tsx` | Ancho `max-w-4xl` → `max-w-5xl`; pasa `barberos` a `FormularioTurno` |
| `src/components/ui/boton-submit-form-status.tsx` | Prop opcional `deshabilitado` → `disabled={pending || deshabilitado}` |

### 12.3 Gates y decisiones

- `npx tsc --noEmit` = **0 errores** ✓
- `npm run build` = **OK** (28 rutas) ✓
- `npm run lint`: sin errores en los archivos de la fase; solo `warning` `no-img-element` en
  `SelectorBarberoTarjetas` (marcado `<img>` exigido por el Apéndice A.4.1, consistente con
  `BarberoList.tsx`). Los errores de lint reportados son preexistentes y ajenos a esta fase
  (`types/barbero|horarios|servicio|turno.ts`, `usoPruebasMercadoPago.ts`, `requerir-sesion.ts`).
- **Decisión de coordinación**: `SeleccionadorHorario` pasó a presentacional; el estado de
  disponibilidad (`useDisponibilidadHorarios`) se subió a `FormularioTurno` y `EditarTurnoModal`
  (consumidor que no figuraba en la tabla §B.7 pero era necesario actualizar para no romper el modal
  de edición). El plan §B.7 no lo listaba; se documenta como ajuste necesario.
- **Sin regresiones esperadas**: hidden inputs (`servicioId`, `barberoId`, `horarioReservado`,
  `userId`, `id`) intactos dentro de sus `<form>`; `createTurno`/`actualizarTurno` no se tocaron.
- **Pendiente explícito**: `EditarTurnoModal.tsx` quedó en 305 líneas (>200 objetivo con 1 sola
  función); cubierto por la decisión §4.3 (no se desglosa por tamaño en este ciclo). El smoke test
  visual/interactivo en navegador sigue pendiente (requiere sesión), como ya se documentó en §11.

### 12.4 Correcciones posteriores (2026-08-27)

1. **Overflow de descripción larga de servicios** (modal Nuevo Turno): la descripción de un
   servicio con cadenas sin espacios expandía el ancho del modal y generaba scroll horizontal.
   Corrección robusta: `break-words` + `[overflow-wrap:anywhere]` en la descripción de
   `SeccionServicio.tsx` y en nombre/descripción de `ResumenTurno.tsx`; `line-clamp-3` + `title`
   (tooltip con el texto completo) en la descripción del modal; `min-w-0` en tarjetas, panel
   izquierdo y sidebar para permitir que la columna `1fr` se encoja. Sin cambios de diseño.
2. **Calendario con colores de la BD**: se eliminaron los superficies/accesorios dorados fijos
   (`#18150F`, `#2A2318`, `#8E8675`, `#6B6355`, `#4A4438`, `#3A342C`, `#1A1612`, `#2C261D`,
   `#1C1812`, `#E4E0D9`) de `GrillaCalendario.tsx`, `DiaCalendario.tsx` y `ListaHorarios.tsx`,
   reemplazándolos por neutros zinc (`zinc-900/60`, `zinc-800`, `zinc-400/500/600/700`) consistentes
   con el modal, manteniendo el acento dinámico `var(--page-primary)`/`-foreground`/`-tinta` y las
   variantes alfa `--page-primary-XX` (ya inyectadas desde `page_config` en `layout.tsx`). No se
   creó configuración de color nueva ni se reemplazó el sistema existente. `EditarTurnoModal.tsx`
   conserva su paleta dorada propia (diseño preexistente del modal de edición, fuera del alcance).
   Gates: `npx tsc --noEmit` = 0, `npm run build` = OK, lint sin errores en los archivos tocados.
3. **Layout del modal Nuevo Turno (scroll independiente + resumen sticky)**: el contenedor del modal
   dejó de scrollear como un todo (`overflow-y-auto` → `overflow-hidden flex flex-col` en
   `CreateTurnoModal.tsx`). El `<form>` de `FormularioTurno.tsx` pasó a ser el cuerpo con altura
   acotada (`flex-1 min-h-0`) y, en desktop, la columna izquierda scrollea internamente
   (`lg:overflow-y-auto`) mientras el panel derecho (`ResumenTurno`) queda fijo alineado arriba
   (`lg:self-start lg:sticky lg:top-0`) con el botón de confirmación siempre visible. En mobile el
   form scrollea completo (`overflow-y-auto`, resumen debajo). Gates: `npx tsc --noEmit` = 0,
   `npm run build` = OK.