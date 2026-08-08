# PENDIENTES.md — Plan de ejecución: contraste automático de texto según color de marca

> **Documento directivo de SOLO LECTURA.** Todos los subagentes deben leerlo antes de trabajar.
> No editar este archivo durante la ejecución. El presente plan no se modifica una vez iniciado.

---

## 1. Objetivo

El administrador parametriza los colores de marca (`PageConfig.primaryColor` / `secondaryColor`)
desde `/admin/config` y se inyectan como CSS vars `--page-primary` / `--page-secondary` en el
`<html>` (`src/app/layout.tsx`, líneas 68-76). Hoy el texto sobre esos fondos está hardcodeado e
inconsistente (`text-white`/`#fff` en unos lugares, `text-black`/`text-zinc-950` en otros), por lo
que con colores oscuros el texto desaparece y con colores claros el blanco queda ilegible.

**Meta:** crear un script `src/lib/contraste.ts` que, según el color de fondo de marca, decida
automáticamente si las letras son oscuras o claras; exponer eso como variables CSS derivadas y
migrar todos los hotspots del front a esas variables.

## 2. Arquitectura objetivo

| Variable CSS (inyectadas en `layout.tsx`) | Para qué | Default en `:root` (globals.css) |
|---|---|---|
| `--page-primary-foreground` | texto/ícono SOBRE fondo sólido `var(--page-primary)` | `#09090b` |
| `--page-secondary-foreground` | ídem para `--page-secondary` | `#ffffff` |
| `--page-primary-tinta` | marca como TEXTO sobre fondos SÓLIDOS oscuros | `var(--page-primary)` |
| `--page-secondary-tinta` | ídem | `var(--page-secondary)` |

- `-foreground`: lo calcula `elegirColorTexto(colorDeFondo)` → `COLOR_TEXTO_OSCURO` (`#09090b`) o
  `COLOR_TEXTO_CLARO` (`#ffffff`), eligiendo el de mayor ratio de contraste WCAG (umbral 4.5).
  El default `#d97706` (ámbar, luminancia ≈ 0.27) da texto OSCURO → **cero cambio visual por defecto**.
- `-tinta`: la calcula `obtenerTintaLejible(color)`. Si la luminancia relativa es < `UMBRAL_TINTA`
  (0.18) la aclara mezclando con blanco por pasos de 5% hasta alcanzar `LUMINANCIA_OBJETIVO_TINTA`
  (0.4); si no, devuelve el color original (el default `#d97706` no se toca).

## 3. Reglas transversales (obligatorias para TODOS los subagentes)

1. **TS estricto puro**: `any`, `@ts-ignore`, `@ts-nocheck` PROHIBIDOS; preferir `unknown`, type guards,
   tipos de Prisma/Zod.
2. **Nomenclatura en español**: funciones, variables, constantes y nombres de archivos nuevos en
   español. EXCLUIDOS: palabras reservadas del lenguaje/librerías (`id`, `className`, props de
   shadcn/radix, `React`, hooks), tipos de Prisma, convenciones universales del stack
   (componentes en PascalCase, `useXxx` para hooks).
3. NO tocar los errores de types preexistentes documentados en AGENTS.md
   (`actions/admin.actions.ts`, `actions/calendario.actions.ts`, `prisma/seed.ts`,
   `EditServicioModal.tsx` useActionState). `npx tsc --noEmit` puede mostrarlos; no son nuestros.
4. NO hardcodear hex de acento en componentes. La paleta dorada oscura FIJA
   (`#E8B031`, `#E4E0D9`, `#2C261D`, `#8E8675`, `#1C1812`, `#14110C`, `#251f15`, `amber-*`) NO se toca.
5. Los chips marca-sobre-marca-alfa (`color: var(--page-primary)` sobre fondos `--page-primary-15/20`
   translúcidos) son INTENCIONALES y NO se modifican. La `-tinta` SOLO se aplica a texto de marca
   sobre fondos SÓLIDOS oscuros.
6. Verificación transversal: `npx tsc --noEmit` (obligatorio; el build NO typechequea) + `npm run build`
   solamente al cierre (Fase 4).
7. Cada subagente edita SOLO los archivos de su subfase. Ante un conflicto, avisar al coordinador
   de la fase, nunca editar archivo ajeno.

## 4. Organización por fases, subfases y subagentes

Dependencias: `FASE 0 → FASE 1 (principal) → FASE 2 → FASE 3 → FASE 4`.
Dentro de una misma fase, las subfases cuyos archivos NO se solapan pueden correr EN PARALELO.
Dentro de una subfase con varios subagentes, estos también deben repartirse archivos disjuntos.

