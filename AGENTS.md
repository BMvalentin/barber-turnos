# AGENTS.md

# Reglas globales del proyecto

### Idioma

- Todo el código, comentarios, mensajes de UI y nombres de archivos/carpetas deben estar en **español**.
- Excepciones (solo cuando el requisito técnico o el uso universal lo exige):
  - APIs de librerías y del sistema: `useSession`, `signIn`, `PrismaClient`, `fetch`, `Request`, `onDelete`, `GoogleProvider`, etc.
  - Modelos de base de datos de next-auth: `user`, `account`, `user_role` (nombres exactos exigidos por el adaptador).
  - Nombres universales compartidos por ambos idiomas: `footer`, `header`, `hero`, `layout`, `page`, `route`, `hook`, `middleware`, `proxy`, `server.js`, `next.config.ts`, etc.
  - Paquetes npm y nombres exportados por librerías de terceros (lucide-react, radix-ui, etc.).
- Regla ESLint activa: `@typescript-eslint/no-explicit-any: error` — prohibido usar `any`.

## Reglas de construcción (PERMANENTES — no eliminar, no saltar)

Estas reglas se agregan a las anteriores y son de cumplimiento obligatorio para TODO código nuevo y
toda modificación. No pueden borrarse, atenuarse ni saltarse nunca.

1. **Máximo UNA función exportada por archivo de código.** Un archivo (ts/tsx/js/jsx) puede exportar
   una sola función, componente React o hook. Si se necesitan más, se crean archivos adicionales.
   - Excluidos: archivos de constantes, tipos e interfaces (no exportan funciones).
   - Los closures internos de un componente (event handlers, callbacks) no cuentan como funciones del
     archivo; si un helper deja de ser trivial, se mueve a su propio archivo.
2. **Tamaño máximo de archivo: 400 líneas (objetivo: 300).** Ningún archivo de código puede superar
   las 400 líneas. Si lo supera, debe desglosarse en archivos con responsabilidad única.
3. **Regla del boy scout:** cualquier archivo existente que se modifique y quede fuera de límites
   (varias funciones exportadas o más de 400 líneas) debe desglosarse en la misma tanda de cambios.
4. Los documentos `.md` (documentación, planificación) no están sujetos a los límites de líneas.

## Organización por carpetas (PERMANENTE — no eliminar, no saltar)

Esta regla complementa las reglas de construcción y es de cumplimiento obligatorio para TODO
código nuevo y toda modificación. Su objetivo es mantener una arquitectura ordenada y predecible.

1. **Todo archivo de código debe vivir dentro de una carpeta que indique su dominio o propósito.**
   Está PROHIBIDO dejar archivos sueltos en la raíz de `src/` o en carpetas de dominio.
   - Si el archivo pertenece a un dominio existente, se coloca en su carpeta de dominio.
   - Si el dominio no existe, se crea una carpeta nueva con nombre descriptivo.
2. **Esquema de referencia de `src/`:**
   - `src/app/` — solo archivos de ruta de Next.js (`page`, `layout`, `route`, `loading`, `error`,
     `not-found`, `manifest`, `robots`, `sitemap`) y archivos propios del framework (`auth.ts`,
     `proxy.ts`). Los componentes de interfaz NO viven acá.
   - `src/componentes/<dominio>/` — componentes por dominio: `comunes/`, `ui/`, `inicio/`,
     `panel/` (con subcarpetas `clientes/`, `presupuestos/`, `mensajes/`, `administradores/`,
     `estadisticas/`, `navegacion/`), `pdf/`.
   - `src/acciones/<dominio>/` — server actions por dominio: `clientes/`, `presupuestos/`,
     `mensajes/`, `administradores/`, `contacto/`, `sesion/`. Cada acción y su archivo de estado
     (`*-estado.ts`) van en la carpeta de su dominio. Los tipos compartidos por varios dominios
     van en `compartido/`.
   - `src/lib/` — lógica compartida e infraestructura (`utilidades/`, `datos-estructurados/`,
     configuración, validaciones, prisma, etc.).
   - `src/hooks/`, `src/contextos/`, `src/types/` — hooks, contextos y tipos globales.
