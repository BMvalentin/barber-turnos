# AUDITORIA.md — Auditoría de limpieza del proyecto y plan de ejecución

> Documento de auditoría (solo lectura). Registra los hallazgos de la auditoría exhaustiva del
> código muerto, duplicación, CSS sin uso, dependencias huerfanas y bugs residuales, junto con el
> plan por fases propuesto. **Nada de este plan ha sido implementado todavía.**

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
- [ ] FASE L1
- [ ] FASE L2
- [ ] FASE L3
- [ ] FASE L4
- [ ] FASE L5
- [ ] FASE L6

Nada de este plan se ha ejecutado: el código del repo está intacto.