---

### FASE 0 — Fundamento del sistema de contraste

#### Subfase 0.1 — Script `src/lib/contraste.ts`

**Subagentes: 2** — `0.1a` (escritor) y `0.1b` (revisor). `0.1b` NO puede empezar hasta que `0.1a` entregue.

**Qué necesita el subagente 0.1a (escritor):**
- Lee: `tsconfig.json` (strict mode), `src/lib/utils.ts` (estilo del repo), este documento §2 y §3.
- Crea `src/lib/contraste.ts` ÚNICAMENTE con lo siguiente (firmas exactas, en español, sin `any`):
  - Constantes: `COLOR_TEXTO_OSCURO = "#09090b"`, `COLOR_TEXTO_CLARO = "#ffffff"`,
    `UMBRAL_CONTRASTE_MINIMO = 4.5`, `UMBRAL_TINTA = 0.18`, `LUMINANCIA_OBJETIVO_TINTA = 0.4`.
  - `esColorHexValido(color: string): boolean` — regex `/^#[0-9a-fA-F]{6}$/`.
  - `calcularLuminanciaRelativa(color: string): number` — fórmula WCAG 1.4.3:
    canal lineal por canal `c/255 → c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`,
    `L = 0.2126*R + 0.7152*G + 0.0722*B`. Precondición: hex ya validado.
  - `calcularRazonDeContraste(primero: string, segundo: string): number` — `(Lmayor+0.05)/(Lmenor+0.05)`.
  - `elegirColorTexto(colorDeFondo: string): string` — compara el ratio del fondo contra
    `COLOR_TEXTO_OSCURO` y contra `COLOR_TEXTO_CLARO`; devuelve el de mayor ratio
    (cumple `UMBRAL_CONTRASTE_MINIMO` cuando es posible; si ambos fallan, gana el mayor igualmente).
  - `mezclarConBlanco(color: string, proporcionDeBlanco: number): string` — mezcla lineal
    canal a canal: `redondeado(canal + (255 - canal) * proporcionDeBlanco)` devuelto como `#rrggbb`
    en minúsculas.
  - `obtenerTintaLejible(color: string): string` — si `calcularLuminanciaRelativa(color) >= UMBRAL_TINTA`
    devuelve `color`; sino, llama a `mezclarConBlanco` con proporciones 0.05, 0.10, 0.15… hasta que
    la luminancia resultante >= `LUMINANCIA_OBJETIVO_TINTA` (o proporción = 1, nunca infinito).
- Entregable: archivo nuevo; correr `npx tsc --noEmit` y confirmar que NO introduce errores nuevos.
- NO instalar dependencias, NO crear tests (no hay framework de tests en el repo).

**Qué necesita el subagente 0.1b (revisor):**
- Lee el archivo que generó 0.1a y lo audita en 3 pases: (1) matemática WCAG correcta
  (verificar con ejemplos: `#ffffff` → L=1; `#000000` → L=0; `#d97706` → texto oscuro; `#78350f` →
  tinta aclarada), (2) TS estricto + español + ausencia de `any`/`@ts-ignore`, (3) coherencia de
  constantes con las firmas del párrafo anterior.
- Si encuentra defectos los corrige él mismo y lo reporta; si está OK lo certifica.
- Entregable: veredicto + `npx tsc --noEmit` sin errores nuevos.

#### Subfase 0.2 — Inyección de variables CSS

**Subagentes: 1** (`0.2`). Depende de 0.1 terminada (importa de `@/lib/contraste`).

**Qué necesita el subagente 0.2:**
- Lee `src/app/layout.tsx` (completo) y `src/app/globals.css` (al menos líneas 1-45 y el resto relevante).
- En `globals.css`, dentro de `:root`, INMEDIATAMENTE después de `--page-secondary: #78350f;` (línea 12)
  agregar con comentario en español:
  ```css
  /* Texto sobre fondo sólido de marca (decidido por src/lib/contraste.ts) */
  --page-primary-foreground: #09090b;
  --page-secondary-foreground: #ffffff;
  /* Marca legible como texto sobre fondos oscuros */
  --page-primary-tinta: var(--page-primary);
  --page-secondary-tinta: var(--page-secondary);
  ```