3. **Archivo nuevo:** si no existe la carpeta de su dominio, se crea. Está prohibido crear un
   archivo de código en un lugar que no sea su carpeta de dominio.
4. **Regla del boy scout aplicada a la organización:** si durante una modificación se detecta un
   archivo suelto (fuera de su carpeta de dominio), se lo mueve a su carpeta y se actualizan sus
   imports en la misma tanda de cambios.
5. **Los imports usan el alias `@/`** (mapeado a `src/`). Nunca se usan imports relativos para
   cruzar dominios; los relativos solo se permiten dentro de una misma carpeta si es estrictamente
   necesario.

## Uso de subagentes (OBLIGATORIO)

1. **Desglose obligatorio:** toda tarea o fase que se pueda desglosar en sub-tareas debe
   ejecutarse mediante subagentes (`task` tool). Nunca ejecutar directamente trabajo que
   pueda paralelizarse o delegarse.
2. **Prompts detallados:** cada subagente debe recibir el prompt más detallado y con el mayor
   contexto posible: objetivo, alcance exacto, archivos involucrados, patrones del proyecto,
   y TODAS las reglas de comportamiento de este documento (idioma, arquitectura, capas,
   límites de líneas, una función por archivo, imports con `@/`, etc.).
3. **Paralelización:** lanzar varios subagentes en paralelo cuando las sub-tareas sean
   independientes entre sí (un solo mensaje con múltiples llamadas a `task`).
4. **Agente verificador global:** cuando una fase requiera muchos subagentes (3 o más) o
   toque código compartido entre ellos, tras completar los subagentes se debe lanzar un
   agente verificador (`verificador`) que revise TODO el código producido en la fase,
   detecte fallas, incoherencias, violaciones de las reglas de este documento y archivos
   fuera de límites, y las repare. El verificador es el último paso de la fase y su
   aprobación es requisito para dar la fase por terminada.
5. **Nunca delegar la coordinación:** la orquestación de subagentes, la definición de
   interfaces entre sub-tareas y la decisión final sobre resultados siempre las hace el
   agente principal, no los subagentes.

## Proyecto

App de reserva de turnos para barbería: Next.js 15 (App Router), TypeScript, Tailwind v4, Prisma 7 + MariaDB, Auth.js v5 (beta), Mercado Pago Checkout Pro.

## Reglas globales del proyecto

### Idioma

- Todo el código, comentarios, mensajes de UI y nombres de archivos/carpetas deben estar en **español**.
- Excepciones (solo cuando el requisito técnico o el uso universal lo exige):
  - APIs de librerías y del sistema: `useSession`, `signIn`, `PrismaClient`, `fetch`, `Request`, `onDelete`, `GoogleProvider`, etc.
  - Modelos de base de datos de next-auth: `user`, `account`, `user_role` (nombres exactos exigidos por el adaptador).
  - Nombres universales compartidos por ambos idiomas: `footer`, `header`, `hero`, `layout`, `page`, `route`, `middleware`, `proxy`, `server.js`, `next.config.ts`.
  - Paquetes npm y nombres exportados por librerías de terceros (lucide-react, radix-ui, etc.).
- Regla ESLint activa: `@typescript-eslint/no-explicit-any: error` — prohibido usar `any`.

## Reglas de construcción (PERMANENTES — no eliminar, no saltar)

Estas reglas se agregan a las anteriores y son de cumplimiento obligatorio para TODO código nuevo y
toda modificación. No pueden borrarse, atenuarse ni saltarse nunca.

1. **Máximo UNA función exportada por archivo de código.** Un archivo (ts/tsx/js/jsx) puede exportar
   una sola función, componente React o hook. Si se necesitan más, se crean archivos adicionales.
   - Excluidos: archivos de constantes, tipos e interfaces (no exportan funciones).
   - Los closures internos de un componente (event handlers, callbacks) no cuentan como funciones del
     archivo; si un helper deja de ser trivial, se mueve a su propio archivo.