- En `layout.tsx`:
  - Importar `elegirColorTexto, obtenerTintaLejible` desde `@/lib/contraste`.
  - Antes del `<html>`, derivar: `const colorPrimario = config?.primaryColor ?? "#d97706";`
    y `const colorSecundario = config?.secondaryColor ?? "#78350f";` (constantes locales
    `PRIMARIO_POR_DEFECTO`/`SECUNDARIO_POR_DEFECTO` si se extraen; comentar que la fuente única
    de defaults es `globals.css`), y luego:
    `const textoPrimario = elegirColorTexto(colorPrimario);`,
    `const textoSecundario = elegirColorTexto(colorSecundario);`,
    `const tintaPrimaria = obtenerTintaLejible(colorPrimario);`,
    `const tintaSecundaria = obtenerTintaLejible(colorSecundario);`.
  - En el `style` del `<html>` (líneas 70-75) AGREGAR las 4 claves nuevas con esos valores,
    SIN borrar ni cambiar las 2 existentes.
- Entregable: 2 archivos editados + `npx tsc --noEmit` sin errores nuevos.

---

### FASE 1 — FASE PRINCIPAL: migración `-foreground` (texto sobre fondo sólido de marca)

> **Coordinador de fase: subagente `C1`.** Recibe el reporte de cada subagente A1-A5, revisa la
> coherencia global (el mismo patrón visual en cualquier módulo usa la misma variable), verifica que
> los wrappers con alias `--primary` tengan también `--primary-foreground`, ejecuta el grep final
> restrictivo y corre `npx tsc --noEmit` agregado. Entrega ACTA de integración de la fase.

| Subfase | Archivos (referencia):línea | Reemplazo exacto | Subagente |
|---|---|---|---|
| 1.1 Público núcleo | `Header.tsx:72,96,141` (`color:"#fff"`/`"#ffffff"`) · `ui/dialog.tsx:45` (`text-white`) · `TurnoManager.tsx:27` (`text-white`) · `CreateTurnoModal.tsx:259-260,530-531` (`text-white`) y `490-491` (`text-zinc-950`) · `TurnoList.tsx:278` (`text-white`) + wrappers de alias (CreateTurnoModal 253-254, TurnoList 159-160) | `text-[var(--page-primary-foreground)]` o `color: "var(--primary-foreground)"` (dentro de wrappers con alias; en esos agregar `"--primary-foreground": "var(--page-primary-foreground)"` al style del wrapper) | A1 |
| 1.2 Auth, pago y Hero | `Hero.tsx:104-105` (`text-zinc-950`) · `login/page.tsx:132` · `register/page.tsx:142` · `pago/success/page.tsx:79` · `pending/page.tsx:48` · `failure/page.tsx:42` · `status/page.tsx:175,193,204` (todos `text-zinc-950`) | `text-[var(--page-primary-foreground)]` | A2 |
| 1.3 Dashboard + núcleo admin | `dashboard/DashboardPanel.tsx:115,141,147,249` (`text-black`) · `admin/AdminSidebar.tsx:92` (`text-black`) · `admin/config/ContactForm.tsx:31` (`text-black`) | `text-[var(--page-primary-foreground)]` | A3 |
| 1.4 Módulos barbero, horarios y días laborales | `barbero/BarberoList.tsx:192-193` · `CreateBarberoForm.tsx:403-404` · `CreateBarberoModal.tsx:29-30` · `EditBarberoModal.tsx:159-160,394-395` · `horarios/horariosList.tsx:99-101,177-179` · `horarios/horariosForm.tsx:38-40` · `diaLaboral/diaLaboralList.tsx:189-193` (todos con `text-white` + bg marca) | `text-[var(--page-primary-foreground)]` | A4a (barbero) · A4b (horarios+diaLaboral) |
| 1.5 Módulos servicio y excepciones | `servicio/ServicioList.tsx:294-296,373-374,471-472` · `servicio/CreateServicioForm.tsx:112-113,354-355` · `servicio/EditServicioModal.tsx:154,344` · `excepcionesLaborales/ExcepcionesForm.tsx:22-24` (mezcla `text-white` y `text-black`/`#000`) | `text-[var(--page-primary-foreground)]` / `color: var(--page-primary-foreground)` (en chips seleccionados de ServicioList 373-374 el `color: "#000"` pasa a `var(--page-primary-foreground)`) | A5 |

**Qué necesita cada subagente A1-A5 (misma plantilla):**
- Leer este documento §3, AGENTS.md, y los archivos propios (con sus números de línea actuales;
  verificar antes de editar: los números pueden desplazarse).
- Hacer SOLOS los reemplazos de su fila; NUNCA cambiar fondos ni mucho menos la paleta FIJA;
  dejar los hover (`-primary-80`) tal cual.
- No olvidar el alias `--primary-foreground` junto a `--primary` en los wrappers de la tabla
  (CreateTurnoModal y TurnoList) para que `var(--primary-foreground)` resuelva.
- Comprobar que NO quede `text-white`/`black`/`zinc-950` sobre `var(--primary)`, `var(--page-primary)`
  dentro de sus archivos (grep local).
- Correr `npx tsc --noEmit` y confirmar 0 errores nuevos.
- Entregable: diff de archivos, línea de estado, evidencia de grep y tsc.

**Qué necesita el coordinador C1 (se ejecuta DESPUÉS de que A1-A5 entregaron):**
- Los reportes de A1-A5; recorre los archivos tocados verificando consistencia, mira los wrappers
  de alias, corre grep exhaustivo:
  `rg -n "text-white|text-black|text-zinc-950|color: \"#(fff|000)"` sobre archivos con `var(--page-primary)`/`var(--primary)` en bg
  y determina si cada hit restante es de fondo NO marca (y por tanto válido).
- Decide y corrige lo que falle; corre `npx tsc --noEmit`.
- ACTA de fase: estado por archivo + evidencia.

---

### FASE 2 — Migración `-tinta` (marca legible sobre fondos SÓLIDOS oscuros)

| Subfase | Archivos (líneas ref.) | Reemplazo | Subagente |
|---|---|---|---|
| 2.1 Público | `Header.tsx:46,49,108,134` · `Hero.tsx:58,83` · `ImageCarousel.tsx:31,70,82` · `LocationSection.tsx:59,62,82,85,96,99,110,113` | `color: "var(--page-primary-tinta)"` (para texto/icono de marca sobre fondo oscuro SÓLIDO) | B1 |
| 2.2 Turno y dashboard | `app/turno/page.tsx:49` (título) · `turno/Editar TurnoModal.tsx:232` (precio) · `turno/CreateTurnoModal.tsx:474` (importe) · `turno/TurnoList.tsx:314` (precio) · `dashboard/DashboardPanel.tsx` (labels/iconos de marca sobre paneles negros/zinc sólidos, p. ej. ~79,130,167,176,186,200,270; NO los de fondos alfa) | `var(--page-primary-tinta)` / `var(--page-secondary-tinta)` | B2 |

- Regla de oro para B1/B2: aplicar `-tinta` SOLO cuando el fondo del elemento sea un color oscuro
  SÓLIDO (negro, zinc-950/900, `#14110C`, `#1C1812`, etc.) — nunca sobre `--page-primary-XX` alfa
  (son chips intencionales) ni sobre fondos claros.
- Los títulos sobre fondo CLARO (`admin/config/page.tsx:14`, `admin/barbero/page.tsx:70`,
  `admin/excepcionesLaborales/page.tsx:48`) NO se tocan (conservan `var(--page-primary)`).

---

### FASE 3 — UX de admin: preview del contraste y validación de color

Subagentes: **2** (`F3A` y `F3B`), archivos distintos → paralelo.

**F3A — `src/components/admin/config/GeneralConfigForm.tsx`:**
- Lee el archivo completo (398 líneas).
- En `handleSubmit` (≈160): validar con `esColorHexValido` ambos colores antes de persistir; si
  falla → `setErrorMessage("Color inválido. Usá el formato #RRGGBB (ej.: #d97706).")` y abortar.
- En la sección "Diseño y Colores" (tras los inputs de color, ~L337): agregar una tarjeta de
  PREVIEW EN TIEMPO REAL: recuadro (p. ej. `h-20 rounded-lg border flex items-center justify-center`)
  con `style={{ backgroundColor: primaryColor }}`, dentro la letra "Aa" grande en
  `elegirColorTexto(primaryColor)` y debajo una etiqueta en CASTELLANO estilo "Texto oscuro sobre este
  fondo · contraste 6.1:1 (WCAG AA)" o "Texto claro…" según `elegirColorTexto` + `calcularRazonDeContraste`.
- Botón "Guardar Cambios" (`L385-395`, actual `text-white`): usar `elegirColorTexto(primaryColor)` como color.
- Agregar el `import { esColorHexValido, elegirColorTexto, calcularRazonDeContraste } from "@/lib/contraste"`.
- `npx tsc --noEmit` sin errores nuevos.