2. **Tamaño máximo de archivo: 400 líneas (objetivo: 300).** Ningún archivo de código puede superar
   las 400 líneas. Si lo supera, debe desglosarse en archivos con responsabilidad única.
3. **Regla del boy scout:** cualquier archivo existente que se modifique y quede fuera de límites
   (varias funciones exportadas o más de 400 líneas) debe desglosarse en la misma tanda de cambios.
4. Los documentos `.md` (documentación, planificación) no están sujetos a los límites de líneas.

## Uso de subagentes (OBLIGATORIO)

1. **Desglose obligatorio:** toda tarea o fase que se pueda desglosar en sub-tareas debe
   ejecutarse mediante subagentes (`task` tool). Nunca ejecutar directamente trabajo que
   pueda paralelizarse o delegarse.
2. **Prompts detallados:** cada subagente debe recibir el prompt más detallado y con el mayor
   contexto posible: objetivo, alcance exacto, archivos involucrados, patrones del proyecto,
   y TODAS las reglas de comportamiento de este documento (idioma, arquitectura, capas,
   límites de líneas, una función por archivo, imports con `@/`, etc.).
3. **Paralelización:** lanzar varios subagentes en paralelo cuando las sub-tareas sean
   independientes entre sí (un solo mensaje con múltiples llamadas a `task`).
4. **Agente verificador global:** cuando una fase requiera muchos subagentes (3 o más) o
   toque código compartido entre ellos, tras completar los subagentes se debe lanzar un
   agente verificador (`verificador`) que revise TODO el código producido en la fase,
   detecte fallas, incoherencias, violaciones de las reglas de este documento y archivos
   fuera de límites, y las repare. El verificador es el último paso de la fase y su
   aprobación es requisito para dar la fase por terminada.
5. **Nunca delegar la coordinación:** la orquestación de subagentes, la definición de
   interfaces entre sub-tareas y la decisión final sobre resultados siempre las hace el
   agente principal, no los subagentes.

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

## Contraste de texto según color de marca (REGLAS DE SOLO LECTURA)

- Texto/íconos sobre fondo SÓLIDO `var(--page-primary)` o `var(--page-secondary)`: PROHIBIDO hardcodear `text-white`, `text-black`, `text-zinc-950`, `#ffffff`, `#fff` o `#000`. Usar `--page-primary-foreground` / `--page-secondary-foreground` (`text-[var(--page-primary-foreground)]` o `color: var(...)`).
- Si un wrapper ya aliasea `--primary`/`--secondary` a las vars de página, agregar también `--primary-foreground` → `var(--page-primary-foreground)` en el MISMO objeto style y usar `var(--primary-foreground)`.
- Texto/íconos de marca sobre fondos SÓLIDOS oscuros (negro, zinc-950/900, paleta dorada oscura como `#1C1812`, gradientes oscuros): usar `--page-primary-tinta` / `--page-secondary-tinta` (el script la aclara automáticamente si el color de marca es muy oscuro).
- NO aplicar `-tinta` sobre fondos translúcidos de marca (`--page-primary-15/20` y demás variantes alfa): los chips marca-sobre-marca-alfa son intencionales.
- Única fuente permitida para tomar decisiones de contraste: `src/lib/contraste.ts` (funciones en español: `esColorHexValido`, `calcularLuminanciaRelativa`, `calcularRazonDeContraste`, `elegirColorTexto`, `obtenerTintaLejible`, `mezclarConBlanco`). No crear utilidades paralelas.
- Nomenclatura: funciones, variables, constantes y archivos nuevos en español (excepto palabras reservadas del sistema/librerías y convenciones universales del stack como `id`, `className`, props de shadcn/radix, hooks `useXxx`). TypeScript estricto, sin `any`, `@ts-ignore` o `@ts-nocheck`.
- Verificación obligatoria tras cualquier cambio de color/contraste: `npx tsc --noEmit` (el build NO typechequea) en la raíz del proyecto.
- Si un color de marca nuevo se agrega al panel admin, debe pasar por la validación `/^#[0-9a-fA-F]{6}$/` (existe en `src/actions/configPage.ts` y en `GeneralConfigForm.tsx`).