**F3B — `src/actions/configPage.ts`:**
- Lee la action completa (92 líneas) y `src/lib/zod.ts` para seguir el patrón Zod del repo.
- Agregar esquema de validación de color (coincidente con §3): regex `/^#[0-9a-fA-F]{6}$/`,
  mensaje español: "Formato de color inválido. Usá #RRGGBB (ej.: #d97706).".
- Aplicar en `updatePageConfig` solo cuando el campo venga definido; si falla → retornar
  `{ success: false, error: mensaje }` SIN persistir.
- Mantener la acción con tipo de retorno consistente con lo existente y ≤ 100 líneas (si precisa,
  extraer helper `validarColorOpcional(...)` en el mismo archivo).
- Entregable: diff + tsc.

---

### FASE 4 — Reglas de solo lectura y cierre QA

Subagentes: **F4A** y **F4B** (F4B es el último en ejecutarse de todo el proyecto).

**F4A — `AGENTS.md` (reglas de solo lectura):**
- Agrega al final una sección (sin borrar nada existente):
  > **Contraste de texto según color de marca (REGLAS DE SOLO LECTURA)**
  > - Texto/íconos sobre fondo SÓLIDO `var(--page-primary)`/`var(--page-secondary)`: PROHIBIDO
  >   hardcodear `text-white`, `text-black`, `text-zinc-950`, `#ffffff`, `#fff`, `#000`; usar
  >   `--page-primary-foreground` / `--page-secondary-foreground` (con alias `--primary-foreground`
  >   en wrappers que ya aliasean `--primary`).
  > - Texto de marca sobre fondos oscuros sólidos: usar `--page-primary-tinta` / `--page-secondary-tinta`.
  > - Clave contraste: única fuente permitida `src/lib/contraste.ts` (funciones en español).
  > - Nomenclatura: funciones/variables/constantes/archivos nuevos en español, excepto reservados
  >   del sistema, librerías y convencionalismo del stack.
  > - Verificación obligatoria: `npx tsc --noEmit` antes de finalizar cualquier cambio de color.
- Mantener el resto de AGENTS.md intacto.

**F4B — QA final (ejecuta DESPUÉS de todo):**
1. `npx tsc --noEmit`: solo deben quedar los errores preexistentes conocidos (§3) — corregir
   cualquier cosa GENERADA por este proyecto.
2. `npm run build` exitoso.
3. Smoke test manual (dos ciclos, si es posible contra dev):
   - `#1e3a8a` (azul oscuro): CTAs login/register/pago/Hero/dashboard/sidebar muestran texto claro.
   - `#f5d90a` (amarillo claro): Header, modales admin, X de dialogs, chips `TurnoManager` en texto oscuro.
   - Con defaults (`:root` sin tocar): misma apariencia que hoy (marca de no regresión).
   - `-tinta`: tras elegir `#000000` (negro), breadcrumbs/título público siguen legibles.
4. Acta final: checkboxes completadas + lista de archivos modificados + cualquier pendiente.

---

## 5. Inventario de subagentes (total 16)

| Fase | Subagentes | Rol |
|---|---|---|
| FASE 0 | 0.1a, 0.1b, 0.2 | escritor, revisor, inyector |
| FASE 1 (PRINCIPAL) | C1 (coordinador), A1, A2, A3, A4a, A4b, A5 | 1 coordinador + 6 implementadores |
| FASE 2 | B1, B2 | implementadores |
| FASE 3 | F3A, F3B | implementadores |
| FASE 4 | F4A, F4B | documentador, QA |

Orden de arranque: 0.1a → (0.1b ∥ 0.2) → A1-A5 (en paralelo) → C1 → (B1 ∥ B2) → (F3A ∥ F3B) → F4A → F4B.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Colisiones de archivos entre subagentes paralelos | Tablas por subfase con archivos disjuntos; el coordinador verifica antes de arrancar |
| Alias `--primary` local sin `--primary-foreground` | A1 agrega el alias en los wrappers (CreateTurnoModal, TurnoList) en el MISMO objeto style |
| Doble fuente de defaults CSS/TS | Constantes en `contraste.ts` con comentario cruzado; fuente real `:root` |
| Regresiones visuales con el default ámbar | Umbral de tinta 0.18; `elegirColorTexto(#d97706)` → oscuro (igual que hoy) |
| Errores preexistentes de tsc | §3: son conocidos; `npx tsc --noEmit` solo debe no AGREGAR errores |

## 7. Cierre

Al terminar F4B, el coordinador global (opencode) confirma contra el checklist del archivo y cierra.