# PENDIENTES.md — Plan directivo (SOLO LECTURA): ordenamiento por dominios — ciclo 2026-08 (duplicación + multi-función)

> **Documento directivo de SOLO LECTURA.** Todos los subagentes deben leerlo antes de trabajar.
> No editar este archivo durante la ejecución. El presente plan no se modifica una vez iniciado.
> Los números de línea citados fueron **verificados contra el repo el 11-ago-2026** y pueden
> desplazarse durante la ejecución: **verificar la línea exacta antes de editar** (ver §5.11).
>
> Este documento REPLICA el plan de un nuevo ciclo de auditoría (el anterior, Fases 0-8, se
> completó en 2026-08-11 y quedó documentado en `AUDITORIA.md` §10). El ciclo nuevo es el
> **ciclo de ordenamiento**: elimina el código duplicado restante y desglosa todos los archivos
> con más de una función exportada, respetando las reglas de arquitectura de `AGENTS.md`.

---

## 1. Objetivo

Ejecutar un ciclo completo de **ordenamiento** sobre la app de reserva de turnos de barbería,
surgido de una auditoría de arquitectura realizada el 11-ago-2026 (4 subagentes de exploración en
paralelo + verificación). El ciclo tiene **7 fases numeradas (9 a 15)** que cubren:

1. **Fase 9** — Centralizar constantes, tipos y helpers puros (base sin riesgo).
2. **Fase 10** — Crear capa de servicios de consultas Prisma (`lib/consultas/`) y centralizar
   autorización (`lib/seguridad/`).
3. **Fase 11** — Desglosar las 10 server actions multi-función a **una acción por archivo**.
4. **Fase 12** — Desglosar los `lib/` multi-función (`mercadopago.ts`, `contraste.ts`,
   `cloudinary-uploader.ts`, `email.ts`, `utils.ts`) y `app/layout.tsx`.
5. **Fase 13** — Desglosar las primitivas shadcn/ui (`dialog`, `carousel`, `button`, `badge`)
   y `use-toast.ts` (desglose estricto, decisión del usuario).
6. **Fase 14** — Crear componentes y hooks comunes para eliminar la duplicación de UI
   (modales, botones submit, empty states, retroalimentación toast, imagen, selectores).
7. **Fase 15** — QA global: verificación de "1 función exportada por archivo", límites de
   líneas, `npx tsc --noEmit` en 0, `npm run build` OK y smoke test.

**Meta global:** dejar la app con **0 archivos de código con más de una función exportada**
(salvo excepciones registradas: re-exports del framework y stores internos sin exports de
funciones), **0 patrones duplicados ≥ 3 copias**, `npx tsc --noEmit` en **0 errores** y
`npm run build` exitoso al cierre de las Fases 10, 11, 12, 13, 14 y 15.

**Estructura obligatoria de cada fase:** cada fase (9 a 15) termina con un subagente
**VERIFICADOR** (V9…V15) que revisa TODO el código producido en la fase, repara las violaciones
que encuentre y **certifica** la fase. Sin su aprobación la fase NO se da por terminada
(AGENTS.md §Uso de subagentes, punto 4).

---

## 2. Antecedentes y estado actual

### Stack del proyecto
- Next.js **15.5** App Router (el README está desactualizado; no guiarse por él), TypeScript strict,
  Tailwind v4, **Prisma 7 + MariaDB**, Auth.js v5 (beta), **Mercado Pago Checkout Pro**, Cloudinary
  (`src/lib/cloudinary-uploader.ts`), **Zod 4**, nodemailer (`src/lib/email.ts`).
- Prisma generado en `generated/prisma` (raíz); singleton `src/lib/prisma.ts` con
  `@prisma/adapter-mariadb`. MariaDB: host `127.0.0.1` (no `localhost`).
- Sin framework de tests: la validación es build + typecheck manual.

### Estado de partida (verificado el 11-ago-2026)
- **`npx tsc --noEmit` = 0 errores** (cierre del ciclo anterior, V8).
- **`npm run build` = OK** (26 rutas).
- Worktree limpio en git (commit `2213466`).
- Ya centralizado y CORRECTO (NO tocar, salvo los puntos indicados en el plan):
  `CLASES_BOTON_MARCA` / `ESTILO_FONDO_MARCA` / `CLASES_BOTON_CERRAR` / `TTL_LOCK_SLOT_MS`
  (`lib/constants.ts`), `formatearHora` (`lib/utils.ts`), `ActionState<TData>` (`types/action-state.ts`),
  `esquemaNombre` / `esquemaImagenOpcional` / `loginSchema` / `registerSchema` (`lib/zod.ts`),
  algoritmos de slots (`lib/disponibilidad.ts`), email (`lib/email.ts`), caché con tags
  (`lib/cache.ts`), `revalidarCacheTurno` (`lib/revalidar-turno.ts`), `getCachedData`,
  `requerirSesion`/`requerirAdmin` (`lib/seguridad.ts`), `getPageConfig` cacheado con tag
  (`actions/configuracion/configPage.ts`), `esColorHexValido`/`obtenerTintaLejible`
  (`lib/contraste.ts`).
- No hay `any`, `@ts-ignore` ni `@ts-nocheck` (ciclo anterior, Fase 8).

### Decisiones del usuario (registradas el 11-ago-2026, §4)
1. **Desglose estricto** también para las primitivas shadcn/ui (`ui/dialog.tsx`, `ui/carousel.tsx`,
   `ui/button.tsx`, `ui/badge.tsx`), `use-toast.ts` y `app/layout.tsx`.
2. **Desglosar igualmente** `lib/contraste.ts` y `lib/seguridad.ts`, aunque AGENTS.md los cita
   como fuente única (se conserva la propiedad moviéndolos a carpetas de dominio
   `lib/contraste/` y `lib/seguridad/` con un archivo por función).
3. **NO** incluir en este ciclo el desglose por tamaño de los 9 componentes con UNA sola función
   que superan las 200 líneas (quedan como pendiente futuro; la Fase 14 los reduce de paso).

---

## 3. Hallazgos de la auditoría (11-ago-2026)

### 3.1 Archivos con más de una función exportada (violan AGENTS.md §"Máximo UNA función exportada por archivo")

#### A. Doble violación: multi-función + fuera de límite de líneas de su capa — CRÍTICO

| # | Ruta | Funciones exportadas | Líneas | Límite capa |
|---|---|---|---|---|
| 1 | `src/actions/servicios/servicio-actions.ts` | `getServicios`, `getServiciosCarrusel`, `createServicio`, `actualizarServicio`, `deleteservicio` | 397 | actions 100 |
| 2 | `src/lib/mercadopago.ts` | `validarConfiguracionOAuthMP`, `construirUrlAutorizacionMP`, `intercambiarCodigoPorToken`, `obtenerConfiguracionMP`, `estaBloqueadaMP`, `guardarConfiguracionMP`, `conectarCuentaMP`, `refrescarTokenMP`, `eliminarConfiguracionMP`, `obtenerClienteMP` | 307 | lib 80 |
| 3 | `src/actions/horarios/margenesHorario.actions.ts` | `createMargenLaboral`, `updateMargenLaboral`, `deleteMargenLaboral`, `getMargenesLaborales`, `getHorariosCompactos` | 367 | actions 100 |
| 4 | `src/actions/mercadopago/mercadopago-actions.ts` | `crearPreferenciaPago`, `confirmarPagoTurno`, `verificarEstadoPago` | 296 | actions 100 |
| 5 | `src/actions/horarios/diaLaboral.actions.ts` | `create`, `update`, `deleteDiaLaboral`, `getDiasLaborales`, `getDiaLaboralById` | 251 | actions 100 |
| 6 | `src/actions/sesion/user-dashboard.ts` | `updateProfile`, `getUserTurnos`, `cancelTurno` | 137 | actions 100 |
| 7 | `src/lib/contraste.ts` | `esColorHexValido`, `calcularLuminanciaRelativa`, `calcularRazonDeContraste`, `elegirColorTexto`, `mezclarConBlanco`, `obtenerTintaLejible` | 119 | lib 80 |
| 8 | `src/actions/configuracion/configPage.ts` | `updateWhatsappConfig`, `updatePageConfig`, `getPageConfig` | 115 | actions 100 |
| 9 | `src/lib/cloudinary-uploader.ts` | `uploadToCloudinary`, `uploadMultipleToCloudinary` | 111 | lib 80 |

#### B. Multi-función dentro del límite de líneas — ALTO

| # | Ruta | Funciones exportadas | Líneas | Límite capa |
|---|---|---|---|---|
| 10 | `src/hooks/use-toast.ts` | `reducer` (const interna), `useToast`, `toast` (vía `export {}`) | 151 | hooks 150 |
| 11 | `src/actions/sesion/auth-actions.ts` | `handleSignOut`, `loginAction`, `registerAction`, `googleLoginAction` | 98 | actions 100 |
| 12 | `src/actions/excepciones/excepcionesLaborales.actions.ts` | `createExcepcion`, `softDeleteExcepcion` | 99 | actions 100 |
| 13 | `src/actions/mercadopago/mercadopago-oauth.actions.ts` | `obtenerEstadoConexionMP`, `obtenerEstadoConfiguracionOAuth`, `desconectarMP` | 82 | actions 100 |
| 14 | `src/actions/mercadopago/upload-images.actions.ts` | `uploadConfigImage`, `uploadBarberImages` | 82 | actions 100 |
| 15 | `src/lib/email.ts` | `enviarEmailTurno`, `sendTurnoEmail` | 67 | lib 80 |
| 16 | `src/lib/seguridad.ts` | `requerirSesion`, `requerirAdmin` | 59 | lib 80 |
| 17 | `src/lib/utils.ts` | `cn`, `serializeData`, `formatearHora` | 24 | lib 80 |
| 18 | `src/app/layout.tsx` | `generateMetadata`, `RootLayout` (default) | 102 | global 400 |

#### C. Primitivas shadcn/ui y framework (desglose estricto decidido por el usuario)

| # | Ruta | Exports | Líneas | Nota |
|---|---|---|---|---|
| 19 | `src/components/ui/dialog.tsx` | `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogClose`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | 96 | 4 son alias de primitivas Radix, 6 locales |
| 20 | `src/components/ui/carousel.tsx` | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` | 224 | además supera componentes 200 |
| 21 | `src/components/ui/button.tsx` | `Button`, `buttonVariants` (cva) | 55 | — |
| 22 | `src/components/ui/badge.tsx` | `Badge`, `badgeVariants` (cva) | 29 | — |

> Rutas API (`src/app/api/**/route.ts`) con varios handlers por verbo HTTP (`slot-locks` GET/POST/DELETE/PATCH,
> `webhook` POST/GET) siguen la convención de Next.js de `route.ts`; **no se desglosan** (patrón de framework).
> `src/auth.ts` (destructuring de `NextAuth`) y `src/middleware.ts` (`export default auth` + `export const config`)
> son archivos propios del framework permitidos en raíz; **no se tocan**.

### 3.2 Código duplicado consolidado (prioridad alta = ≥3 copias)

| Patrón duplicado | Copias | Ubicaciones (archivo:línea verificadas) | Centralizar en |
|---|---|---|---|
| Literal de zona horaria `"America/Argentina/Buenos_Aires"` | 12 (9 const + 3 inline) | `lib/disponibilidad.ts:6`, `lib/contexto-reserva.ts:6`, `lib/email.ts:7`, `actions/turnos/crear.actions.ts:15`, `actions/turnos/estado.actions.ts:16`, `actions/turnos/eliminar.actions.ts:11`, `actions/excepciones/excepcionesLaborales.actions.ts:8`, `api/slot-locks/route.ts:9`, `components/pago/RedireccionWhatsApp.tsx:7`; inline en `mercadopago-actions.ts:75`, `MercadoPagoConnectionPanel.tsx:284`, `test-mp/InfoTurno.tsx:40` | `ZONA_HORARIA` en `lib/constants.ts` |
| Literales de estado de turno `"PENDIENTE"/"CONFIRMADO"/"COMPLETADO"/"CANCELADO"` | ~18 | `crear.actions.ts:74`, `confirmar.actions.ts:14`, `completar.actions.ts:22`, `user-dashboard.ts:121`, `mercadopago-actions.ts:224`, `webhook/route.ts:157,184,195`, `cron/expirar-turnos/route.ts:54,86`, `admin/page.tsx:71,88,125,150`, `lib/contexto-reserva.ts:29`, `lib/disponibilidad.ts:21`, `EditarTurnoModal.tsx:28`, `TurnoList.tsx:19` | `ESTADOS_TURNO` + `ESTADOS_TURNO_ACTIVOS` en `lib/constants.ts` |
| `estado: { in: ["PENDIENTE","CONFIRMADO"] }` | 4 | `lib/contexto-reserva.ts:29`, `admin/page.tsx:71,88,125` | `ESTADOS_TURNO_ACTIVOS` en `lib/constants.ts` |
| Mapas/arrays de días de la semana (acentos inconsistentes) | 7 | canónico `lib/constants.ts:3,13`; `margenesHorario.actions.ts:264,289`, `barbero/BarberoList.tsx:38`, `barbero/SelectorHorarios.tsx:6`, `diaLaboral/diaLaboralClient.tsx:34`, `diaLaboral/diaLaboralList.tsx:34`, `turno/GrillaCalendario.tsx:19` | `DIAS_SEMANA` + `ORDEN_DIAS` en `lib/constants.ts` (regla de acentos §6.9.1) |
| `prisma.barbero.findMany({ where: { estado: true } ... })` | 7 | `actions/barberos/listar.actions.ts:9`, `api/configuracion-turno/route.ts:27`, `turno/page.tsx:12`, `admin/page.tsx:79,119,142`, `admin/barbero/page.tsx:23` | `obtenerBarberosActivos()` en `lib/consultas/barberos.ts` |
| `prisma.servicio.findMany({ where: { estado: true } ... })` | 6 | `servicio-actions.ts:44,103`, `api/configuracion-turno/route.ts:13`, `turno/page.tsx:11`, `admin/barbero/page.tsx:8`, `admin/page.tsx:102` | `obtenerServiciosActivos()` en `lib/consultas/servicios.ts` |
| Check de rol manual `session.user.role === "ADMIN"` | 7 | `turnos/crear.actions.ts:24`, `turnos/listar.actions.ts:12`, `mercadopago-actions.ts:45,174,277`, `user-dashboard.ts:30,70,114` | `esAdmin(sesion)` en `lib/seguridad/` |
| Autorización "dueño del turno o admin" | 6 | `mercadopago-actions.ts:46-47,175-176,278-279`, `user-dashboard.ts:31-32,71,115-116` | `requerirPropietarioOAdmin(userId)` en `lib/seguridad/` |
| `const session = await auth()` + check manual (sin `requerirSesion()`) | 5 (actions) + 4 (páginas) | `turnos/crear.actions.ts:22`, `turnos/listar.actions.ts:9`, `mercadopago-actions.ts:41,153,256`, `turno/page.tsx:29`, `dashboard/page.tsx:7`, `pago/success/page.tsx:23`, `pago/status/page.tsx:18` | `requerirSesion()` de `lib/seguridad/` |
| Boilerplate 2 líneas `requerirAdmin()` | 26 | `completar.actions.ts:17-18`, `servicio-actions.ts:148-149,235-236,349-350`, `confirmar.actions.ts:9-10`, `diaLaboral.actions.ts:25-26,75-76,134-135`, `margenesHorario.actions.ts:62-63,140-141,227-228`, `mercadopago-oauth.actions.ts:68-69`, `upload-images.actions.ts:16-17,53-54`, `configPage.ts:27-28,47-48`, `asignar-servicio.actions.ts:13-14`, `asignar-horario.actions.ts:13-14`, `excepcionesLaborales.actions.ts:18-19`, `barberos/crear.actions.ts:11-12`, `barberos/eliminar.actions.ts:18-19`, `turnos/estado.actions.ts:25-26`, `barberos/editar.actions.ts:16-17`, `barberos/remover-horario.actions.ts:13-14`, `barberos/remover-servicio.actions.ts:13-14` | wrapper `exigirAdmin(fn)` en `lib/seguridad/` |
| Select de usuario `user: { select: { id, name, email, telefono } }` | 7 | `lib/turno-con-detalle.ts:9`, `turnos/crear.actions.ts:77`, `turnos/eliminar.actions.ts:24`, `turnos/listar.actions.ts:39`, `user-dashboard.ts:79,123`, `types/turno.ts:45` | `SELECCION_USUARIO_BASICA` en `lib/constants.ts` |
| Include "turno con detalle" (user+barbero+servicio) | 4 | `turnos/crear.actions.ts:77-78`, `turnos/eliminar.actions.ts:24-27`, `user-dashboard.ts:79,122-127` (el helper `turno-con-detalle.ts:9-11` usa el MISMO include) | `obtenerTurnoConDetalle(id)` en `lib/consultas/turnos.ts` |
| `prisma.pageConfig.findUnique({ where: { id: 1 } })` | 4 | `app/page.tsx:5`, `app/turno/page.tsx:15`, `app/admin/config/page.tsx:6`, `configPage.ts:102-104` | reusar `getPageConfig()` cacheado de `configPage.ts` |
| Bloque de 4 queries de la página `/turno` (Promise.all) | 2 bloques grandes | `api/configuracion-turno/route.ts:12-56`, `app/turno/page.tsx:10-16` | `obtenerDatosReserva()` en `lib/consultas/agenda.ts` |
| Fecha sola `toZonedTime(...).toISOString().split("T")[0]` | 4-5 | `turnos/crear.actions.ts:44`, `turnos/estado.actions.ts:51,63`, `turnos/eliminar.actions.ts:34`, `lib/contexto-reserva.ts:14` | `obtenerFechaSola(fecha)` en `lib/utils.ts` |
| Rango del día `fromZonedTime(\`${fecha}T00:00:00\`)` … `T23:59:59` | 3 | `api/slot-locks/route.ts:34-35`, `lib/disponibilidad.ts:15-16,35-36`, `lib/contexto-reserva.ts:15-16` | `obtenerRangoDelDia(fecha)` en `lib/utils.ts` |
| Anticipación mínima `10 * 60 * 1000` | 3 | `turnos/crear.actions.ts:36`, `turnos/estado.actions.ts:45`, `lib/disponibilidad.ts:60` | `MINIMO_ANTICIPACION_MS` en `lib/constants.ts` |
| `Intl.DateTimeFormat("es-AR", { timeZone })` | 3-4 | `lib/email.ts:31-32`, `RedireccionWhatsApp.tsx:35-50`, `mercadopago-actions.ts:74-81`, `usePagoTurno.ts:26` | `formatearFecha` / `formatearFechaHora` en `lib/utils.ts` |
| Precio `toLocaleString("es-AR")` ($) | ~6 | `ModalPagoTurno.tsx:56,66,92`, `test-mp/InfoTurno.tsx:50,54`, `test-mp/ListaTurnos.tsx:53` | `formatearMoneda(n)` en `lib/utils.ts` |
| Botón submit con estado pending/loading | 9 | variante `useFormStatus`: `turno/SubmitButton.tsx:6-18`, `horariosForm.tsx:32-58`, `ExcepcionesForm.tsx:15-31`, `EditarTurnoModal.tsx:326-345`, `auth/google-button.tsx:13-49`; variante prop: `barbero/BotonSubmitBarbero.tsx:14-33`, `servicio/BotonCrearServicio.tsx:6-20`, `admin/config/BotonGuardar.tsx:11-30`, `EditServicioModal.tsx:333-347` | `ui/boton-submit.tsx` (2 variantes) |
| Contenedor de modal `fixed inset-0 bg-black/xx` + header + X | 8 | `EditBarberoModal.tsx:120`, `CreateTurnoModal.tsx:74`, `ModalPagoTurno.tsx:22`, `CreateServicioForm.tsx:70`, `EditServicioModal.tsx:113`, `TermsModal.tsx:31`, `PrivacyModal.tsx:40`, `CookieModal.tsx:25` | `ui/ModalBase.tsx` |
| Empty state de listas (icono + "No hay ...") | 8 | `BarberoList.tsx:58-68`, `TurnoList.tsx:143-152`, `ExcepcionesList.tsx:69-78`, `horariosList.tsx:111-122`, `ServicioTabla.tsx:39-58`, `diaLaboralList.tsx:67-82`, `ListaHorarios.tsx:54-61`, `test-mp/ListaTurnos.tsx:25-29` | `ui/EmptyState.tsx` |
| Toast success/error + `router.refresh()`/reload tras Server Action | 9 | `CreateBarberoForm.tsx:118-141`, `EditBarberoModal.tsx:96-115`, `CreateServicioForm.tsx:53-67`, `EditServicioModal.tsx:71-81`, `ExcepcionesForm.tsx:46-63`, `horariosForm.tsx:72-89`, `TurnoList.tsx:82-121`, `ServicioList.tsx:41-78`, `diaLaboralClient.tsx:90-115` | hook `useRetroalimentacionAccion({ onExito })` |
| Campo imagen preview + botón quitar + dropzone | 3 | `barbero/SelectorImagenBarbero.tsx:26-73`, `servicio/SeccionImagenServicio.tsx:28-79`, `servicio/EditServicioModal.tsx:206-243` (inline) | usar `SeccionImagenServicio` común |
| Lógica de archivo imagen (`file.type.startsWith("image/")` + createObjectURL + revokeObjectURL) | 4 | `hooks/useImagenServicio.ts:11-35`, `CreateBarberoForm.tsx:62-79`, `EditBarberoModal.tsx:47-78`, `EditServicioModal.tsx:83-110` | migrar a `useImagenServicio` + `esImagenValida()` en `lib/validar-imagen.ts` |
| `initialState` de `ActionState` | 6 | `CreateServicioForm.tsx:17-22`, `EditServicioModal.tsx:18-23`, `horariosForm.tsx:28-30`, `ExcepcionesForm.tsx:10-13`, `EditarTurnoModal.tsx:58-61`, `hooks/useCrearTurno.ts:14-18` | `ActionStateInicial` + `ActionStateInicialSimple` en `types/action-state.ts` |
| Tipo `Barbero` redefinido a mano | 5 | `barbero/BarberoList.tsx:23`, `servicio/CreateServicioForm.tsx:24`, `excepciones/ExcepcionesClient.tsx:20`, `excepciones/ExcepcionesForm.tsx:33`, `turno/EditarTurnoModal.tsx:53` | `src/types/barbero.ts` / `src/types/servicio.ts` |
| Tipo `Turno` redefinido a mano | 3 | `turno/TurnoList.tsx:14`, `turno/EditarTurnoModal.tsx:23`, `test-mp/tipos.ts:3` | `src/types/turno.ts` (`TurnoConDetalle`) / Prisma `GetPayload` |
| Shape de `page_config` | 3 | `configPage.ts:12` (`PageConfigData`), `admin/config/tipos.ts:14` (`DatosConfiguracion`), `GeneralConfigForm.tsx:16` (inline) | `src/types/page-config.ts` único |
| Bloque de confirmación de pago MP (payment.get + approved + monto ≥ seña + update CONFIRMADO) | 2 (divergente) | `mercadopago-actions.ts:200-241` (`confirmarPagoTurno`) vs `webhook/route.ts:138-166` (caso approved) | `confirmarTurnoPorPago(...)` único en `lib/mercadopago/` |
| Bloque de revalidación `revalidarCacheTurno` + tags mes/usuario | 3 | `turnos/crear.actions.ts:82-84`, `turnos/estado.actions.ts:64-67`, `turnos/eliminar.actions.ts:35-37` | ampliar `revalidarCacheTurno` en `lib/revalidar-turno.ts` |
| `revalidatePath` por dominio | 7+3+6 | `/barbero` (7), `/servicio` (3), `/diaLaboral` (3+3) | helpers `revalidarBarberos()` / `revalidarServicios()` / `revalidarDiasLaborales()` en `lib/revalidar-turno.ts` |
| `prisma.margen_laboral.findMany({ where: { diaId } })` | 3 | `margenesHorario.actions.ts:84,170,252` | `obtenerMargenesDeDia(diaId)` en `lib/consultas/horarios.ts` |
| Envío de email fire-and-forget `.catch(console.error)` | 5 | `turnos/crear.actions.ts:86`, `turnos/estado.actions.ts:68,85`, `turnos/eliminar.actions.ts:39`, `user-dashboard.ts:129` | wrapper `enviarEmailTurnoSeguro(...)` en `lib/email/` |
| `DIAS_NOMBRES`/`ORDEN_DIAS` de `margenesHorario` vs `constants.ts` | 2 | `margenesHorario.actions.ts:264-272,289-297` vs `lib/constants.ts:3-21` | reusar `constants.ts` (§6.9.1) |
| Regex hex `/^#[0-9a-fA-F]{6}$/` | 2 | `configPage.ts:11` (`esquemaColor`) vs `lib/contraste.ts:24` (`esColorHexValido`) | `configPage.ts` importa `esColorHexValido` de `lib/contraste/` |
| Regex nombre `/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/` | 2-3 | `lib/barbero-zod.ts:20`, `CreateBarberoForm.tsx:42`, `lib/excepcion-zod.ts:9` | exportar la regex desde `lib/barbero-zod.ts` |
| `JSON.parse(JSON.stringify(...))` | 2 | `app/admin/servicio/page.tsx:12,15` | usar `serializeData` de `lib/utils.ts` (ya existe, sin uso) |
| `fetch("/api/configuracion-turno")` con loading/error | 2 | `hooks/useDatosFormularioTurno.ts:43-59`, `EditarTurnoModal.tsx:89-116` | hook `useConfiguracionTurno()` |
| `crypto.randomUUID()` para `sessionId` | 2 | `hooks/useCrearTurno.ts:39`, `EditarTurnoModal.tsx:76` | hook `useSessionId()` |
| Campo input label+icono+unidad+error | 2 | `servicio/CampoFormulario.tsx:11-49` vs `EditServicioModal.tsx:357-392` (InputField local) | unificar en `CampoFormulario` |
| Selector checkboxes colapsable con Chevron | 2 | `barbero/SelectorServicios.tsx:21-80`, `barbero/SelectorHorarios.tsx:31-100` | `ui/SelectorCheckboxColapsable.tsx` |
| Tipos `MargenLaboral`/`DiaLaboral`/`Servicio`/`Excepcion`/unión estados | 2 c/u | `diaLaboralList.tsx:9,19`, `horariosList.tsx:15`, `EditServicioModal.tsx:26`, `EditarTurnoModal.tsx:45`, `ExcepcionesClient.tsx:6`, `ExcepcionesList.tsx:11`, `EditarTurnoModal.tsx:28`, `TurnoList.tsx:19` | `src/types/*` + `z.infer` (§6.9.3) |

### 3.3 Hallazgos transversales (corregir en su fase)

- **Contrato de respuesta inconsistente:** `user-dashboard.ts:8-12` define `State { success; message }`
  mientras el resto del repo usa `ActionState` con `error`. Unificar a `ActionState` (Fase 11.4).
- **`user-dashboard.ts:114`** hace `sesion.user.role === "ADMIN" || (await requerirAdmin())` —
  redundante; `requerirAdmin()` ya cubre ambos (Fase 10.2).
- **Bloque de subida de imagen de servicio** duplicado ×2 dentro del mismo
  `servicio-actions.ts:172-194` y `:281-303` (Fase 11.1 → mover a `lib/cloudinary-uploader/` o
  `lib/validar-imagen.ts`).
- **Acentos de días de la semana:** el enum Prisma `dias_laborales` usa `Miercoles`/`Sabado` SIN
  acento (`prisma/schema.prisma:238-246`). Las constantes DB-facing DEBEN quedar sin acento; solo
  las de display usan acento. Hoy mezcladas (`DIAS_NOMBRES` usa acento vs `constants.ts` sin) —
  fuente latente de bugs (Fase 9.1, regla crítica §6.9.1).
- **`editServicioModal` supera 200 líneas (393)** y `EditarTurnoModal` (386), `TurnoList` (380),
  `MercadoPagoConnectionPanel` (376), `DashboardPanel` (291), `horariosList` (227),
  `carousel` (224), `BarberoList` (221), `diaLaboralList` (209). **NO se desglosan en este ciclo**
  (decisión del usuario §4.3) pero la Fase 14 reduce su tamaño al centralizar patrones; si al
  tocarlos quedan **>400 líneas o multi-función**, la regla del boy scout obliga a desglosarlos en
  la misma tanda.

---

## 4. Decisiones del usuario (registradas, no reversibles sin confirmación)

1. **Desglose estricto de primitivas shadcn/ui, `use-toast.ts` y `app/layout.tsx`** (§2.1).
2. **Desglosar igualmente `lib/contraste.ts` y `lib/seguridad.ts`** manteniendo la "fuente única"
   como carpeta de dominio (§2.2).
3. **NO incluir el desglose por tamaño** de los 9 componentes >200 líneas con una sola función
   (§2.3).
4. El presente `PENDIENTES.md` REPLICA el plan anterior (Fases 0-8, ya ejecutado y cerrado en
   `AUDITORIA.md` §10). Los subagentes no deben re-ejecutar ni revertir lo del ciclo anterior.

---

## 5. Reglas transversales (obligatorias para TODOS los subagentes)

1. **TS estricto puro**: `any`, `@ts-ignore`, `@ts-nocheck` PROHIBIDOS; preferir `unknown`, type
   guards, tipos de Prisma (`generated/prisma`) y `z.infer` (los schemas Zod existen en
   `src/lib/zod.ts`, `servicios-zod.ts`, `barbero-zod.ts`, `excepcion-zod.ts`).
2. **Nomenclatura en español**: código, comentarios, mensajes de UI y nombres de archivos/carpetas
   nuevos en español. EXCLUIDOS: APIs de librerías/sistema y convenciones universales del stack
   (`id`, `className`, props de shadcn/radix, hooks `useXxx`, modelos requeridos por el adaptador
   de next-auth, verbos HTTP `GET/POST/...` en `route.ts`).
3. **Reglas de construcción de AGENTS.md**: máximo UNA función exportada por archivo (excluidos
   constantes, tipos e interfaces). Límites por capa: **acciones 100**, **services/lib 80**,
   **componentes 200**, **hooks 150**, archivo global **400** (objetivo 300). Regla del boy scout:
   si un archivo tocado queda con varias funciones exportadas o >400 líneas, se desglosa en la
   MISMA tanda de cambios.
4. **Imports con alias `@/`**: para cruzar dominios SIEMPRE `@/`; relativos solo dentro de una
   misma carpeta si es estrictamente necesario. En cualquier MOVIMIENTO/desglose de archivos,
   actualizar TODOS los imports en la misma tanda de cambios.
5. **Organización por carpetas**: todo archivo de código vive en una carpeta de dominio. Al crear
   carpetas nuevas (`lib/consultas/`, `lib/seguridad/`, `lib/contraste/`, `lib/mercadopago/`,
   `lib/email/`, `ui/dialog/`, `ui/carousel/`, `ui/button/`, `ui/badge/`) usar nombres
   descriptivos en español; no crear carpetas si ya existe una apropiada.
6. **Gates obligatorios**:
   - `npx tsc --noEmit` en CADA subfase (el build NO typechequea) — objetivo **0 errores**
     (baseline actual 0).
   - `npm run build` al cierre de **Fase 10, 11, 12, 13, 14 y 15**.
7. **Cada fase cierra con su VERIFICADOR (V9…V15)**: revisa TODO el código de la fase (no solo sus
   archivos), busca violaciones de estas reglas, las repara él mismo y certifica. Es el último paso
   de la fase; es requisito para cerrarla.
8. Cada subagente edita SOLO los archivos de su subfase (tablas §6). Ante un conflicto avisar al
   coordinador/verificador de la fase, NUNCA editar archivo ajeno.
9. **No instalar dependencias nuevas** sin justificación (primero revisar si ya existe solución en
   el repo / React / Next). No crear tests (no hay framework).
10. **Seguridad en código**: no exponer secretos ni datos sensibles al cliente; errores internos
    devueltos al cliente como mensajes genéricos; los detalles se loguean en el servidor con
    `console.error` sanitizado.
11. **Referencias `archivo:línea`**: son aproximadas (verificadas el 11-ago-2026). Antes de cada
    edición, localizar la línea real (los números se desplazan entre tandas).
12. **Sistema de color**: NO hardcodear hex de marca; usar `var(--page-primary*)`/`-tinta`/
    `-foreground` y las constantes `CLASES_BOTON_MARCA`/`ESTILO_FONDO_MARCA`. Verificar con
    `npx tsc --noEmit` tras cualquier cambio de color/contraste.
13. **Fases 9 a 14 no cambian comportamiento**: son desgloses y centralizaciones. Preservar
    exactamente el comportamiento actual (mensajes de error, revalidaciones, estados de turno,
    envío de emails).

---

## 6. Organización por fases, subfases y subagentes

Dependencias: `FASE 9 → FASE 10 → FASE 11 → FASE 12`; `FASE 13` y `FASE 14` pueden arrancar al
cierre de la Fase 9 (no dependen de 10-12, solo de constantes/tipos base). `FASE 15` al final.
Dentro de una misma fase, las subfases cuyos archivos NO se solapan pueden correr **EN PARALELO**.
Dentro de una subfase con varios subagentes, repartirse archivos disjuntos (nunca dos subagentes
sobre el mismo archivo en paralelo). Cada fase se cierra con su verificador (V9…V15), que corre
DESPUÉS de que todas sus subfases entregaron.

---

### FASE 9 — Constantes, tipos y helpers puros (base sin riesgo de comportamiento)

> Coordinador: agente principal. Cierra con **V9**. No cambia lógica; solo centraliza y reemplaza usos.

| Subfase | Alcance | Archivos (líneas verificadas) | Subagente |
|---|---|---|---|
| 9.1 Constantes | Exportar en `src/lib/constants.ts`: `ZONA_HORARIA`, `ESTADOS_TURNO`, `ESTADOS_TURNO_ACTIVOS`, `MINIMO_ANTICIPACION_MS`, `DIAS_SEMANA` + `ORDEN_DIAS`, `SELECCION_USUARIO_BASICA`; reemplazar TODOS los usos de §3.2 | `lib/constants.ts` + ~30 archivos de §3.2 (12 zona horaria, ~18 estados, 4 activos, 3 anticipación, 7 días, 7 selects) | 9.1 |
| 9.2 Helpers utils e imagen | En `src/lib/utils.ts`: `formatearMoneda`, `formatearFecha`, `formatearFechaHora`, `obtenerFechaSola`, `obtenerRangoDelDia`; en `src/lib/validar-imagen.ts`: `esImagenValida(file)` (cliente); habilitar `serializeData` en los 2 usos manuales | `lib/utils.ts`, `lib/validar-imagen.ts`, `ModalPagoTurno`, `test-mp/InfoTurno`, `test-mp/ListaTurnos`, `usePagoTurno`, `RedireccionWhatsApp`, `TurnoList`, `ExcepcionesList`, `Email`, `mercadopago-actions`, `crear/estado/eliminar.actions`, `contexto-reserva`, `slot-locks/route`, `disponibilidad`, `admin/servicio/page` | 9.2 |
| 9.3 Tipos unificados | `types/action-state.ts`: exportar `ActionStateInicial`/`ActionStateInicialSimple`. Crear `src/types/excepcion.ts`, `src/types/page-config.ts`; reusar `Barbero`, `Turno`, `Servicio`, `MargenLaboral`, `DiaLaboral`, unión de estados desde `src/types/*` o `generated/prisma`; usar `z.infer` donde exista schema | `types/action-state.ts`, `types/barbero.ts`, `types/turno.ts`, `types/servicio.ts`, `types/horarios.ts`, `types/excepcion.ts` (nuevo), `types/page-config.ts` (nuevo), `EditServicioModal`, `CreateServicioForm`, `EditarTurnoModal`, `TurnoList`, `BarberoList`, `ExcepcionesClient/Form/List`, `diaLaboralList/Client`, `horariosList`, `test-mp/tipos.ts`, `configPage.ts`, `admin/config/tipos.ts`, `GeneralConfigForm` | 9.3 |

**Qué necesita cada subagente 9.x:**
- Leer este documento (§5 y §6), AGENTS.md y los archivos de su fila (verificar líneas reales).
- **9.1 regla crítica de acentos:** crear DOS familias de constantes de días:
  - **DB-facing (SIN acento, alineado al enum `dias_laborales` de `prisma/schema.prisma:238-246`):**
    `Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, Domingo` — usada en Prisma/`fromZonedTime`/
    claves de días (reemplaza `MAP_DIA_SEMANA`/`REVERSE_MAP_DIA_SEMANA` actuales).
  - **Display (CON acento):** `Miércoles`, `Sábado` — usada solo para render en UI
    (`DIAS_SEMANA` ordenado + `ORDEN_DIAS`).
  - Verificar el enum real en el schema ANTES de escribir y ajustar cualquier comparación.
- Aplicar SOLO la centralización de su fila; no tocar lógica de negocio.
- Gate: `npx tsc --noEmit` = 0 errores.
- Entregable: diff + lista de reemplazos + evidencia de grep (0 usos remanentes del literal) + tsc.

**Qué necesita el verificador V9:**
- Greps transversales: `rg "America/Argentina" src/`, `rg '"(PENDIENTE|CONFIRMADO|COMPLETADO|CANCELADO)"' src/`,
  `rg "10 \* 60 \* 1000" src/`, `rg "toLocaleString\(\"es-AR\"\)" src/`, `rg "toZonedTime" src/`,
  `rg "user: \{ select:" src/`, `rg "interface Barbero|type Barbero" src/` → 0 o solo usos de las
  constantes/helpers.
- Confirma 1 export por archivo en los archivos NUEVOS de la fase. Repara y certifica.
- Gate: `npx tsc --noEmit` = 0. ACTA de fase.

---

### FASE 10 — Servicios de consultas Prisma (`lib/consultas/`) + autorización (`lib/seguridad/`)

> Cierra con **V10** + `npm run build`.

| Subfase | Alcance | Archivos (líneas verificadas) | Subagente |
|---|---|---|---|
| 10.1 Consultas Prisma | Crear `src/lib/consultas/` con 1 función por archivo: `servicios.ts` (`obtenerServiciosActivos`, `obtenerServicioPorId`), `barberos.ts` (`obtenerBarberosActivos`), `turnos.ts` (`obtenerTurnoConDetalle` reusando el include y `SELECCION_USUARIO_BASICA`), `agenda.ts` (`obtenerDatosReserva` = bloque de 4 queries de /turno), `dias-laborales.ts` (`obtenerDiasLaboralesActivos`), `horarios.ts` (`obtenerMargenesDeDia`). Reemplazar las queries duplicadas de §3.2 en acciones y páginas server | Nuevas en `lib/consultas/`; `actions/barberos/listar`, `servicio-actions.ts`, `margenesHorario.actions.ts`, `diaLaboral.actions.ts`, `turnos/{crear,eliminar,listar}.actions`, `user-dashboard.ts`, `api/configuracion-turno/route.ts`, `api/slot-locks/route.ts`, `app/turno/page.tsx`, `app/admin/page.tsx`, `app/admin/barbero/page.tsx`, `app/admin/config/page.tsx`, `app/page.tsx` | 10.1 |
| 10.2 Autorización | Desglosar `lib/seguridad.ts` → `src/lib/seguridad/`: `requerir-sesion.ts`, `requerir-admin.ts`, `es-admin.ts`, `requerir-propietario.ts`, `exigir-admin.ts` (wrapper). Reemplazar los auth manuales de §3.2 (5×`await auth()`, 7×rol, 6×dueño-o-admin, 26×boilerplate) y la redundancia de `user-dashboard.ts:114` | Nuevas en `lib/seguridad/`; ~30 archivos consumidores de §3.2 (actions + rutas `slot-locks`, `oauth/*`) | 10.2 |

**Qué necesita cada subagente 10.x:**
- Leer este documento (§5 y §6), AGENTS.md y los archivos de su fila.
- Las consultas nuevas van en `src/lib/consultas/` (máx. 80 líneas por archivo, sin validación ni
  auth, sin imports de `@/actions`). Los helpers de seguridad en `src/lib/seguridad/` (1 export por
  archivo).
- Actualizar TODOS los imports de los consumidores en la MISMA tanda (la regla del boy scout aplica:
  si un archivo tocado queda multi-función o >400, se desglosa).
- Gate: `npx tsc --noEmit` = 0; **V10 corre además `npm run build`**.
- Entregable: diff + lista de imports actualizados + evidencia de grep (0 `await auth()` manuales
  fuera de `lib/seguridad/` y layouts) + tsc.

**Qué necesita el verificador V10:**
- Confirma que `lib/seguridad/` y `lib/consultas/` tienen 1 export por archivo; que no quedan
  queries Prisma duplicadas entre acciones y páginas (grep de `findMany`/`findUnique` repetidos);
  que no queda `await auth()` manual en acciones; que `app/layout.tsx` no vuelve a meter auth
  global.
- Repara lo que falle y certifica. Gates: `npx tsc --noEmit` = 0 + `npm run build` OK. ACTA de fase.

---

### FASE 11 — Desglose de server actions a UNA acción por archivo

> Cierra con **V11** + `npm run build`. Cada action final ≤ 100 líneas; si una acción sola lo
> supera, extraer su lógica a `lib/consultas/`, `lib/validar-imagen/` o `lib/cloudinary-uploader/`.

| Subfase | Archivo origen (líneas, fns) | Desglose destino | Subagente |
|---|---|---|---|
| 11.1 Servicios | `actions/servicios/servicio-actions.ts` (397, 5 fns) | `servicios/{listar,carrusel,crear,actualizar,eliminar}.actions.ts`; mover `cleanImageUrl` y el bloque de subida de imagen (×2 duplicado ~172-194, ~281-303) a `lib/` | 11.1 |
| 11.2 Horarios | `actions/horarios/margenesHorario.actions.ts` (367, 5 fns) y `actions/horarios/diaLaboral.actions.ts` (251, 5 fns) | `horarios/{crear-margen,actualizar-margen,eliminar-margen,listar-margenes,horarios-compactos}.actions.ts` y `horarios/{crear,actualizar,eliminar,listar,obtener}.actions.ts`; helpers (`validarFormatoHora`, `compararHoras`, `horariosSeSuperponen`, `DIAS_NOMBRES`/`ORDEN_DIAS` → reusar constants) a `lib/` | 11.2 |
| 11.3 Mercado Pago | `actions/mercadopago/mercadopago-actions.ts` (296, 3 fns) | `mercadopago/{crear-preferencia,confirmar-pago,verificar-estado}.actions.ts`; la confirmación de pago comparte helper con el webhook (→ Fase 11.5) | 11.3 |
| 11.4 Sesión | `actions/sesion/user-dashboard.ts` (137, 3 fns) y `actions/sesion/auth-actions.ts` (98, 4 fns) | `sesion/{perfil,listar-turnos-usuario,cancelar-turno}.actions.ts` y `sesion/{logout,login,registro,google}.actions.ts`; **unificar contrato**: `user-dashboard` pasa de `State{message}` a `ActionState` (usa `error`) | 11.4 |
| 11.5 Resto + transversales | `configPage.ts` (115, 3), `mercadopago-oauth.actions.ts` (82, 3), `upload-images.actions.ts` (82, 2), `excepcionesLaborales.actions.ts` (99, 2) | `configuracion/{whatsapp,config-general,leer-config}.actions.ts`; `mercadopago/{estado-conexion,estado-oauth,desconectar}.actions.ts`; `mercadopago/{subir-config,subir-barberos}.actions.ts`; `excepciones/{crear,eliminar}.actions.ts`. **Además:** `confirmarTurnoPorPago()` único (webhook + confirmarPagoTurno), ampliar `revalidarCacheTurno` (tags mes/usuario), `enviarEmailTurnoSeguro()`, helpers `revalidarBarberos/Servicios/DiasLaborales` | 11.5 |

**Qué necesita cada subagente 11.x:**
- Mantener los MISMOS nombres de acción exportados o actualizar TODOS los importadores en la misma
  tanda (`TurnoList`, formularios, páginas, modales, etc.).
- No cambiar comportamiento: mensajes de error, revalidaciones, estados, emails idénticos.
- Los helpers extraídos van a `lib/` (máx. 80 líneas) con nombres en español.
- Entregable: estructura nueva + diff + lista de importadores actualizados + `npx tsc --noEmit` = 0.

**Qué necesita el verificador V11:**
- Verifica que `src/actions/` tenga 1 export de acción por archivo y ≤100 líneas por archivo; que
  no quedan archivos con múltiples actions (grep de `"use server"` + `export ... function` por
  archivo); que la confirmación de pago quedó en UN solo lugar; que `tsc` = 0.
- Repara lo que falle y certifica. Gates: `npx tsc --noEmit` = 0 + `npm run build` OK. ACTA de fase.

---

### FASE 12 — Desglose de `lib/` multi-función y `app/layout.tsx`

> Cierra con **V12** + `npm run build**. Carpeta nueva por dominio, 1 export por archivo.

| Subfase | Archivo origen (líneas, fns) | Desglose destino | Subagente |
|---|---|---|---|
| 12.1 Mercado Pago | `lib/mercadopago.ts` (307, 10 fns) | `src/lib/mercadopago/` con 1 función por archivo (10): `validar-oauth`, `url-autorizacion`, `intercambiar-token`, `obtener-config`, `esta-bloqueada`, `guardar-config`, `conectar-cuenta`, `refrescar-token`, `eliminar-config`, `obtener-cliente`; **mover aquí `confirmarTurnoPorPago()`** (Fase 11.5 lo usa). Actualizar consumidores: `webhook/route.ts`, `oauth/start`, `oauth/callback`, `mercadopago-actions` (o sus splitters), `MercadoPagoConnectionPanel` | 12.1 |
| 12.2 Resto de lib + layout | `lib/contraste.ts` (119, 6) → `lib/contraste/` (1 por archivo); `lib/cloudinary-uploader.ts` (111, 2) → `lib/cloudinary-uploader/` (2 archivos); `lib/email.ts` (67, 2) → `lib/email/` (`enviar-email-turno`, `send-turno-email` + `enviarEmailTurnoSeguro`); `lib/utils.ts` (24, 3) → `lib/utils/` (`cn`, `serialize-data`, `formatear-hora`, + los nuevos de 9.2); `app/layout.tsx` → `generateMetadata` a módulo propio (`src/app/metadata.ts`, 1 export) + `export { generateMetadata } from ...` en layout (re-export, NO definición) | `lib/contraste/`, `lib/cloudinary-uploader/`, `lib/email/`, `lib/utils/`, `src/app/metadata.ts`, `app/layout.tsx` + ~35 consumidores de contraste/seguridad/utils | 12.2 |

**Qué necesita cada subagente 12.x:**
- Mantener las rutas/API públicas si es posible; si no, actualizar TODOS los importadores en la
  misma tanda (grep previo `rg "lib/mercadopago"`, `rg "lib/contraste"`, `rg "lib/email"`,
  `rg "lib/utils"`, `rg "cloudinary-uploader"`).
- `lib/contraste/` y `lib/seguridad/` conservan la "fuente única normativa" como carpeta: los
  consumidores siguen importando desde `@/lib/contraste/...` (ruta nueva por función).
- El desglose de `utils` absorbe los helpers creados en 9.2 (mover, no duplicar).
- Entregable: estructura nueva + diff + lista de imports actualizados + `npx tsc --noEmit` = 0.

**Qué necesita el verificador V12:**
- Confirma 1 export por archivo en todas las carpetas `lib/*/` nuevas; `app/layout.tsx` con
  RootLayout como única definición (+ re-export de metadata); 0 consumidores rotos (tsc + grep).
- Repara lo que falle y certifica. Gates: `npx tsc --noEmit` = 0 + `npm run build` OK. ACTA de fase.

---

### FASE 13 — Desglose estricto de primitivas shadcn/ui y `use-toast.ts`

> Cierra con **V13** + `npm run build`. Decisión del usuario (§4.1): desglose estricto.
> Alto churn de imports (~15-20 archivos) — por eso fases dedicadas y subagentes por primitiva.

| Subfase | Archivo origen (exports) | Desglose destino | Subagente |
|---|---|---|---|
| 13.1 Dialog y Carousel | `ui/dialog.tsx` (10) y `ui/carousel.tsx` (5) | `ui/dialog/` con un archivo por pieza (`Dialog.tsx`, `DialogContent.tsx`, `DialogHeader.tsx`, `DialogFooter.tsx`, `DialogTitle.tsx`, `DialogDescription.tsx`, `DialogOverlay.tsx`, `DialogTrigger.tsx`, `DialogClose.tsx`, `DialogPortal.tsx`) y `ui/carousel/` (5). Actualizar TODOS los importadores (`rg "components/ui/dialog"`, `rg "components/ui/carousel"`) | 13.1 |
| 13.2 Button, Badge y use-toast | `ui/button.tsx` (2), `ui/badge.tsx` (2), `hooks/use-toast.ts` (3) | `ui/button/` (`Button.tsx` + `button-variants.ts`), `ui/badge/` (`Badge.tsx` + `badge-variants.ts`); `use-toast.ts` → `src/hooks/use-toast.ts` (solo `useToast`) + `src/lib/toast.ts` (solo `toast`) + módulo interno del store (`src/lib/estado-toast.ts`, SIN exportar funciones si es posible; el estado compartido no rompe la regla). Actualizar todos los importadores | 13.2 |

**Qué necesita cada subagente 13.x:**
- **13.2 `use-toast` es el más frágil del ciclo**: el store (estado, listeners, dispatch) debe vivir
  en un módulo compartido que `useToast` (hook) y `toast` (emisor imperativo) importen por separado;
  verificar con tsc que el estado compartido se mantiene (los `toast(...)` programáticos deben
  seguir apareciendo en la UI). Si el módulo del store necesita exportar una función interna, que
  sea SOLO esa (1 export) y documentarlo.
- Actualizar TODOS los importadores en la misma tanda (`rg "ui/button"`, `rg "ui/badge"`,
  `rg "use-toast"`).
- Entregable: estructura nueva + diff + lista de imports actualizados + `npx tsc --noEmit` = 0.

**Qué necesita el verificador V13:**
- Confirma 1 export por archivo en `ui/dialog/`, `ui/carousel/`, `ui/button/`, `ui/badge/` y que
  `use-toast.ts`/`toast.ts` quedaron separados con el store compartido funcionando (tsc + revisión
  del flujo de toast). Verifica que `carousel` quedó ≤200 líneas por archivo.
- Repara lo que falle y certifica. Gates: `npx tsc --noEmit` = 0 + `npm run build` OK. ACTA de fase.

---

### FASE 14 — Componentes y hooks comunes (eliminar duplicación de UI)

> Cierra con **V14** + `npm run build`. No cambia comportamiento visual. Reduce el tamaño de los
> componentes grandes (aunque el desglose por tamaño NO es objetivo de este ciclo, §4.3).

| Subfase | Componente/hook a crear | Migración (ubicaciones §3.2) | Subagente |
|---|---|---|---|
| 14.1 Estructura base | `ui/ModalBase.tsx` (overlay + contenedor + header + X con `CLASES_BOTON_CERRAR`), `ui/boton-submit.tsx` (variante `useFormStatus` + variante prop `pending`, usando `CLASES_BOTON_MARCA`), `ui/EmptyState.tsx` (icono + mensaje + acción) | ModalBase → 8 modales custom (`EditBarberoModal`, `CreateTurnoModal`, `ModalPagoTurno`, `CreateServicioForm`, `EditServicioModal`, `TermsModal`, `PrivacyModal`, `CookieModal`); boton-submit → 9 botones (§3.2); EmptyState → 8 listas (§3.2) | 14.1 |
| 14.2 Hooks comunes | `useRetroalimentacionAccion({ onExito })`, `useConfiguracionTurno()`, `useSessionId()` | Retroalimentación → 9 lugares (§3.2); configuracion-turno → `useDatosFormularioTurno.ts` + `EditarTurnoModal`; sessionId → `useCrearTurno.ts` + `EditarTurnoModal` | 14.2 |
| 14.3 Imagen, selectores y campos | `ui/SelectorCheckboxColapsable.tsx`; unificar `CampoFormulario` (absorbe `InputField` de `EditServicioModal`); migrar `useImagenServicio` + `SeccionImagenServicio` a barbero y EditServicioModal; usar `esImagenValida()` (9.2) | SelectorServicios + SelectorHorarios; CampoFormulario vs InputField; imagen preview ×3 + lógica ×4 (§3.2) | 14.3 |

**Qué necesita cada subagente 14.x:**
- Los componentes nuevos van en `src/components/ui/` (máx. 200 líneas, 1 export); los hooks en
  `src/hooks/` (máx. 150).
- **Regla del boy scout:** si al migrar un componente queda multi-función o >400 líneas, se
  desglosa en la misma tanda. Los >200 con 1 función NO se desglosan por decisión del usuario.
- No cambiar estilos/colores de marca; usar el sistema de color de AGENTS.md.
- Entregable: diff + lista de migraciones + `npx tsc --noEmit` = 0.

**Qué necesita el verificador V14:**
- Confirma el uso real de `ModalBase`, `boton-submit`, `EmptyState`, `useRetroalimentacionAccion`
  en todos los lugares de §3.2 (grep); que no quedan modales `fixed inset-0` custom duplicados; que
  el contraste/color se mantiene; que los componentes nuevos respetan límites.
- Repara lo que falle y certifica. Gates: `npx tsc --noEmit` = 0 + `npm run build` OK. ACTA de fase.

---

### FASE 15 — QA global (verificador V15)

> Cierra el ciclo. Gates de §8. Certifica el objetivo: 0 multi-función + 0 duplicados ≥3 copias.

**Qué necesita el verificador V15 (QA GLOBAL):**
1. **Script de verificación de "1 función exportada por archivo"**: barrer `src/` (ts/tsx) y
   reportar archivos con >1 función exportada (regex
   `^export (async )?function |^export default |^export const X = ((async\s*)?\(|X =>)`), ignorando
   `export type`/`export interface`/constantes puras. Resultado esperado: **0** salvo re-exports
   documentados (layout metadata, store de toast, primitivas Radix re-exportadas 1 por archivo).
2. **Verificación de límites de líneas**: acciones ≤100, lib ≤80, componentes ≤200, hooks ≤150,
   global ≤400.
3. **Verificación de duplicados ≥3 copias**: re-correr greps de §6.9/V9 (zona horaria, estados,
   días, `toLocaleString`, `toZonedTime`, selects usuario, queries Prisma, modales custom, botones
   submit, empty states, toast+refresh) → 0 o solo uso de helpers/constantes.
4. `npx tsc --noEmit` = **0 errores**.
5. `npm run build` = **OK** (26 rutas).
6. **Smoke test** (next start): `/` (200, texto SSR), `/login`, `/register`, `/turno` (307 → login),
   `/admin` (307 → login), `/pago/success|pending|failure` — sin regresiones visuales del sistema
   de color, toast funcional (crear/editar servicio o barbero), modales abriendo, lista de turnos
   renderizando.
7. **Acta final** + checklist de §8. Con OK del usuario, actualizar `AUDITORIA.md` con el resultado
   del ciclo (qué se desglosó, qué se centralizó, pendientes explícitos, decisiones de coordinación).

---

## 7. Inventario de subagentes (total 30: 19 implementadores + 7 verificadores + 4 transversales)

| Fase | Subagentes | Rol |
|---|---|---|
| FASE 9 | 9.1, 9.2, 9.3 + V9 | 3 implementadores + 1 verificador |
| FASE 10 | 10.1, 10.2 + V10 | 2 implementadores + 1 verificador (+ build) |
| FASE 11 | 11.1, 11.2, 11.3, 11.4, 11.5 + V11 | 5 implementadores + 1 verificador (+ build) |
| FASE 12 | 12.1, 12.2 + V12 | 2 implementadores + 1 verificador (+ build) |
| FASE 13 | 13.1, 13.2 + V13 | 2 implementadores + 1 verificador (+ build) |
| FASE 14 | 14.1, 14.2, 14.3 + V14 | 3 implementadores + 1 verificador (+ build) |
| FASE 15 | V15 (QA global) | 1 verificador (QA global + acta) |

**Orden de arranque (resumen):** `9.1-9.3 (paralelo) → V9 → 10.1-10.2 (paralelo) → V10 + build →
11.1-11.5 (paralelo, archivos disjuntos) → V11 + build → 12.1-12.2 (paralelo) → V12 + build →
13.1-13.2 (paralelo) → V13 + build → 14.1-14.3 (paralelo) → V14 + build → V15 + QA global`.
Las Fases 13 y 14 pueden adelantarse a arrancar tras el cierre de la Fase 9 (no dependen de 10-12);
el coordinador propaga a sus subagentes los archivos ya movidos por 9 para evitar colisiones.

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Colisiones de archivos entre subagentes paralelos | Tablas por subfase con archivos disjuntos; el coordinador verifica el reparto antes de arrancar cada tanda (incl. Fases 13/14 adelantadas) |
| Acentos de días de la semana rompen el mapeo con el enum Prisma | Regla crítica §6.9.1: dos familias de constantes (DB sin acento vs display con acento); verificar el enum en `prisma/schema.prisma:238-246` antes de escribir |
| Desglose de `use-toast` rompe el estado compartido | §6.13.2: store compartido en módulo propio; `useToast` y `toast` importan del mismo store; verificar con tsc y smoke de toast |
| Churn de imports en shadcn/ui y seguridad/contraste | Greps previos de importadores (`rg`); actualizar imports en la MISMA tanda; fases dedicadas con subagentes por primitiva |
| Acciones que solas superan 100 líneas | Extraer lógica a `lib/consultas/`, `lib/validar-imagen/` o `lib/cloudinary-uploader/` (patrón ya vigente en `actions/turnos`) |
| El build NO typechequea (`ignoreBuildErrors`) | `npx tsc --noEmit` obligatorio en cada subfase y en cada gate de verificador (objetivo 0 errores) |
| Archivos que vuelven a superar 400 líneas o a multi-exportarse tras una modificación | Regla del boy scout: se desglosan en la misma tanda; V9…V15 re-chequean |
| Fases 9-14 cambian comportamiento | Regla transversal §5.13: preservar mensajes, revalidaciones, estados, emails idénticos; V verifican por diff |
| Componentes >200 líneas con 1 función | NO se desglosan por decisión del usuario (§4.3); la Fase 14 los reduce de paso |
| `prisma db push --accept-data-loss` dropea datos en BD de desarrollo | Comportamiento preexistente del script de build; operar solo contra BD de desarrollo, nunca producción |
| Números de línea desplazados entre tandas | Este documento marca "verificar línea antes de editar"; el verificador reubica referencias |

---

## 9. Cierre

Al terminar el **QA GLOBAL (V15 + §8)**, el coordinador global (opencode) confirma contra este
checklist y cierra el ciclo:

1. **0 archivos de código con más de una función exportada** en `src/` (salvo re-exports
   documentados del framework/store).
2. **0 patrones duplicados con ≥3 copias** activos (verificado con greps de §6.9/V9/V15).
3. Límites por capa respetados: acciones ≤100, lib ≤80, componentes ≤200, hooks ≤150, global ≤400.
4. `npx tsc --noEmit` = **0 errores**.
5. `npm run build` **OK** (Fases 10, 11, 12, 13, 14 y 15; confirmar de nuevo al cierre).
6. **Smoke test manual** de rutas: `/` (público), `/login`, `/register`, `/turno`, `/admin` y
   `/pago` (success/pending/failure) — sin regresiones visuales (sistema de color intacto), texto
   SSR presente, auth funcionando, toast y modales operativos.
7. **Acta final**: checklist completada + lista de archivos modificados/creados/eliminados por fase
   + cualquier pendiente documentado explícitamente (nunca silenciado).
8. **Actualizar `AUDITORIA.md`** (con OK del usuario) con el resultado del ciclo.

---

# APÉNDICE A — PENDIENTE NUEVO: Selector visual de barberos con tarjetas de foto (registrado 27-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo del ciclo de ordenamiento (Fases 9-15) y es un pendiente NUEVO,
> independiente de ese ciclo. No forma parte de las Fases 9-15. Los números de línea citados
> fueron **verificados contra el repo el 27-ago-2026** y pueden desplazarse: **verificar la línea
> exacta antes de editar** (regla transversal §5.11).
>
> **Estado: APROBADO en plan por el usuario el 27-ago-2026** (alcance y estilo definidos en §A.5).
> **Aún NO implementado.**

## A.1. Objetivo

Reemplazar la interfaz de selección de barbero del flujo de reserva de turnos: pasar del selector
tradicional de texto (`<select>` / dropdown) a un **selector visual de tarjetas con foto circular**,
tipo:

```
[FOTO CIRCULAR]    [FOTO CIRCULAR]    [FOTO CIRCULAR]
FRANCO PASCHETTO   JUAN MARCOS MAYORAL ...
```

Estética de referencia: fondo oscuro, fotos circulares grandes, nombre debajo, presentación
elegante y minimalista. La selección se hace con clic/tap sobre la tarjeta y mantiene **exactamente
la lógica actual** de la reserva. NO se crea un sistema paralelo de selección: solo se reemplaza la
interfaz visual del selector, reutilizando la lógica existente.

## A.2. Contexto actual (verificado el 27-ago-2026)

### A.2.1. Selector del flujo de reserva ("Nuevo Turno")

- **`src/components/turno/SeccionBarbero.tsx`** (47 líneas): `<select name="barberoId" required>`
  que solo muestra `b.nombre` (`src/components/turno/SeccionBarbero.tsx:23-37`). Ignora `srcImage`
  aunque el tipo ya la trae.
- La página es un único modal/formulario (no wizard): `src/app/turno/page.tsx` →
  `CreateTurnoModal` → `FormularioTurno` (grid `grid-cols-1 md:grid-cols-2` con secciones
  **Cliente | Barbero | Servicio**, y luego **Fecha/Hora**).

### A.2.2. Selector del modal de edición/reprogramación de turno

- **`src/components/turno/EditarTurnoModal.tsx`** (297 líneas): campo `CampoSelect` "Asignar
  Barbero" (`src/components/turno/EditarTurnoModal.tsx:203-215`), que usa el helper local
  `CampoSelect` (`:267-296`). Estado local `barberoSeleccionadoId` (`:50-52`).

### A.2.3. Datos disponibles (NO requieren cambios de backend)

- **`src/types/turno.ts:16-20`**: `BarberoData = { id: string; nombre: string; srcImage?: string | null }`
  — la foto YA viaja con el barbero.
- **`src/lib/consultas/obtener-barberos-activos.ts`**: `findMany({ where: { estado: true } })`
  devuelve el objeto completo (incluye `srcImage`). Fuente del flujo de reserva.
- Caminos de datos (ambos incluyen `srcImage`):
  1. Server-side: `src/app/turno/page.tsx:10-21` `getTurnoData()` → `obtenerDatosReserva(true)`
     → `initialBarberos`.
  2. Client-side: `src/hooks/useConfiguracionTurno.ts` → `fetch("/api/configuracion-turno")` →
     `src/app/api/configuracion-turno/route.ts` → `obtenerDatosReserva(esAdmin(sesion))` (los
     barberos se serializan tal cual, incluye `srcImage`).
- El modal de edición usa `useConfiguracionTurno(abierto)` → `datos.barberos` también con `srcImage`.

### A.2.4. Lógica de selección a PRESERVAR (NO modificar)

- **`src/hooks/useDatosFormularioTurno.ts`** (95 líneas): `useState` local + prop-drilling.
  - `selectedBarberoId` / `setSelectedBarberoId` (`:38`).
  - `handleBarberoChange(nuevoBarberoId)` (`:55-64`): setea el barbero y **resetea el servicio**
    si el nuevo barbero no lo ofrece (filtrado cruzado vía `relaciones`).
  - Filtrado `barberosFiltrados` por `selectedServicioId` (`:49-53`).
- **Envío del ID al flujo de reserva**:
  - `src/actions/turnos/crear.actions.ts:30`: `const barberoId = formData.get("barberoId")`.
  - `src/actions/turnos/estado.actions.ts:31-37`: lee `rawBarberoId` (si vacío usa el barbero
    actual del turno).
  - Por eso el campo **DEBE mantener el nombre `barberoId`** en el FormData (via `input hidden`).

### A.2.5. Patrones visuales de referencia ya existentes

- Tarjeta con foto de barbero: `src/components/barbero/BarberoList.tsx:64-99` (`<img src={srcImage}>
  object-cover` + fallback icono `User`).
- Patrón de "selección activa" (slot dorado con glow + indicador check absoluto):
  `src/components/turno/ListaHorarios.tsx:66-121` y `DiaCalendario.tsx`.
- Modal de reserva (`CreateTurnoModal.tsx:54-61`) aliasea en un wrapper:
  `--primary` → `var(--page-primary)`, `--secondary`, `--primary-foreground`, `--primary-tinta`.
  El modal usa `bg-zinc-900 border-zinc-700/80`. El modal de edición usa la paleta oscura
  `#14110C` / `#1C1812` / `#2C261D`.

## A.3. Alcance (decisiones del usuario, registradas el 27-ago-2026 — NO reversibles sin confirmación)

1. **Alcance de archivos: Reserva + Edición de turno.** Reemplazar el dropdown de
   `SeccionBarbero.tsx` (reserva) **y** el dropdown "Asignar Barbero" de `EditarTurnoModal.tsx`.
2. **Estilo visual: colores configurados de la página.** El selector DEBE tomar la paleta de los
   colores de marca parametrizados (`var(--page-primary)`, `var(--page-primary-tinta)`,
   `var(--page-primary-foreground)`, variantes alfa `--page-primary-*`), NO hex hardcodeado
   (regla de AGENTS.md "Sistema de color"). Se respetan neutros (zinc) existentes.
3. **NO crear sistema paralelo de selección**: reemplazo solo de la interfaz; se reutiliza
   `handleBarberoChange`, `selectedBarberoId`, `setBarberoSeleccionadoId` y el envío por `barberoId`.
4. **NO modificar** lógica de disponibilidad, horarios, turnos ni backend salvo lo estrictamente
   necesario para el selector. No se cambian tipos (`BarberoData` ya trae `srcImage`).

## A.4. Diseño de la solución

### A.4.1. Nuevo componente compartido — `src/components/turno/SelectorBarberoTarjetas.tsx`

- `"use client"`, **una sola función exportada** (regla AGENTS.md), ≤200 líneas.
- Props: `barberos: BarberoData[]`, `seleccionadoId: string`, `onChange: (id: string) => void`,
  `name?: string` (si se provee, renderiza `<input type="hidden" name={name} value={seleccionadoId}>`
  para mantener el envío del `barberoId` por FormData).
- Layout responsive: contenedor `flex flex-wrap gap-4` (fila cuando hay espacio; **wrap
  automático** en tablet/celular). Cada barbero es un `<button type="button" aria-pressed={seleccionado}>`.
- Cada tarjeta:
  - **Avatar circular**: `<img>` con `rounded-full object-cover`, tamaño ~`w-20 h-20 sm:w-24 sm:h-24`
    (imagen sin deformar, circular independientemente de las dimensiones originales).
  - **Fallback con iniciales** si `srcImage` es null: círculo `bg-[var(--page-primary-30)]` con la
    inicial del nombre en `var(--page-primary-tinta)`.
  - **Nombre completo** centrado debajo del avatar (`text-[var(--page-primary-tinta)]`, truncado).
- Estado de selección (solo uno activo; lo garantiza `seleccionadoId` único):
  - **Seleccionado**: borde `var(--page-primary)`, fondo `var(--page-primary-15)`, anillo en el
    avatar `ring-2 ring-[var(--page-primary)] ring-offset-2`, escala sutil `scale-[1.03]` e
    indicador check en la esquina con `var(--page-primary-foreground)`.
  - **No seleccionado**: borde `var(--page-primary-20)`, hover `var(--page-primary-60)`.
  - Contraste según `src/lib/contraste.ts` y reglas de `--page-primary-tinta`/`-foreground` de
    AGENTS.md (prohibido `text-white`/`#000` sobre fondo de marca).

### A.4.2. `src/components/turno/SeccionBarbero.tsx` (reemplazo)

- Mantiene props actuales (`selectedBarberoId`, `selectedServicioId`, `barberosFiltrados`,
  `handleBarberoChange`) → **la lógica de `useDatosFormularioTurno` queda intacta**.
- Sustituye el `<select>` por `<SelectorBarberoTarjetas name="barberoId" barberos={barberosFiltrados}
  seleccionadoId={selectedBarberoId} onChange={handleBarberoChange} />`.
- Conserva el label "Barbero *" y el mensaje de lista vacía
  (`SeccionBarbero.tsx:38-44`). Se elimina el atributo `required` del select (el bloqueo de envío
  pasa a un guard en el form, ver §A.4.3).

### A.4.3. `src/components/turno/FormularioTurno.tsx` (ajuste mínimo)

- El `<form>` (`FormularioTurno.tsx:58`) gana un `onSubmit` que **bloquea el envío** (con toast)
  si `selectedBarberoId` está vacío, replicando el comportamiento del `required` actual del select.
  La validación de servicio/cliente (siguen siendo `<select required>` nativos) NO se toca.
- Se reordena la grilla para que la sección de barbero ocupe ancho completo
  (`md:col-span-2`), quedando barberos en fila como la referencia. Orden resultante sugerido:
  [Cliente | Servicio] y luego Barbero a todo el ancho, antes de Fecha/Hora. (Si el reorden
  resultara confuso visualmente, mantener el orden actual con el selector en la columna y
  `flex-wrap`; el coordinador decide en implementación, preservando funcionamiento.)

### A.4.4. `src/components/turno/EditarTurnoModal.tsx` (reemplazo)

- Sustituye el `CampoSelect` "Asignar Barbero" (`EditarTurnoModal.tsx:203-215`) por
  `<SelectorBarberoTarjetas name="barberoId" barberos={barberos} seleccionadoId={barberoSeleccionadoId}
  onChange={(id) => setBarberoSeleccionadoId(id)} />`, envuelto en `md:col-span-2` para la fila.
- `CampoSelect` (`:267-296`) queda solo para "Cambiar Servicio" (no se elimina).
- `actualizarTurno` ya tolera `barberoId` vacío (usa el barbero actual) → **no requiere guard**.

## A.5. Decisiones registradas del usuario

| # | Decisión |
|---|---|
| 1 | Alcance: **Reserva + Edición de turno** (ambos dropdowns se reemplazan por el selector visual). |
| 2 | Estilo: paleta tomada de **los colores configurados de la página** (`var(--page-primary*)`, `-tinta`, `-foreground`, variantes alfa). NO paleta dorada fija `#E8B031` ni `#1C1812` como base del selector; neutros zinc permitidos como base del modal. |

## A.6. Lo que NO se modifica (explicitamente fuera de alcance)

- Backend, Prisma (`schema.prisma`), consultas (`lib/consultas/`), server actions de turnos
  (`crear/estado/disponibilidad`), lógica de disponibilidad/horarios, pagos (Mercado Pago),
  tipos (`src/types/turno.ts`), `useDatosFormularioTurno`, `useConfiguracionTurno`,
  `useCrearTurno`, `SeleccionadorHorario`, `ListaHorarios`, `GrillaCalendario`, `DiaCalendario`.
- No se instalan dependencias nuevas.
- No se crean tests (no hay framework).

## A.7. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `src/components/turno/SelectorBarberoTarjetas.tsx` | **NUEVO** — selector visual de tarjetas compartido |
| `src/components/turno/SeccionBarbero.tsx` | **MODIFICAR** — usa el nuevo selector + hidden input `barberoId` |
| `src/components/turno/FormularioTurno.tsx` | **MODIFICAR** — guard `onSubmit` de barbero + grid (ancho completo) |
| `src/components/turno/EditarTurnoModal.tsx` | **MODIFICAR** — reemplaza `CampoSelect` de barbero por el nuevo selector |

## A.8. Verificación (obligatoria al terminar)

1. `npx tsc --noEmit` = **0 errores** (el build NO typechequea; obligatorio AGENTS.md).
2. `npm run lint`.
3. Revisión manual:
   - **Render**: todos los barberos activos se renderizan como tarjetas.
   - **Foto correcta**: `srcImage` de cada barbero es la correspondiente; sin deformación
     (`object-cover`, circular).
   - **Fallback**: barbero sin foto muestra avatar de iniciales.
   - **Selección**: clic/tap selecciona; solo un barbero activo a la vez; estado visual claro.
   - **Flujo**: el `barberoId` real (ID, no nombre) llega a `createTurno` / `actualizarTurno`
     (el hidden input `name="barberoId"` mantiene el FormData).
   - **Responsive**: desktop (fila), tablet y celular (wrap sin romper el layout).
   - **Sin regresiones**: servicio, cliente, fecha/hora y pago funcionan igual.
4. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300),
   imports `@/`, sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía
   `var(--page-*)` sin hex hardcodeado.

## A.9. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. Un subagente implementador recibe este apéndice + AGENTS.md y aplica los 4 cambios de §A.7.
2. Un subagente **verificador** revisa TODO el código producido (reglas de §A.8.4, contraste,
   límites de líneas, multi-función), repara fallas y **certifica** el pendiente.
3. La orquestación y la decisión final son del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en
   `AUDITORIA.md` si el usuario lo confirma).

---

# APÉNDICE B — PENDIENTE NUEVO: Rediseño del modal "Nuevo Turno" en flujo completo de reserva (registrado 27-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo del ciclo de ordenamiento (Fases 9-15) y al Apéndice A (selector de
> barberos) como un pendiente NUEVO e independiente. No forma parte de las Fases 9-15. Los números
> de línea citados fueron **verificados contra el repo el 27-ago-2026** y pueden desplazarse:
> **verificar la línea exacta antes de editar** (regla transversal §5.11).
>
> **Estado: APROBADO en plan por el usuario el 27-ago-2026** (alcance y estilo definidos en §B.3).
> **Aún NO implementado.**

## B.1. Objetivo

Rediseñar el modal de **"Nuevo Turno"** para que integre todo el proceso de creación del turno en
una única interfaz con flujo **Servicio → Profesional → Fecha y Hora → Confirmación**, tomando como
referencia la estructura de la imagen adjunta (calendario, horarios disponibles, sidebar de resumen
y botón de confirmación) **PERO conservando la tarjeta del barbero actual** (`SelectorBarberoTarjetas`,
implementada en el Apéndice A), que el usuario quiere mantener tal cual.

El resultado debe sentirse como un **flujo completo de reserva** con un **resumen del turno fijo y
actualizado en tiempo real** en el lado derecho del modal.

## B.2. Contexto actual (verificado el 27-ago-2026)

### B.2.1. Componentes del flujo de "Nuevo Turno"

- **`src/app/turno/page.tsx`** (75 líneas): página server. Carga `obtenerDatosReserva(true)` →
  `initialServicios`, `initialBarberos`, `initialUsuarios`, `initialRelaciones` y los pasa a
  `CreateTurnoModal`. También le pasa `whatsappPhone` desde `config?.whatsapp`.
- **`src/components/turno/CreateTurnoModal.tsx`** (136 líneas): wrapper que abre `ModalBase`
  (`max-w-4xl`, `bg-zinc-900 border-zinc-700/80`), alias de color
  (`--primary` → `var(--page-primary)`, `--secondary`, `--primary-foreground`, `--primary-tinta`)
  y renderiza `FormularioTurno` o el spinner de carga. Tras crear el turno, muestra `ModalPagoTurno`.
- **`src/components/turno/FormularioTurno.tsx`** (125 líneas): `<form>` único con grid
  `grid-cols-1 md:grid-cols-2`: `SeccionCliente` → `SeccionServicio` → `SeccionBarbero`
  (`md:col-span-2`) → `SeleccionadorHorario` → botones **Cancelar** + **Confirmar Reserva**
  (`BotonSubmitFormStatus`). Guard `onSubmit` (`:57-64`) que bloquea el envío si no hay barbero.
- **`src/components/turno/SeccionServicio.tsx`** (61 líneas): `<select name="servicioId" required>`
  con `serviciosFiltrados` (filtrado por barbero seleccionado vía `relaciones`).
- **`src/components/turno/SeccionBarbero.tsx`** (39 líneas): label "Barbero *" + envuelve
  `<SelectorBarberoTarjetas name="barberoId" ...>` + mensaje de lista vacía. **NO se modifica.**
- **`src/components/turno/SelectorBarberoTarjetas.tsx`** (90 líneas): tarjeta actual del barbero
  (avatar circular con `srcImage`, fallback de iniciales, check de selección con
  `var(--page-primary)`). **NO se modifica.**
- **`src/components/turno/SeccionCliente.tsx`** (53 líneas): select de cliente para admins
  (`name="userId"`); para rol `USER` muestra un select deshabilitado con el usuario autologgeado.
- **`src/components/turno/SeleccionadorHorario.tsx`** (79 líneas): llama a
  `useDisponibilidadHorarios`, renderiza `GrillaCalendario` + `ListaHorarios` y el hidden input
  `name="horarioReservado"`. Hoy **contiene el estado de disponibilidad en su interior**.
- **`src/components/turno/GrillaCalendario.tsx`** (176 líneas) y **`DiaCalendario.tsx`** (67 líneas):
  calendario del mes con días disponibles/seleccionados; acento dorado fijo `#E8B031` y paleta
  oscura fija (`#18150F`, `#2A2318`, `#8E8675`, `#4A4438`, `#3A342C`).
- **`src/components/turno/ListaHorarios.tsx`** (134 líneas): grilla de slots disponibles/ocupados/
  bloqueados por otro usuario (`Lock`); mismo acento dorado fijo.

### B.2.2. Estado y datos del flujo (a preservar y/o reutilizar)

- **`src/hooks/useDatosFormularioTurno.ts`** (95 líneas): estado de selección
  (`selectedServicioId`, `selectedBarberoId`, `selectedUserId`), filtrado cruzado por `relaciones`
  (`serviciosFiltrados` / `barberosFiltrados`) y handlers `handleBarberoChange` / `handleServicioChange`.
- **`src/hooks/useDisponibilidadHorarios.ts`** (145 líneas): estado de disponibilidad (`fecha`,
  `mesVisible`, `diasDisponibles`, `cargandoDias`, `slots`, `cargando`, `slotSeleccionado`) +
  handlers (`irAlMesAnterior/Siguiente`, `manejarSeleccionFecha`, `manejarSeleccionSlot`).
  Usa `obtenerDiasDisponibles` / `obtenerHorariosDisponibles` (server actions) y `useSlotLocks`
  (locks en tiempo real). **Se debe SUBIR a `FormularioTurno`** para que el resumen lo consuma.
- **`src/components/ui/boton-submit-form-status.tsx`** (48 líneas): botón submit con
  `useFormStatus` (`disabled={pending}`). Se le agrega una prop opcional de deshabilitado.
- **Server action `createTurno`** (`src/actions/turnos/crear.actions.ts`): lee del FormData
  `servicioId`, `userId`, `barberoId`, `horarioReservado`. **NO se modifica.**
- **`src/lib/utils/`**: `formatearMoneda`, `formatearFecha`, `formatearHora`, `formatearFechaHora`.
- **Sistema de color**: variables globales `--page-primary*` / `-tinta` / `-foreground` /
  variantes alfa `--page-primary-08/15/18/20/25/30/40/44/50/60/70/80` inyectadas en `layout.tsx`
  desde `page_config` (BD). Fuente única de contraste: `src/lib/contraste.ts`.

## B.3. Alcance y decisiones del usuario (registradas el 27-ago-2026 — NO reversibles sin confirmación)

1. **SIN barra de progreso.** El modal NO lleva stepper/barra de progreso
   (SERVICIO → PROFESIONAL → FECHA & HORA → CONF): se omitió por decisión explícita del usuario.
2. **Selector de servicio → tarjetas visuales.** Se reemplaza el `<select>` de
   `SeccionServicio.tsx` por una grilla de tarjetas (nombre + duración + precio), respetando la
   lógica de filtrado existente (`serviciosFiltrados` por barbero y `relaciones`).
3. **Selector de cliente (solo admin) → sección "Confirmación".** Se conserva la funcionalidad
   actual; el cliente se elige en una sección final del panel izquierdo, justo antes de confirmar.
   Para rol `USER` se auto-asigna (comportamiento actual intacto).
4. **Acentos de selección/activos/progreso → `var(--page-primary)`.** El calendario, los horarios
   y el resumen usan el color primario de la BD en estados activos/seleccionados. Se mantienen
   FIJOS solo los neutros y superficies oscuras (zinc, `#18150F`, `#2A2318`, `#8E8675`, bloqueados).
5. **NO se modifica la tarjeta del barbero** (`SelectorBarberoTarjetas` + `SeccionBarbero`): se
   conserva exactamente el diseño, estilos y comportamiento actuales (el usuario prefiere el diseño
   actual sobre el de la imagen de referencia).
6. **No eliminar funcionalidades existentes ni duplicar lógica.** Se reutilizan componentes, hooks,
   servicios, consultas y server actions existentes. No se instalan dependencias nuevas.
7. **Colores desde la BD**: NO hardcodear hex de marca; usar `var(--page-primary*)` / `-tinta` /
   `-foreground` y `CLASES_BOTON_MARCA`. Los colores primarios (botones, selección, estados
   activos, elementos destacados) provienen de `page_config`.

## B.4. Diseño de la solución

### B.4.1. Layout del nuevo modal

```
┌──────────────────────────────────────────────────┬──────────────────────┐
│  [Header sticky: "Nuevo Turno" + botón X]          │                      │
├──────────────────────────────────────────────────┤  RESUMEN DEL TURNO    │
│  1. SERVICIO (tarjetas: nombre · duración · precio)│  · Servicio          │
│  2. PROFESIONAL (tarjeta ACTUAL del barbero)       │  · Duración/precio   │
│  3. FECHA Y HORA (calendario + horarios)           │  · Barbero           │
│  4. CONFIRMACIÓN (cliente para admins)             │  · Fecha y hora      │
│                                                    │  · Total             │
│                                                    │  [CONFIRMAR TURNO]   │
│                                                    │  [Cancelar]          │
└──────────────────────────────────────────────────┴──────────────────────┘
```

- **Desktop**: `grid lg:grid-cols-[1fr_320px]` (o `lg:grid-cols-[1fr_340px]`). El sidebar derecho
  es fijo/visible (`lg:sticky`) y se actualiza en tiempo real; si se alarga, scroll propio dentro
  del contenedor del modal (`max-h-[92vh]`).
- **Mobile**: las columnas se apilan (el resumen queda debajo del formulario) — el modal debe
  seguir siendo responsive (decisión §B.3.5 del usuario: "Mantener responsive el modal").
- El `<form>` envuelve TODO el contenido (panel izquierdo + sidebar) para que los hidden inputs
  (`servicioId`, `barberoId`, `horarioReservado`, `userId`) sigan funcionando con `createTurno`
  sin tocar la action.
- **Ancho del modal**: ampliar `max-w-4xl` → `max-w-5xl` (o `max-w-6xl`) en `CreateTurnoModal.tsx`
  para acomodar el sidebar.

### B.4.2. Panel izquierdo

1. **`SeccionServicio.tsx` — reescribir (tarjetas de servicio).**
   - Grilla de tarjetas (patrón visual idéntico a `SelectorBarberoTarjetas`): cada tarjeta es un
     `<button type="button" aria-pressed>` con nombre, `duracion min` y precio
     (`formatearMoneda`). Estados: seleccionado = borde `var(--page-primary)`, fondo
     `var(--page-primary-15)`, check con `var(--page-primary)`/`var(--page-primary-foreground)`;
     no seleccionado = borde `var(--page-primary-20)`, hover `var(--page-primary-60)`. Texto con
     `var(--page-primary-tinta)` (no `text-white`/`#000` sobre marca).
   - Incluye `<input type="hidden" name="servicioId" value={selectedServicioId}>` para mantener
     el FormData (reemplaza el `name="servicioId"` del `<select>`).
   - Sigue usando `serviciosFiltrados` (filtrado por barbero) y `handleServicioChange`. Estado de
     lista vacía ("Ningún servicio disponible").
   - Quitar el `required` del select; el envío se valida por el estado completo (§B.4.4).
2. **`SeccionBarbero.tsx` + `SelectorBarberoTarjetas.tsx` — NO se tocan** (tarjeta actual del
   barbero se conserva; ya maneja el hidden `name="barberoId"`).
3. **`GrillaCalendario.tsx` / `DiaCalendario.tsx` / `ListaHorarios.tsx` — solo color.**
   - Convertir los acentos `#E8B031` a `var(--page-primary)` en: día seleccionado (fondo
     `var(--page-primary)`, texto `var(--page-primary-foreground)`, shadow/glow con `color-mix`),
     día disponible (texto `var(--page-primary)`, hover `var(--page-primary-15/20)`), puntito de
     disponibilidad (`var(--page-primary)`/70), anillo de "hoy" (`var(--page-primary)`/30),
     slot activo (fondo `var(--page-primary)`, texto `var(--page-primary-foreground)`, glow
     `color-mix`), hover de slot inactivo (`var(--page-primary)`/50), asteriscos de labels y
     leyenda del calendario ("Seleccionado"/"Disponible").
   - Mantener fijos los neutros/superficies: `#18150F`, `#2A2318`, `#8E8675`, `#4A4438`,
     `#3A342C`, bloqueados (`#1A1612`/`#2A2318`/`#4A4438`), texto base `#E4E0D9`.
4. **`SeleccionadorHorario.tsx` — refactor a presentacional.** Recibe por props todo lo que hoy
   devuelve `useDisponibilidadHorarios` (el hook se sube a `FormularioTurno`). Mantiene el hidden
   input `name="horarioReservado"` con `slotSeleccionado`. Sigue componiendo
   `GrillaCalendario` + `ListaHorarios`.
5. **`SeccionConfirmacion.tsx` — NUEVO.** Sección final del panel izquierdo: reutiliza
   `SeccionCliente` (select de cliente para admins, auto-asignado para `USER`) + nota breve de
   confirmación. Una sola función exportada, ≤200 líneas.

### B.4.3. Sidebar derecho — `ResumenTurno.tsx` (NUEVO)

- `"use client"`, una sola función exportada, ≤200 líneas.
- Props: `servicio: ServicioData | null`, `barbero: BarberoData | null`, `fecha: Date | undefined`,
  `slotSeleccionado: string`, `completo: boolean`, `onCancelar: () => void`.
- Contenido (se actualiza en tiempo real desde el estado levantado):
  - **Servicio**: nombre + `duracion min` (+ descripción corta si existe).
  - **Barbero**: nombre del seleccionado.
  - **Fecha y hora**: `formatearFecha(fecha)` + `formatearHora(slot)` (o `slotSeleccionado`).
  - **Total**: `formatearMoneda(servicio.precio)`.
- **Botón `[CONFIRMAR TURNO]`**: `type="submit"` dentro del `<form>`. Deshabilitado
  (`BotonSubmitFormStatus` con la nueva prop `deshabilitado`) hasta que el turno esté completo
  (servicio + barbero + fecha + hora; y `userId` si el usuario es admin).
- **Botón `[Cancelar]`**: ghost, `onCancelar` (cierra el modal).
- Acentos con `var(--page-primary)` / `var(--page-primary-tinta)` / `var(--page-primary-foreground)`
  según contraste de `src/lib/contraste.ts`.

### B.4.4. Integración — `FormularioTurno.tsx` (reescritura del layout)

- Llama a **`useDisponibilidadHorarios`** (sube el estado de disponibilidad) y lo pasa como props
  a `SeleccionadorHorario`; el resumen consume `fecha` / `slotSeleccionado` directamente.
- Compone el layout de §B.4.1: columna izquierda (Servicio → Barbero → Fecha y Hora → Confirmación)
  + `ResumenTurno` en la columna derecha.
- Calcula `completo` (todas las selecciones presentes + cliente si admin) para el botón del resumen.
- Conserva el guard actual `manejarEnvio` (bloqueo de envío con toast si falta alguna selección).
- Sigue recibiendo los mismos props desde `CreateTurnoModal` (session, state, formAction, sessionId,
  servicios, usuarios, selecciones, handlers, onCancelar) — `useDatosFormularioTurno` y
  `useCrearTurno` quedan intactos.

### B.4.5. Cambios menores

- **`src/components/ui/boton-submit-form-status.tsx`**: agregar prop opcional
  `deshabilitado?: boolean` → `disabled={pending || deshabilitado}`. Cambio no rompe otros usos.
- **`src/components/turno/CreateTurnoModal.tsx`**: solo ampliar `maxWidth` del modal
  (p. ej. `max-w-5xl`). El resto queda igual.

## B.5. Lógica que se conserva intacta (NO tocar)

- `useDatosFormularioTurno` (estado de selección + filtrado cruzado + handlers), `useCrearTurno`,
  `useConfiguracionTurno`, `useSlotLocks`, `useSessionId`.
- Server actions de turnos: `createTurno`, `obtenerDiasDisponibles`, `obtenerHorariosDisponibles`.
- `obtenerDatosReserva` y `/api/configuracion-turno`.
- `SelectorBarberoTarjetas` y `SeccionBarbero` (tarjeta actual del barbero).
- `ModalPagoTurno`, `usePagoTurno`, Mercado Pago, emails.

## B.6. Lo que NO se modifica (explicitamente fuera de alcance)

- Backend, Prisma (`schema.prisma`), consultas (`lib/consultas/`), server actions de turnos.
- Pagos (Mercado Pago), emails, auth.
- La tarjeta del barbero (`SelectorBarberoTarjetas`, `SeccionBarbero`).
- Otros modales y páginas ajenas a este flujo.
- No se instalan dependencias nuevas. No se crean tests (no hay framework).

## B.7. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `src/components/turno/SeccionServicio.tsx` | **REESCRIBIR** — `<select>` → tarjetas de servicio + hidden `servicioId` |
| `src/components/turno/SeleccionadorHorario.tsx` | **MODIFICAR** — presentacional (recibe por props el estado de disponibilidad) |
| `src/components/turno/GrillaCalendario.tsx` | **MODIFICAR** — acentos `#E8B031` → `var(--page-primary)` |
| `src/components/turno/DiaCalendario.tsx` | **MODIFICAR** — acentos `#E8B031` → `var(--page-primary)` |
| `src/components/turno/ListaHorarios.tsx` | **MODIFICAR** — acentos `#E8B031` → `var(--page-primary)` |
| `src/components/turno/ResumenTurno.tsx` | **NUEVO** — sidebar de resumen + CONFIRMAR/Cancelar |
| `src/components/turno/SeccionConfirmacion.tsx` | **NUEVO** — sección final (reutiliza `SeccionCliente`) |
| `src/components/turno/FormularioTurno.tsx` | **REESCRIBIR** — layout 2 columnas + sube `useDisponibilidadHorarios` |
| `src/components/turno/CreateTurnoModal.tsx` | **MODIFICAR** — ampliar ancho del modal |
| `src/components/ui/boton-submit-form-status.tsx` | **MODIFICAR** — prop opcional `deshabilitado` |
| `src/components/turno/SeccionBarbero.tsx` / `SelectorBarberoTarjetas.tsx` | **NO se tocan** (tarjeta actual del barbero) |
| `src/components/turno/SeccionCliente.tsx` | **REUTILIZAR** (dentro de `SeccionConfirmacion`) |

## B.8. Verificación (obligatoria al terminar)

1. `npx tsc --noEmit` = **0 errores** (el build NO typechequea; obligatorio AGENTS.md).
2. `npm run lint`.
3. Revisión manual:
   - **Render**: el modal muestra las 4 secciones + sidebar de resumen; el sidebar se actualiza en
     tiempo real al seleccionar servicio, barbero, fecha y hora.
   - **Filtrado cruzado**: al cambiar de barbero se actualizan servicios, días y horarios; no se
     muestran servicios que el barbero no realiza (relaciones).
   - **Tarjeta del barbero**: intacta (diseño actual, avatar, fallback, check).
   - **Calendario/horarios**: acento de selección = color primario de la BD; los horarios ocupados
     / bloqueados por otro usuario siguen ocultándose o mostrándose bloqueados.
   - **Resumen**: servicio (duración/precio), barbero, fecha y hora, total — correctos.
   - **Confirmación**: el botón CONFIRMAR TURNO queda deshabilitado hasta tener servicio + barbero +
     fecha + hora (y cliente si admin); el `createTurno` recibe los IDs reales por FormData.
   - **Responsive**: desktop (2 columnas con sidebar fijo) y mobile (apilado).
   - **Sin regresiones**: pago (seña / pagar después), edición de turnos y resto del sistema intactos.
4. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300),
   imports `@/`, sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía
   `var(--page-*)` sin hex de marca hardcodeado, contraste según `src/lib/contraste.ts`.

## B.9. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. **Fase con 3 sub-tareas** (AGENTS.md §"Uso de subagentes": desglose obligatorio + paralelización):
   - **B-A**: `SeccionServicio` (tarjetas) + `SeccionConfirmacion` (nueva).
   - **B-B**: colores de `GrillaCalendario` / `DiaCalendario` / `ListaHorarios` + refactor
     presentacional de `SeleccionadorHorario`.
   - **B-C** (después de A y B, las integra): `ResumenTurno` (nuevo), `FormularioTurno`
     (layout + subir `useDisponibilidadHorarios`), `CreateTurnoModal` (ancho) y
     `boton-submit-form-status` (prop `deshabilitado`).
2. B-A y B-B pueden correr **en paralelo** (archivos disjuntos). B-C se lanza al recibir sus
   interfaces (definidas en §B.4). La orquestación y las interfaces entre sub-tareas las define el
   agente principal (AGENTS.md, punto 5).
3. **Agente verificador** (3 o más subagentes → verificador obligatorio): revisa TODO el código
   producido en la fase (reglas de §B.8.4, contraste, límites de líneas, 1 export por archivo,
   archivos fuera de límites, tarjeta de barbero intacta), repara fallas y **certifica** el pendiente.
4. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
5. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en
   `AUDITORIA.md` si el usuario lo confirma).

---

# APÉNDICE C — PENDIENTE NUEVO: Flujo de turnos (USER vs ADMIN), estado de pago de la seña, calendario tras ícono y completar perfil (registrado 28-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo del ciclo de ordenamiento (Fases 9-15) y a los Apéndices A y B como un
> pendiente NUEVO e independiente. No forma parte de las Fases 9-15. Los números de línea citados
> fueron **verificados contra el repo el 28-ago-2026** y pueden desplazarse: **verificar la línea
> exacta antes de editar** (regla transversal §5.11).
>
> **Estado: APROBADO en plan por el usuario el 28-ago-2026** (decisiones en §C.3).
> **Aún NO implementado.**

## C.1. Objetivo

Modificar el flujo de creación de turnos para separar claramente dos caminos —usuarios (`USER`)
y administración (`ADMIN`)—, agregar el **estado de pago de la seña** como dato modelado, hacer que
el calendario de reserva se **despliegue al hacer clic en un ícono** (mostrando solo días con
disponibilidad real) y ajustar el **flujo de completar perfil** al iniciar sesión. Todo reutilizando
la lógica existente (disponibilidad, Mercado Pago, WhatsApp, emails, locks) sin duplicar código.

## C.2. Contexto actual (verificado el 28-ago-2026)

### C.2.1. Rutas y flujo de turnos

- **No existe `/admin/turno`.** El admin gestiona turnos en `/turno` (el layout
  `src/app/turno/layout.tsx` envuelve en `AdminShell` solo si `role === "ADMIN"`). El middleware
  (`src/middleware.ts`) protege `/turno` (login) y redirige a `/dashboard` si el usuario no tiene
  `telefono` (§C.2.4).
- **`src/app/turno/page.tsx`** (server) carga `obtenerDatosReserva(true)` (servicios, barberos,
  usuarios, relaciones, config) + `getTurnos` y renderiza `TurnoManager`.
- **`src/components/turno/gestion/TurnoManager.tsx`** (168 líneas): lista + filtros +
  `ModalGestionTurno` (botón "Nuevo Turno"). Compartido entre USER y ADMIN.
- **Flujo de creación** (componentes de `src/components/turno/reserva/`):
  `ModalGestionTurno` → `FormularioReservaTurno` → `PanelBarberoServicio` + `PanelFechaHorario`
  (calendario siempre visible) + `ResumenReserva`. Estado levantado en
  `useFormularioTurno` (`src/hooks/`) que combina `useDatosFormularioTurno` + `usePagoTurno`.
- **Server action `createTurno`** (`src/actions/turnos/crear.actions.ts`): crea el turno con
  `estado: PENDIENTE`, congela `precioCongelado`/`seniaCongelada` desde el servicio, valida
  disponibilidad (márgenes, excepciones, choques, locks, anticipación 10 min) y envía emails
  "CREADO" al cliente y al barbero.
- **Edición**: `actualizarTurno` (`src/actions/turnos/estado.actions.ts`); **confirmación rápida**:
  `confirmarTurno` (`src/actions/turnos/confirmar.actions.ts`, solo admin); **completar**:
  `completedTurno`; **cancelar**: `cancelTurno`.

### C.2.2. Modelo de datos (Prisma, `prisma/schema.prisma`)

- `turno_estado` enum: `PENDIENTE`, `CONFIRMADO`, `COMPLETADO`, `CANCELADO`. Hoy `CONFIRMADO`
  significa "seña pagada" (lo setea el webhook de MP).
- `servicio.senia` (Decimal) = valor de la seña; `turno.seniaCongelada` = seña congelada al crear.
- **No existe ningún estado de pago de la seña** modelado (no hay enum/campo para Pendiente/Señado/
  Pagado por separado).

### C.2.3. Mercado Pago, WhatsApp y emails

- **MP**: `crearPreferenciaPago` (`src/actions/mercadopago/crear-preferencia.actions.ts`) cobra SOLO
  la seña (`seniaCongelada`), expira en 5 min, usa `external_reference = turnoId` y `notification_url
  = /api/mercadopago/webhook`. El webhook valida la firma `X-Signature` (`MP_WEBHOOK_SECRET`) y
  confirma vía helper único **`confirmarTurnoPorPago`** (`src/lib/confirmar-turno-por-pago.ts`):
  `status=approved`, `external_reference === turnoId`, monto ≥ seña, idempotencia (`yaConfirmado`).
  Respaldado por `back_url` `/pago/success` → `confirmarPagoTurno`. Ya NO se confía en la vuelta del
  usuario (webhook primero).
- **WhatsApp**: el número vive en `PageConfig.whatsapp` (configurado en `/admin/config`, sección
  contacto → `SeccionContacto.tsx`). `RedireccionWhatsApp` (`src/components/pago/`) ya arma el
  mensaje, pero **no se usa** en ninguna página. `usePagoTurno.enviarMensajeWhatsApp` solo se usa en
  "Pagar después" (mensaje mínimo).
- **Emails**: `src/lib/email/` con Resend. `createTurno` envía "CREADO" al cliente
  (`enviarEmailTurnoSeguro`) y al barbero (`enviarEmailTurnoBarberoSeguro`, solo si `barbero.email`).
  Al confirmar (webhook/back_url/confirmación admin) se envían "CONFIRMADO". El template
  `EmailTurno.tsx` ya incluye cliente, servicio, barbero, fecha, hora, precio total, seña y saldo.

### C.2.4. Completar perfil al iniciar sesión

- El middleware redirige `/turno` → `/dashboard` si `!req.auth?.user?.telefono`.
- `DashboardPanel` muestra un modal obligatorio de teléfono solo si `!user.telefono` (valida contra
  BD, no frontend). Al guardar, `updateProfile` + `useSession().update()` refrescan el JWT.
- **Bug detectado**: `authorize` en `src/auth.ts` devuelve `{ id, name, email, role }` SIN `telefono`.
  Tras login por credentials el token JWT queda sin `telefono` y el middleware bloquea a usuarios que
  YA tienen teléfono (los manda a `/dashboard` y no pueden entrar a `/turno`).

### C.2.5. Disponibilidad y calendario

- `obtenerDiasDisponibles` / `obtenerHorariosDisponibles` (`src/actions/turnos/`) envuelven con caché
  a `obtenerDisponibilidad` (`src/lib/disponibilidad.ts`): márgenes por barbero/día, excepciones,
  choques de turnos, anticipación mínima, granularidad 15 min.
- El calendario del modal (`CalendarioReserva` + `DiaCalendarioReserva`) YA deshabilita días sin
  slots y muestra solo los horarios libres (`ListaHorariosReserva`). Está **siempre visible**
  (sin ícono de apertura). El filtro de la lista de turnos del admin usa un date nativo
  (`NavegacionFecha`), ajeno a la disponibilidad.

## C.3. Decisiones del usuario (registradas el 28-ago-2026 — NO reversibles sin confirmación)

1. **Ruta admin de turnos: crear `/admin/turno` NUEVA.** Reutiliza `TurnoManager`/
   `ModalGestionTurno`; `/turno` queda para rol `USER`. (Respuesta a la consulta de ambigüedad.)
2. **Estado de pago de la seña: NUEVO campo `estadoPago`** con enum
   `estado_pago { PENDIENTE SEÑADO PAGADO }` en el modelo `turno` (default `PENDIENTE`),
   conservando `turno_estado` como ciclo de vida. Requiere migración Prisma.
3. **Calendario: oculto tras ícono.** El calendario de reserva NO está siempre visible: se despliega
   grande al hacer clic en un ícono/triggers de fecha, mostrando días disponibles habilitados y días
   sin disponibilidad deshabilitados.

## C.4. Diseño de la solución

### C.4.1. Modelo Prisma (con migración)

- `prisma/schema.prisma` — modelo `turno`: agregar
  `estadoPago estado_pago @default(PENDIENTE)` y el enum
  `enum estado_pago { PENDIENTE SEÑADO PAGADO }`. Compatible con datos existentes (los turnos
  actuales quedan `PENDIENTE`).
- Migración: `npx prisma migrate dev --name turno_estado_pago` (o `prisma db push`; el build ya
  corre `db push --accept-data-loss`).
- Semántica: `PENDIENTE` (sin seña, `estado=PENDIENTE`) · `SEÑADO` (seña abonada,
  `estado=CONFIRMADO`) · `PAGADO` (pago total, `estado=CONFIRMADO`).

### C.4.2. Ruta `/admin/turno`

- **Crear `src/app/admin/turno/page.tsx`** (server): `obtenerDatosReserva(true)` + `getTurnos` +
  `TurnoManager`. El `admin/layout.tsx` ya autentica (ADMIN) y envuelve en `AdminShell`.
- **`src/app/turno/layout.tsx`**: si `role === "ADMIN"` → `redirect("/admin/turno")`.
- **`src/app/turno/page.tsx`**: usar `obtenerDatosReserva(false)` (no listar usuarios a clientes);
  guard de redirect a `/admin/turno` para ADMIN.
- **Navegación**: `items-navegacion.ts` ("Turnos" → `/admin/turno`), `AdminTopbar.tsx`
  (botón "Turnos" → `/admin/turno`), StatCard de `app/admin/page.tsx` (href → `/admin/turno`).

### C.4.3. Flujo `/turno` (rol USER)

1. **Cliente autocompletado**: `useDatosFormularioTurno` ya setea `selectedUserId = session.user.id`
   para USER. Se agrega en `ResumenReserva` una fila "Cliente" de SOLO lectura (nombre + teléfono del
   usuario autenticado); sin selector editable. En `createTurno` (backend): validar que el USER tenga
   `telefono` y que `userId === session.user.id` (no confiar en el frontend).
2. **Resumen del turno**: `ResumenReserva` muestra además **Seña** (`servicio.senia`, o
   `seniaCongelada` en edición) y **Saldo restante** (`precio − seña`), además de Servicio, Barbero,
   Fecha, Hora y Total.
3. **Confirmación y MP** (existe, se ajusta):
   - `createTurno` agrega **guard anti-duplicado**: si ya existe un turno `PENDIENTE` con el mismo
     `userId + barberoId + horarioReservado` creado recientemente, devolver ese en vez de crear otro
     (evita doble submit / refresh / doble checkout).
   - `crearPreferenciaPago`: rechazar si `turno.estadoPago !== "PENDIENTE"` (no pagar dos veces).
   - El turno NO queda confirmado hasta que MP acredite (webhook con firma + back_url); ya no se
     confía solo en la vuelta del usuario.
4. **WhatsApp post-pago**: en `src/app/pago/success/page.tsx` (y el bloque de éxito de
   `/pago/status`), tras confirmar el pago, renderizar `RedireccionWhatsApp` con:
   - número desde `PageConfig.whatsapp` vía `obtenerConfigCacheada()` (nunca hardcodeado);
   - datos del turno confirmado (cliente, servicio, barbero, fecha, hora, precio total, seña, saldo).
   - Ampliar `RedireccionWhatsApp` con props `precioTotal`, `señaPagada`, `saldoPendiente`.

### C.4.4. Flujo `/admin/turno` (rol ADMIN)

- **Sin Mercado Pago**: se conserva (el modal ya no muestra pago para admin) y NO hay redirección a
  MP ni WhatsApp al confirmar.
- **Selector de estado de pago** (`Pendiente` / `Señado` / `Pago`) en el formulario cuando `esAdmin`:
  nuevo componente `SelectorEstadoPago.tsx`.
- **`createTurno`** acepta `estadoPago` (validado en backend contra el enum; solo admin). Si
  `SEÑADO`/`PAGADO` → `estado=CONFIRMADO` y emails "CONFIRMADO" (cliente + barbero); si `PENDIENTE` →
  comportamiento actual ("CREADO"). Sin duplicar emails.
- **Edición**: `actualizarTurno` acepta `estadoPago`; al pasar a `CONFIRMADO` envía el email de
  barbero "CONFIRMADO" (lógica ya existente). Botón rápido **Confirmar** (`confirmarTurno`): además
  de `estado=CONFIRMADO`, setea `estadoPago=SEÑADO`.
- **Visualización**: nuevo badge de `estadoPago` (`BadgeEstadoPago.tsx`) en `TurnoRow`.

### C.4.5. Calendario oculto tras ícono

- Nuevo componente `SelectorFechaCalendario.tsx` (en `components/turno/reserva/`): campo compacto
  con ícono de calendario y la fecha seleccionada; al hacer clic despliega el calendario grande
  (`CalendarioReserva` REUTILIZADO tal cual), que ya deshabilita días sin disponibilidad
  (`diasDisponibles`) y habilita solo días con turnos reales.
- `PanelFechaHorario` reemplaza el calendario siempre visible por este trigger. Se conservan
  `ListaHorariosReserva` y la lógica de slots (sin duplicar disponibilidad: se sigue usando
  `obtenerDiasDisponibles` / `obtenerHorariosDisponibles`). Al seleccionar un día disponible se
  muestran únicamente los horarios libres de ese día (regla actual intacta).

### C.4.6. Completar perfil

- **`src/auth.ts`**: incluir `telefono: user.telefono` en el objeto devuelto por `authorize`.
- **`src/auth.config.ts`**: en el callback `jwt`, si `token.id` existe y `token.telefono` es
  null/undefined, hidratar desde BD (corrige sesiones existentes con token viejo).
- Resultado: usuario sin teléfono → tras login `/turno` redirige a `/dashboard` (modal obligatorio
  validado contra BD); usuario con teléfono → `/turno` directo sin pedir el dato otra vez. Funciona
  tras cerrar sesión y volver a iniciar sesión (login por credentials y por Google).

### C.4.7. Correo al barbero

- Ya implementado (Resend, `barbero.email` de la BD, sin hardcodear) en creación ("CREADO") y
  confirmación ("CONFIRMADO") para ambos flujos. Solo se ajusta el estado del email según
  `estadoPago` en creación (§C.4.4). Sin correos duplicados (el email se envía UNA vez por evento;
  el edit solo envía "CONFIRMADO" al barbero si el estado pasó a CONFIRMADO).

### C.4.8. Validación en backend (no confiar en el frontend)

- Precio/seña: `servicio.precio` / `servicio.senia` de BD (ya así en `createTurno`).
- Usuario: `requerirSesion` + `requerirPropietarioOAdmin` / `requerirAdmin`.
- Disponibilidad: `obtenerContextoDeReserva` + `obtenerDisponibilidad` (ya así).
- `estadoPago`: validado contra el enum en la server action.
- Pago: webhook con firma + consulta a la API de MP (`Payment.get`).
- Duplicados: guard en `createTurno` + `estadoPago` en `crearPreferenciaPago` + idempotencia del
  webhook (`yaConfirmado`).

## C.5. Tipos, constantes y serialización

- `src/lib/constants.ts`: `ESTADOS_PAGO = ["PENDIENTE", "SEÑADO", "PAGADO"]`.
- `src/types/turno.ts`: agregar `estadoPago` a `TurnoListado`, `TurnoConDetalle`,
  `TurnoPagoConfirmado`, `TurnoCreado` (y al tipo de estado).
- `src/actions/turnos/listar.actions.ts` y `src/actions/sesion/listar-turnos-usuario.actions.ts`:
  serializar `estadoPago`.
- `BadgeEstadoTurno.tsx` / nuevo `BadgeEstadoPago.tsx` en `components/turno/gestion/`.

## C.6. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `prisma/schema.prisma` + migración | **MODIFICAR** — campo `estadoPago` + enum `estado_pago` |
| `src/app/admin/turno/page.tsx` | **NUEVO** — página de turnos del admin (reutiliza `TurnoManager`) |
| `src/app/turno/layout.tsx` / `page.tsx` | **MODIFICAR** — redirect ADMIN a `/admin/turno`; `obtenerDatosReserva(false)` |
| `src/components/panel/navegacion/items-navegacion.ts` / `AdminTopbar.tsx` | **MODIFICAR** — "Turnos" → `/admin/turno` |
| `src/app/admin/page.tsx` | **MODIFICAR** — StatCard "Total Turnos" → `/admin/turno` |
| `src/actions/turnos/crear.actions.ts` | **MODIFICAR** — `estadoPago`, validación telefono/USER, guard anti-duplicado, emails según estado |
| `src/actions/turnos/estado.actions.ts` | **MODIFICAR** — aceptar `estadoPago` en edición |
| `src/actions/turnos/confirmar.actions.ts` | **MODIFICAR** — setear `estadoPago=SEÑADO` |
| `src/actions/mercadopago/crear-preferencia.actions.ts` | **MODIFICAR** — rechazar si `estadoPago !== PENDIENTE` |
| `src/lib/confirmar-turno-por-pago.ts` | **MODIFICAR** — setear `estadoPago=SEÑADO` al confirmar |
| `src/lib/constants.ts` / `src/types/turno.ts` | **MODIFICAR** — `ESTADOS_PAGO` + tipos |
| `src/actions/turnos/listar.actions.ts` / `src/actions/sesion/listar-turnos-usuario.actions.ts` | **MODIFICAR** — serializar `estadoPago` |
| `src/components/turno/reserva/SelectorFechaCalendario.tsx` | **NUEVO** — trigger de ícono + calendario desplegable |
| `src/components/turno/reserva/PanelFechaHorario.tsx` | **MODIFICAR** — usar el trigger |
| `src/components/turno/reserva/ResumenReserva.tsx` | **MODIFICAR** — fila Cliente (USER, solo lectura), Seña, Saldo restante; selector `estadoPago` (admin) |
| `src/components/turno/reserva/SelectorEstadoPago.tsx` | **NUEVO** — selector Pendiente/Señado/Pago (admin) |
| `src/components/turno/reserva/FormularioReservaTurno.tsx` / `tipos.ts` | **MODIFICAR** — props/estado de `estadoPago` + hidden input |
| `src/hooks/useDatosFormularioTurno.ts` / `useFormularioTurno.ts` | **MODIFICAR** — estado `estadoPago` |
| `src/components/turno/gestion/BadgeEstadoTurno.tsx` / `TurnoRow.tsx` | **MODIFICAR** — badge de pago |
| `src/components/turno/gestion/BadgeEstadoPago.tsx` | **NUEVO** |
| `src/components/pago/RedireccionWhatsApp.tsx` | **MODIFICAR** — `precioTotal`, `señaPagada`, `saldoPendiente` |
| `src/app/pago/success/page.tsx` (y bloque de éxito de `/pago/status`) | **MODIFICAR** — WhatsApp post-pago con número de `page_config` |
| `src/auth.ts` / `src/auth.config.ts` | **MODIFICAR** — `telefono` en `authorize` + hidratación del token |

## C.7. Lógica que se conserva intacta (NO tocar)

- Disponibilidad: `obtenerDisponibilidad`, `obtenerDiasDisponibles`, `obtenerHorariosDisponibles`,
  `obtenerContextoDeReserva`, `useDisponibilidadHorarios`, `useSlotLocks`, locks.
- Mercado Pago: `obtenerClienteMP`, `confirmarTurnoPorPago` (helper único), webhook, `back_url`.
- Emails: `src/lib/email/` (Resend) y templates.
- Config de WhatsApp: `PageConfig.whatsapp` (única fuente) y `SeccionContacto.tsx`.
- `NavegacionFecha` (filtro de fecha de la lista): NO se toca (no aplica disponibilidad).
- Sistema de color y contraste (`var(--page-*)`, `src/lib/contraste/`).

## C.8. Verificación (obligatoria al terminar)

1. `npx tsc --noEmit` = **0 errores** (el build NO typechequea; obligatorio AGENTS.md).
2. `npm run lint`.
3. `npm run build` OK.
4. Revisión manual:
   - **Flujo USER (`/turno`)**: cliente autocompletado (sin selector), resumen con seña y saldo,
     confirmación → MP por la seña → webhook/back_url → estado CONFIRMADO + `estadoPago=SEÑADO` →
     redirección a WhatsApp con mensaje completo al número de `page_config`. Sin turnos/pagos
     duplicados al recargar.
   - **Flujo ADMIN (`/admin/turno`)**: sin MP; selector de pago (Pendiente/Señado/Pago); el turno se
     guarda con el estado elegido; email al barbero al confirmar.
   - **Calendario**: se abre al hacer clic en el ícono; solo días con disponibilidad habilitados;
     horarios del día disponibles al elegirlo.
   - **Completar perfil**: usuario sin teléfono → redirige a completarlo tras login; con teléfono →
     acceso directo (login por credentials y por Google, y tras logout/login).
   - **Sin regresiones**: edición/cancelación/completar turnos, dashboard, cron de expiración,
     sistema de color.
5. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300), imports `@/`,
   sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía `var(--page-*)` sin hex de
   marca hardcodeado, contraste según `src/lib/contraste.ts`.

## C.9. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. **Fase con sub-tareas** (desglose obligatorio + paralelización):
   - **C-A**: Prisma (`estado_pago` + migración) + tipos/constantes + serialización en listados +
     backend (`createTurno`, `actualizarTurno`, `confirmarTurno`, `crearPreferenciaPago`,
     `confirmarTurnoPorPago`) + fix de auth (`authorize`/`jwt`).
   - **C-B** (independiente, paralelo): UI de reserva — `SelectorFechaCalendario` (ícono + calendario
     desplegable), `PanelFechaHorario`, `ResumenReserva` (cliente read-only, seña/saldo,
     `SelectorEstadoPago`), `FormularioReservaTurno`/`tipos`, hooks de formulario, `BadgeEstadoPago`
     + `TurnoRow`.
   - **C-C** (independiente, paralelo): rutas y navegación — `/admin/turno` (página nueva),
     redirects en `/turno`, `items-navegacion`, `AdminTopbar`, StatCard de `/admin`, WhatsApp
     post-pago en `/pago/success` (+ bloque de éxito de `/pago/status`) y `RedireccionWhatsApp`.
   - La orquestación y las interfaces entre sub-tareas las define el agente principal (AGENTS.md,
     punto 5). B y C dependen de la interfaz de `createTurno`/tipos de C-A (coordinación previa).
2. **Agente verificador** (3 o más subagentes → verificador obligatorio): revisa TODO el código de la
   fase (reglas de §C.8.5, límites de líneas, 1 export por archivo, contraste, schema/migración,
   redirects, no-duplicación de turnos/pagos/emails), repara fallas y **certifica** el pendiente.
3. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en `AUDITORIA.md`
   si el usuario lo confirma).

---

# APÉNDICE D — PENDIENTE NUEVO: Corrección del "calendario tras ícono" — revertir el modal de reserva y aplicarlo al calendario de navegación de `/admin/turno` (registrado 29-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo (Fases 9-15) y a los Apéndices A, B y C como un pendiente NUEVO que
> CORRIGE un alcance mal entendido del Apéndice C. No forma parte de las Fases 9-15.
>
> **Estado: APROBADO en plan por el usuario el 29-ago-2026** (decisiones en §D.3).
> **Aún NO implementado.**

## D.1. Objetivo

Corregir el alcance de la funcionalidad "calendario tras ícono" del Apéndice C (§C.4.5). El
Apéndice C se implementó y certificó (V-C) con el calendario desplegable aplicado al **modal de
reserva de turnos** (`PanelFechaHorario` → `SelectorFechaCalendario`). El usuario aclaró que esa
funcionalidad NO era para el modal de reserva, sino para el **calendario de navegación de fechas de
`/admin/turno`** (el de la parte superior de la gestión de turnos, con flechas ‹ ›, ícono 📅 y botón
"Hoy").

Resultado buscado:
1. **REVERTIR** el modal de reserva de turnos a su estado original (calendario siempre visible).
2. Aplicar el calendario grande tras ícono al **calendario de navegación** de `/admin/turno`.

El resto de las modificaciones del Apéndice C (pago de seña con Mercado Pago para `/turno`, estado
de seña en `/admin/turno`, WhatsApp post-pago, email al barbero y validación del teléfono del
usuario) **se mantienen** sin cambios.

## D.2. Contexto actual (verificado el 29-ago-2026)

### D.2.1. Los dos calendarios y cuál corresponde a cada flujo

| Calendario | Archivo | Flujo | Estado actual |
|---|---|---|---|
| **Calendario de RESERVA** ("Nuevo Turno") | `src/components/turno/reserva/PanelFechaHorario.tsx` → `CalendarioReserva` + `DiaCalendarioReserva` + `ListaHorariosReserva` | Modal `ModalGestionTurno` → `FormularioReservaTurno` (clientes `USER` y `ADMIN`) | Fue modificado por C-B: hoy se despliega tras ícono vía `SelectorFechaCalendario.tsx`. **HAY QUE REVERTIRLO** a calendario siempre visible. |
| **Calendario de NAVEGACIÓN** de `/admin/turno` | `src/components/turno/gestion/NavegacionFecha.tsx` | Parte superior de la gestión de turnos (`TurnoManager`, compartido por `/turno` y `/admin/turno`) | Hoy: flechas ‹ › (día anterior/siguiente), botón con ícono 📅 + `<input type="date">` nativo oculto (picker del navegador) y botón "Hoy". **ESTE es el que hay que modificar** (reemplazar el date nativo por un calendario grande con solo días habilitados). |

> IMPORTANTE para futuros subagentes: NO volver a confundir ambos componentes. El calendario de
> reserva NO se modifica; el de navegación de `/admin/turno` SÍ.

### D.2.2. Estado del Apéndice C en el repo (29-ago-2026, sin commit)

- Implementado y certificado (V-C): `estadoPago` (schema + enum `estado_pago`), `ESTADOS_PAGO`
  (`lib/constants.ts`), backend (`createTurno`, `actualizarTurno`, `confirmarTurno`,
  `crearPreferenciaPago`, `confirmarTurnoPorPago`), fix auth, `/admin/turno`, WhatsApp post-pago,
  `BadgeEstadoPago`, seña/saldo y cliente read-only en `ResumenReserva`.
- El cambio a revertir es SOLO el de C-B sobre el calendario de reserva: `SelectorFechaCalendario.tsx`
  (archivo nuevo) + `PanelFechaHorario.tsx` + `PropsSelectorFechaCalendario` y prop
  `deshabilitado?` en `tipos.ts`.

## D.3. Decisiones del usuario (registradas el 29-ago-2026 — NO reversibles sin confirmación)

1. **Revertir el modal de reserva**: el calendario vuelve a estar SIEMPRE visible
   (`CalendarioReserva`), exactamente como antes del Apéndice C. NO se tocan el diseño del modal, la
   estructura del formulario, la selección de servicio/barbero/horario, la distribución de campos ni
   el comportamiento visual original. NO se elimina ninguna otra modificación de C (estadoPago,
   seña/saldo, cliente read-only, selector de estado de pago, badge, WhatsApp, emails, teléfono).
2. **Calendario de `/admin/turno`**: al hacer click en el ícono 📅 se despliega un calendario grande
   que permite seleccionar una fecha.
3. **Días habilitados = "días con turnos"** en la BD, respetando:
   - el **rol** de la sesión (admin → todos los turnos; `USER` → solo sus turnos, igual que la lista);
   - el **filtro de estado** seleccionado en `TurnosFiltros` (TODOS → sin filtro de estado;
     PENDIENTE/CONFIRMADO/COMPLETADO/CANCELADO → solo turnos con ese estado).
4. **Días pasados deshabilitados** (solo se habilitan días de hoy en adelante que tengan turnos),
   igual que el comportamiento del calendario de reserva actual.
5. Al seleccionar un día habilitado, la pantalla **muestra los turnos de esa fecha**
   (`onCambiarFecha` de `NavegacionFecha`); el popup se cierra.
6. Se conservan las **flechas anterior/siguiente** y el botón **"Hoy"** tal como funcionan hoy.
7. El cambio afecta **solamente** al calendario de navegación de fechas de `TurnoManager`
   (visible en `/admin/turno` y, por compartir componente, en `/turno` para `USER`). NO afecta al
   calendario de reserva.

## D.4. Diseño de la solución

### D.4.1. Parte 1 — Revertir el calendario del modal de reserva (solo calendario)

| Archivo | Acción |
|---|---|
| `src/components/turno/reserva/PanelFechaHorario.tsx` | **REVERTIR** a la versión original de HEAD: renderiza `<CalendarioReserva ...>` **siempre visible** (con `mesVisible`, `diasDisponibles`, `cargandoDias`, `fecha`, `onMesAnterior`, `onMesSiguiente`, `onSeleccionarDia`) + `<ListaHorariosReserva>`; SIN prop `deshabilitado`. |
| `src/components/turno/reserva/SelectorFechaCalendario.tsx` | **ELIMINAR** (archivo creado por C-B; su único consumidor era `PanelFechaHorario`). |
| `src/components/turno/reserva/tipos.ts` | **REVERTIR** `PropsPanelFechaHorario` a `{ disponibilidad; servicioId?; barberoId? }` (quitar `deshabilitado?: boolean`) y **eliminar** el tipo `PropsSelectorFechaCalendario`. |

- NO se tocan: `FormularioReservaTurno` (no pasa `deshabilitado` a `PanelFechaHorario`),
  `ResumenReserva`, `SelectorEstadoPago`, `ModalGestionTurno`, `useDatosFormularioTurno`,
  `useFormularioTurno`, `BadgeEstadoPago`, `TurnoRow`, backend ni auth.

### D.4.2. Parte 2 — Calendario grande en `/admin/turno` (NavegacionFecha)

1. **NUEVO server action** `src/actions/turnos/obtener-dias-con-turnos.actions.ts`
   (1 export, ≤100 líneas): `obtenerDiasConTurnos(mes: string, estadoFiltro?: string)` → devuelve
   `ActionState<string[]>` con las fechas "yyyy-MM-dd" (en `ZONA_HORARIA`, vía `obtenerFechaSola`)
   que tienen turnos. Filtro: `horarioReservado` dentro del mes (`yyyy-MM`); si NO es admin →
   `userId = session.user.id`; si `estadoFiltro` está definido y es distinto de `"TODOS"` →
   `estado = estadoFiltro` (misma lógica de scope/estado que `getTurnos`).
2. **NUEVO componente** `src/components/turno/gestion/CalendarioNavegacion.tsx`
   ("use client", 1 export, ≤200 líneas): grilla mensual que **REUTILIZA `CalendarioReserva`**
   (de `components/turno/reserva/`, SIN modificarlo) pasándole `diasDisponibles = días con turnos`
   del mes visible, `fecha` = la fecha del filtro actual, `cargandoDias` mientras se consulta la
   action y `onSeleccionarDia`. `CalendarioReserva`/`DiaCalendarioReserva` ya deshabilitan días
   pasados y días sin disponibilidad (requisito §D.3.4). Maneja el mes visible (inicializado desde la
   fecha filtrada o hoy) y refetch al cambiar de mes o de filtro de estado.
3. **MODIFICAR** `src/components/turno/gestion/NavegacionFecha.tsx`: agregar prop nueva
   `estado?: string`; reemplazar el `<input type="date">` nativo (overlay sobre el botón del ícono 📅)
   por un botón que alterna un **popup** (estado local `abierto`; panel absoluto con
   `bg-[var(--admin-surface-elevated)]`, borde `--admin-border`, `rounded-xl`, `shadow`, `z-40`;
   cierre al seleccionar un día, al hacer click afuera o con Escape, patrón de `MenuAccionesTurno`).
   El popup contiene `<CalendarioNavegacion fecha={fecha} estado={estado ?? "TODOS"}
   onSeleccionar={(d) => { onCambiarFecha(d); setAbierto(false); }} />`. Se conservan las flechas
   ‹ › y el botón "Hoy" sin cambios.
4. **MODIFICAR** `src/components/turno/gestion/TurnoManager.tsx`: pasar
   `estado={filtroEstado}` a `<NavegacionFecha ... />`.

## D.5. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `src/components/turno/reserva/PanelFechaHorario.tsx` | **REVERTIR** — calendario siempre visible (HEAD) |
| `src/components/turno/reserva/SelectorFechaCalendario.tsx` | **ELIMINAR** |
| `src/components/turno/reserva/tipos.ts` | **REVERTIR/QUITAR** `PropsSelectorFechaCalendario` y `deshabilitado?` de `PropsPanelFechaHorario` |
| `src/actions/turnos/obtener-dias-con-turnos.actions.ts` | **NUEVO** — días con turnos del mes (rol + filtro de estado) |
| `src/components/turno/gestion/CalendarioNavegacion.tsx` | **NUEVO** — popup de calendario (reutiliza `CalendarioReserva`) |
| `src/components/turno/gestion/NavegacionFecha.tsx` | **MODIFICAR** — popup en click del ícono + prop `estado` |
| `src/components/turno/gestion/TurnoManager.tsx` | **MODIFICAR** — pasar `estado={filtroEstado}` a `NavegacionFecha` |

## D.6. Lo que NO se modifica (explicitamente fuera de alcance)

- **Calendario de reserva** (`CalendarioReserva.tsx`, `DiaCalendarioReserva.tsx`,
  `ListaHorariosReserva.tsx`, `PanelFechaHorario.tsx` final, `SelectorBarberosReserva`,
  `SelectorServiciosReserva`, `SeccionBarbero`/`SeccionServicio` si existieran en este flujo):
  comportamiento original intacto. `CalendarioReserva` solo se REUTILIZA (import) desde el
  calendario de navegación, nunca se edita.
- Todas las demás modificaciones del Apéndice C (estado de pago de la seña, resumen con seña/saldo,
  cliente read-only, `SelectorEstadoPago`, `BadgeEstadoPago`, `/admin/turno`, redirects,
  navegación, WhatsApp post-pago, `RedireccionWhatsApp`, fix de auth, validación de teléfono).
- Backend, Prisma, disponibilidad, pagos, emails, `NavegacionFecha` en su comportamiento de
  flechas/Hoy.
- No se instalan dependencias nuevas. No se crean tests (no hay framework).

## D.7. Verificación (obligatoria al terminar)

1. `npx tsc --noEmit` = **0 errores** (el build NO typechequea; obligatorio AGENTS.md).
2. `npm run lint`.
3. `npx next build` OK (NO `npm run build`: el script corre `prisma db push` contra la BD remota;
   el usuario decidió no migrar la BD en este ciclo).
4. Revisión manual:
   - **Modal de reserva**: el calendario vuelve a verse **siempre visible** en el modal de
     "Nuevo Turno" (y en edición), idéntico a antes del Apéndice C; selección de barbero/servicio/
     fecha/hora y resumen con seña/saldo funcionando; selector de estado de pago presente para admin.
   - **`/admin/turno`**: al hacer click en el ícono 📅 se despliega el calendario grande; solo días
     con turnos (según filtro de estado y rol) habilitados; días pasados y días sin turnos
     deshabilitados; al elegir un día la lista muestra los turnos de esa fecha; flechas ‹ › y botón
     "Hoy" intactos; el popup cierra al seleccionar/click afuera/Escape.
   - **Sin regresiones**: flujo USER `/turno` (cliente autocompletado, MP por seña, WhatsApp),
     edición de turnos, resto del sistema y sistema de color.
5. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300), imports `@/`,
   sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía `var(--page-*)`/`var(--admin-*)`
   sin hex de marca hardcodeado, contraste según `src/lib/contraste.ts`.

## D.8. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. **Fase con 2 sub-tareas** (archivos disjuntos, pueden correr en paralelo):
   - **D-A** (revert): `PanelFechaHorario.tsx` a HEAD, eliminar `SelectorFechaCalendario.tsx` y
     quitar `PropsSelectorFechaCalendario`/`deshabilitado?` de `tipos.ts`.
   - **D-B** (navegación): `obtener-dias-con-turnos.actions.ts` (nuevo), `CalendarioNavegacion.tsx`
     (nuevo, reutiliza `CalendarioReserva`), `NavegacionFecha.tsx` (popup + prop `estado`) y
     `TurnoManager.tsx` (pasa `estado`).
2. **Agente verificador V-D** (revisa TODO el código producido): confirma que el modal de reserva
   quedó idéntico al original (diff vs HEAD de `PanelFechaHorario`/`tipos.ts`, `SelectorFechaCalendario`
   eliminado), que el calendario de navegación NO contaminó el flujo de reserva, reglas de §D.7.5,
   límites de líneas, 1 export por archivo, contraste; repara fallas y **certifica** el pendiente.
3. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en `AUDITORIA.md`
   si el usuario lo confirma).

---

# APÉNDICE E — PENDIENTE NUEVO: Actualización inmediata del listado de turnos al crear un turno (registrado 29-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo (Fases 9-15) y a los Apéndices A, B, C y D como un pendiente NUEVO e
> independiente. No forma parte de las Fases 9-15. Los números de línea citados fueron
> **verificados contra el repo el 29-ago-2026** y pueden desplazarse: **verificar la línea exacta
> antes de editar** (regla transversal §5.11).
>
> **Estado: APROBADO en plan por el usuario el 29-ago-2026** (causa raíz y solución definidas en §E.3).
> **Aún NO implementado.**

## E.1. Objetivo

Cuando un usuario crea un nuevo turno, el turno **se registra correctamente** en la base de datos,
pero **no aparece inmediatamente** en el listado/menú correspondiente; el usuario tiene que
**refrescar manualmente la página** para verlo. Se busca que, una vez creado el turno con éxito,
**la interfaz se actualice automáticamente sin recargar la página**, tanto al crear el turno como al
volver al menú/listado donde deben mostrarse los turnos. **Sin modificar el diseño ni funcionalidades
que funcionan correctamente.**

## E.2. Contexto actual (verificado el 29-ago-2026)

### E.2.1. El listado de turnos

- **`src/components/turno/gestion/TurnoManager.tsx`** (componente cliente, 172 líneas): guarda los
  turnos en **estado local** `const [turnos, setTurnos] = useState(turnosIniciales)`
  (`TurnoManager.tsx:54`). Solo vuelve a consultar `getTurnos` cuando el usuario cambia el filtro de
  estado/fecha o carga más páginas:
  - `reiniciarBusqueda(nuevoEstado, nuevaFecha)` (`TurnoManager.tsx:63`): re-consulta la **página 1**
    respetando los filtros actuales y re-setea `turnos`/`paginaActual`/`totalPaginas`.
  - `cambiarEstado` / `cambiarFecha` (`TurnoManager.tsx:81-91`) delegan en `reiniciarBusqueda`.
- **`TurnoManager`** se renderiza en las dos páginas del listado: `src/app/turno/page.tsx` y
  `src/app/admin/turno/page.tsx` (ambas llaman a `getTurnos(1, "PENDIENTE")` como `turnosIniciales`).

### E.2.2. La creación del turno

- **`src/actions/turnos/crear.actions.ts`** (`createTurno`, server action): crea el turno y en el
  éxito llama a `revalidarCacheTurno(barberoId, fechaSolo, userId)` (`crear.actions.ts:91`).
- **`src/lib/revalidar/revalidar-cache-turno.ts`** (`revalidarCacheTurno`): ejecuta
  `revalidateTag("turnos-...")` / `revalidateTag("turnos-global")` / `revalidatePath("/turno")` /
  `revalidatePath("/admin")`. **Esta invalidación de cache del servidor es CORRECTA** y ya está
  presente. Las páginas son dinámicas (`requerirSesion` usa headers), por lo que un re-render del
  server component trae datos frescos.
- **`src/hooks/useFormularioTurno.ts`** (hook del modal, `useEffect` de éxito, `:56-108`):
  - Rama **edición** (`esEdicion`): `window.location.reload()` (recarga completa).
  - Rama **crear + admin** (`:86-90`): `toast.success(...)` + `router.refresh()`.
  - Rama **crear + usuario** (`:91-92`): `pago.setTurnoCreado(...)`, abre el modal de pago. No
    refresca el listado.
- **`src/components/turno/reserva/ModalGestionTurno.tsx`** (`:59`): invoca `useFormularioTurno({...})`
  con los props recibidos; es el botón "Nuevo Turno" dentro de `TurnoManager` (`TurnoManager.tsx:141`).

### E.2.3. Causa raíz

El listado vive en **estado local** de `TurnoManager`, que se inicializa de `turnosIniciales` con
`useState` y **nunca se re-sincroniza**. La invalidación de cache del servidor
(`revalidarCacheTurno`) refresca el *server component*, pero **no** el estado local del cliente:

- **Crear (admin)** → `router.refresh()` re-renderiza el server page con props nuevas, pero
  `useState(turnosIniciales)` **no se reinicializa** en re-render (solo en el primer mount; y
  `router.refresh()` preserva el estado del cliente). → el turno nuevo no aparece.
- **Crear (usuario)** → no se refresca el listado en absoluto. → el turno nuevo no aparece hasta una
  recarga manual.

**Conclusión:** la cache/invalidación del servidor es correcta; lo que falta es **refrescar el estado
del listado en el cliente** tras crear el turno. La corrección debe re-consultar la página 1 respetando
los filtros actuales, reutilizando `reiniciarBusqueda`.

## E.3. Decisiones del usuario (registradas el 29-ago-2026 — NO reversibles sin confirmación)

1. **No modificar el diseño ni las funcionalidades que funcionan.** El cambio es de actualización de
   datos, no visual. Se reutiliza el helper existente `reiniciarBusqueda`.
2. **Refresco inmediato en la misma página** tras crear el turno, para admin y para usuario.
3. **No tocar la invalidación del servidor** (`revalidarCacheTurno`), que ya es la correcta; se
   complementa con el refresco del estado cliente.
4. La solución debe funcionar **tanto al crear** el turno como **al volver al menú/listado** donde se
   muestran los turnos (navegación ya trae datos frescos por ser server dinámico + revalidate).

## E.4. Diseño de la solución

Enlazar la creación exitosa con un refresco del listado, pasando un callback `onTurnoCreado` desde
`TurnoManager` hasta el modal, y ejecutando `reiniciarBusqueda(filtroEstado, fecha)` al dispararse.

1. **`src/hooks/useFormularioTurno.ts`**
   - Agregar `onTurnoCreado?: () => void` al tipo `ParametrosFormularioTurno` (`:17-20`) y al
     destructuring de la función.
   - En el `useEffect` de éxito, en la rama **crear** (tras el guard anti-doble-submit
     `turnoProcesadoRef` y los resets, antes del `if (esAdmin(session))`), llamar `onTurnoCreado?.()`.
     Se conservan intactos el `toast` + `router.refresh()` del admin y el modal de pago del usuario.

2. **`src/components/turno/reserva/ModalGestionTurno.tsx`**
   - Desestructurar `onTurnoCreado` y pasarlo a la llamada de `useFormularioTurno({ ... , onTurnoCreado })`.

3. **`src/components/turno/gestion/TurnoManager.tsx`**
   - En el `<ModalGestionTurno ... />` (`:141`), pasar
     `onTurnoCreado={() => void reiniciarBusqueda(filtroEstado, fecha)}`.
   - `reiniciarBusqueda` re-consulta la página 1 con los filtros vigentes (cero cambios de diseño).

4. **`src/components/turno/reserva/tipos.ts`** — sin cambios directos: `PropsModalGestionTurno`
   (`:150`) ya extiende `ParametrosFormularioTurno`, por lo que `onTurnoCreado` queda disponible.

> El segundo uso de `ModalGestionTurno` es **`src/components/turno/gestion/MenuAccionesTurno.tsx:76`**,
> que lo abre SOLO en edición (`turnoInicial` presente) → `onTurnoCreado` nunca se dispara allí
> (prop opcional) → sin efectos colaterales.

## E.5. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `src/hooks/useFormularioTurno.ts` | **MODIFICAR** — prop opcional `onTurnoCreado?` + llamada en la rama crear |
| `src/components/turno/reserva/ModalGestionTurno.tsx` | **MODIFICAR** — desestructurar `onTurnoCreado` y pasarlo al hook |
| `src/components/turno/gestion/TurnoManager.tsx` | **MODIFICAR** — pasar `onTurnoCreado` que llama a `reiniciarBusqueda` |

## E.6. Lo que NO se modifica (explicitamente fuera de alcance)

- `createTurno` (`crear.actions.ts`), `revalidarCacheTurno` (`revalidar-cache-turno.ts`), los listados
  del servidor (`getTurnos`, `getUserTurnos`), `useDatosFormularioTurno`, `usePagoTurno`, el modal de
  pago, Mercado Pago, emails, auth y el sistema de color.
- El diseño visual, la estructura del formulario y la distribución de campos del modal.
- No se instalan dependencias nuevas. No se crean tests (no hay framework).

## E.7. Verificación (obligatoria al terminar)

1. `npx tsc --noEmit` = **0 errores** (el build NO typechequea; obligatorio AGENTS.md).
2. `npm run lint`.
3. Revisión manual:
   - **Crear (admin)** en `/turno` o `/admin/turno`: tras confirmar "Nuevo Turno", el turno aparece en
     el listado al instante, sin recargar la página.
   - **Crear (usuario)** en `/turno`: al guardar (pagar seña o "pagar después") y cerrar el modal de
     pago, el turno aparece en el listado al instante.
   - **Filtros respetados**: si el listado tiene un estado/fecha filtrado, el refresco re-consulta con
     ese filtro (el turno aparece solo si coincide); sin romper el scroll infinito.
   - **Vuelta al listado**: navegar a la lista tras crear trae datos frescos (comportamiento ya
     existente, se re-confirma).
   - **MenuAccionesTurno (edición)**: no se dispara `onTurnoCreado` ni recarga el listado.
4. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300), imports `@/`,
   sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía `var(--page-*)` sin hex de marca
   hardcodeado, contraste según `src/lib/contraste.ts`.

## E.8. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. Fase pequeña (3 archivos relacionados): puede ejecutarse con un único subagente implementador que
   reciba este apéndice + AGENTS.md y aplique los 3 cambios de §E.5.
2. **Agente verificador V-E** (las fases tocan código compartido; verificador obligatorio): revisa
   TODO el código producido (reglas de §E.7.4, límites de líneas, 1 export por archivo, que
   `MenuAccionesTurno` no se contamina), repara fallas y **certifica** el pendiente. Gate:
   `npx tsc --noEmit` = 0.
3. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en `AUDITORIA.md`
   si el usuario lo confirma).

---

# APÉNDICE F — PENDIENTE NUEVO: Selección de horarios — horarios ocupados no seleccionables + endurecer condición de carrera al crear turno (registrado 29-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo (Fases 9-15) y a los Apéndices A, B, C, D y E como un pendiente NUEVO e
> independiente. No forma parte de las Fases 9-15. Los números de línea citados fueron
> **verificados contra el repo el 29-ago-2026** y pueden desplazarse: **verificar la línea exacta
> antes de editar** (regla transversal §5.11).
>
> **Estado: APROBADO en plan por el usuario el 29-ago-2026** (decisiones en §F.3).
> **Aún NO implementado.**

## F.1. Objetivo

Asegurar que un horario **ya ocupado por un turno existente** no pueda ser seleccionado por otro
cliente en el flujo de reserva. La corrección cubre cuatro requisitos:

1. **Opción de UX elegida: Opción B (ocultar los horarios ocupados).** Se muestran solo los horarios
   disponibles; los ocupados no se renderizan. Es la opción más clara para el cliente (menos ruido,
   foco en lo que puede elegir) y evita la sobrecarga cognitiva de botones grises + etiquetas
   "No disponible".
2. La disponibilidad se **calcula desde los turnos existentes en la BD**.
3. Un horario ocupado **no puede seleccionarse ni manipulando el frontend** (validación definitiva en
   backend al crear el turno).
4. **Condición de carrera** entre dos clientes reservando el mismo horario: el backend debe validarla
   correctamente antes de confirmar el turno.

## F.2. Contexto actual (verificado el 29-ago-2026)

### F.2.1. Estado actual de la selección de horarios (¡YA CUMPLE los puntos 1-3!)

- **Ocultar ocupados (Opción B) — ya implementado:** `src/lib/disponibilidad.ts` calcula los slots
  (granularidad 15 min, dentro del margen laboral del barbero) y **excluye** los que se solapan con
  un `turno` activo. El filtro es `disponibilidad.ts:70-71`:
  ```ts
  if (!turnosDia.some((t) => slotUTC < addMinutes(t.horarioReservado, t.servicio.duracion)
        && addMinutes(slotUTC, servicio.duracion) > t.horarioReservado)
      && slotUTC.getTime() > ahora.getTime() + MINIMO_ANTICIPACION_MS) {
    slots.push(slotUTC.toISOString());
  }
  ```
- **Disponibilidad desde la BD — ya implementado:** `disponibilidad.ts:21` consulta
  `prisma.turno.findMany` con `estado: { notIn: [CANCELADO] }` en el rango del día.
- **No seleccionable manipulando el frontend — ya implementado:** la server action `createTurno`
  (`src/actions/turnos/crear.actions.ts:73-77`) recalcula el choque con `hayChoque` (intervalos
  solapados) y devuelve **"Horario ocupado"**.
- **Caché no queda desactualizada — ya implementado:** tras `prisma.turno.create`
  (`crear.actions.ts:83`) se llama `revalidarCacheTurno` (`crear.actions.ts:91`), cuyas tags
  (`turnos-${barberoId}-${fecha}`, `turnos-mes-*`, `turnos-global`) coinciden con las de la caché de
  horarios (`horarios-disponibles.actions.ts:15`, `disponibilidad.actions.ts:14`).

### F.2.2. El único punto ABERTO: la condición de carrera (requisito 4)

- `hayChoque` (check, `crear.actions.ts:73-77`) y `prisma.turno.create` (insert, `crear.actions.ts:83`)
  son **operaciones separadas, SIN transacción ni constraint de BD**.
- Dos peticiones simultáneas pueden leer `turnosDelDia` (ninguna ve la inserción de la otra), pasar el
  check y crear ambas → **doble reserva del mismo horario**.
- El mecanismo `SlotLock` (`src/lib/locks.ts` + acciones de locks) es una mitigación blanda: TTL 5 min,
  check+set no atómico. No garantiza por sí solo la exclusión.
- El modelo Prisma `turno` NO tiene `@@unique` sobre `(barberoId, horarioReservado)` (verificable en
  `prisma/schema.prisma`); no hay exclusión por intervalo a nivel de BD.

## F.3. Decisiones del usuario (registradas el 29-ago-2026 — NO reversibles sin confirmación)

1. **Opción B (ocultar los horarios ocupados)** — confirmada como la mejor UX. Es el comportamiento
   actual; NO se toca la interfaz. Se mantiene el híbrido donde un horario **bloqueado temporalmente
   por otro usuario en pleno checkout** se muestra en gris con candado y deshabilitado (eso es distinto
   de "ocupado por un turno existente" y se conserva).
2. **Transacción `SERIALIZABLE`** para cerrar la condición de carrera. Sin migración de BD ni cambios
   de schema. Los errores del motor (deadlock/constraint, que pueden ocurrir en MariaDB/InnoDB al
   competir dos inserciones en el mismo rango) se mapean a "Horario ocupado" para el cliente.
3. **No modificar el resto del diseño ni funcionalidades** que ya funcionan. No se instalan
   dependencias nuevas. No se crean tests (no hay framework).

## F.4. Diseño de la solución

### F.4.1. Backend — `src/actions/turnos/crear.actions.ts` (único cambio de lógica)

Envolver la re-validación de conflicto y la creación en UNA transacción atómica:

- Revalidar dentro de la transacción (con el cliente `tx`): excepciones laborales, día laboral,
  margen horario, `turnosDelDia` → `hayChoque`, y `existeLockAjeno`.
- Crear el turno con `tx.turno.create`.
- `prisma.$transaction(async (tx) => { ... }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })`.
  Con `SERIALIZABLE`, InnoDB toma next-key locks sobre el índice `(barberoId, horarioReservado)`:
  dos inserciones conflictivas simultáneas no pueden confirmar ambas (la segunda queda bloqueada o
  recibe deadlock del motor; tras el commit de la primera, la segunda re-lee y ve el turno).
- Lanzar **errores tipados** dentro de la transacción (`Error("TURNO_OCUPADO")`,
  `Error("TURNO_LOCKED")`) y mapearlos en el `catch` a los mensajes amigables ya existentes
  ("Horario ocupado", "Este horario está siendo seleccionado por otro usuario. Intentá con otro
  horario."). Detectar deadlock/constraint del motor → "Horario ocupado".
- **Dejar fuera de la transacción** las validaciones baratas y con errores amigables (sesión, campos
  obligatorios, anticipación mínima, guard anti-duplicado, servicio existente) para conservar el
  límite de 100 líneas de las actions.

### F.4.2. Helpers de solo lectura para aceptar el cliente de transacción `tx`

Sin crear funciones nuevas (regla "una función exportada por archivo"), se permite un parámetro
opcional del tipo cliente de transacción (default `prisma`):

- `src/lib/contexto-reserva.ts` → `obtenerContextoDeReserva(client, ...)`: las lecturas
  (`dia_laboral`, `excepcion_laboral`, `turno`) usan `client` en vez de `prisma` cuando se ejecuta
  dentro de la transacción.
- `src/lib/locks.ts` → `existeLockAjeno(client, ...)`: el `prisma.slotLock.findFirst` usa `client`.

## F.5. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `src/actions/turnos/crear.actions.ts` | **MODIFICAR** — envolver re-validación + `create` en `$transaction` `SERIALIZABLE`; errores tipados mapeados |
| `src/lib/contexto-reserva.ts` | **MODIFICAR** — aceptar cliente de transacción `tx` (default `prisma`) |
| `src/lib/locks.ts` | **MODIFICAR** — aceptar cliente de transacción `tx` (default `prisma`) |

Sin cambios en: `src/lib/disponibilidad.ts`, acciones de disponibilidad/horarios, `ListaHorariosReserva`,
locks, caché, schema Prisma, ni la interfaz de selección (Opción B ya correcta).

## F.6. Lo que NO se modifica (explicitamente fuera de alcance)

- La interfaz de selección de horarios (Opción B ya oculta los ocupados) y su cálculo de disponibilidad
  (`disponibilidad.ts`).
- El mecanismo de locks temporales (`SlotLock`, acciones de locks, `useSlotLocks`) tal como está.
- El modelo Prisma `turno` y el schema (sin migración).
- Mercado Pago, emails, auth, el resto de server actions y el sistema de color.
- No se instalan dependencias nuevas. No se crean tests (no hay framework).

## F.7. Verificación (obligatoria al terminar)

1. `npx tsc --noEmit` = **0 errores** (el build NO typechequea; obligatorio AGENTS.md).
2. `npm run lint`.
3. `npx next build` OK (NO `npm run build`: el script corre `prisma db push` contra la BD remota; el
   usuario decidió no migrar la BD en este ciclo — ver §D.7.3).
4. Revisión manual:
   - **Selección de horarios**: los horarios ocupados por un turno existente NO se renderizan (solo se
     ven los disponibles). Un horario bloqueado por otro usuario en checkout se ve gris + candado y no
     se puede elegir.
   - **Manipulación del frontend**: aunque se forzara un `horarioReservado` ocupado por FormData, el
     `createTurno` devuelve "Horario ocupado".
   - **Condición de carrera**: desde dos pestañas/navegadores, reservar el mismo horario de forma
     simultánea: solo uno lo confirma; el otro recibe "Horario ocupado" (o un error de conflicto
     mapeado) y puede elegir otro.
   - **Sin regresiones**: flujo normal de reserva (servicio/barbero/fecha/hora → seña/pago → emails),
     edición de turnos, administración y sistema de color.
5. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300), imports `@/`,
   sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía `var(--page-*)` sin hex de marca
   hardcodeado, contraste según `src/lib/contraste.ts`.

## F.8. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. Fase pequeña (3 archivos relacionados): puede ejecutarse con un único subagente implementador que
   reciba este apéndice + AGENTS.md y aplique los 3 cambios de §F.5.
2. **Agente verificador V-F**: revisa TODO el código producido (reglas de §F.7.5, límites de líneas,
   1 export por archivo, que la interfaz de selección siga intacta y que los helpers `tx` no alteren el
   comportamiento fuera de transacción), repara fallas y **certifica** el pendiente. Gate:
   `npx tsc --noEmit` = 0.
3. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en `AUDITORIA.md`
   si el usuario lo confirma).

---

# APÉNDICE G — PENDIENTE NUEVO: Corrección de la doble reserva — TiDB no soporta el aislamiento `SERIALIZABLE` (registrado 29-ago-2026)

> **Documento directivo de SOLO LECTURA (sigue vigente para su sección).** Este apéndice se
> AGREGA al plan directivo (Fases 9-15) y a los Apéndices A-F como un pendiente NUEVO e
> independiente, que **CORRIGE** la solución del Apéndice F (que usó `SERIALIZABLE`, incompatible
> con TiDB). No forma parte de las Fases 9-15. Los números de línea citados fueron **verificados
> contra el repo el 29-ago-2026** y pueden desplazarse: **verificar la línea exacta antes de
> editar** (regla transversal §5.11).
>
> **Estado: PLAN PRESENTADO y DOCUMENTADO por el usuario el 29-ago-2026.** Quedan **DOS decisiones
> pendientes de confirmación** (§G.9): la estrategia de unicidad (Opción A recomendada / Opción B
> mínima) y si se autoriza aplicar la migración de schema contra la BD TiDB de desarrollo.
> **Aún NO implementado.**

## G.1. Objetivo

Corregir el error que aparece al crear un turno a causa de la transacción `SERIALIZABLE`:

```text
Error [DriverAdapterError]: The isolation level 'SERIALIZABLE' is not supported.
Set tidb_skip_isolation_level_check=1 to skip this error

at crearTurnoEnTransaccion (src/lib/crear-turno-transaccion.ts:47:19)
```

La aplicación usa **TiDB + Prisma**. Se busca mantener la protección contra la doble reserva
(turnos cancelados y de pago de Mercado Pago intactos) **sin** incluir
`tidb_skip_isolation_level_check=1` a ciegas ni depender de una validación del frontend.

## G.2. Contexto actual (verificado el 29-ago-2026)

### G.2.1. Origen del error

- `src/lib/crear-turno-transaccion.ts:47` ejecuta
  `prisma.$transaction(async (tx) => {...}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })`.
- TiDB rechaza `SET TRANSACTION ISOLATION LEVEL SERIALIZABLE`; admite `REPEATABLE READ` y
  `READ COMMITTED` (`generated/prisma/index.js` enum `TransactionIsolationLevel`:
  `ReadUncommitted`, `ReadCommitted`, `RepeatableRead`, `Serializable` — sin `Snapshot`).

### G.2.2. Por qué `SERIALIZABLE` no es la garantía fiable

- El re-chequeo de disponibilidad lee `turnosDelDia` con `SELECT` (lectura snapshot de MVCC) y **no
  bloquea filas inexistentes**. Con el modelo de transacciones de TiDB (pessimista por defecto) el
  `SELECT` de validación no serializa inserciones concurrentes sobre slots vacíos; la doble reserva
  real solo se cierra con una **restricción a nivel de base de datos**.

### G.2.3. Hechos verificados del repo (claves para la solución)

- `prisma.turno.create` solo existe en `src/lib/crear-turno-transaccion.ts:70` (creación centralizada).
- `confirmarTurno` (`src/actions/turnos/confirmar.actions.ts`) y `confirmarTurnoPorPago`
  (`src/lib/confirmar-turno-por-pago.ts`) usan `prisma.turno.update` (NO insertan) → un índice único
  **no rompe** el flujo de pago de Mercado Pago (webhook → CONFIRMADO + `estadoPago=SEÑADO`).
- `cancelTurno` (`src/actions/sesion/cancelar-turno.actions.ts`) es **soft-delete**:
  `actualizarTurnoConDetalle(id, { estado: CANCELADO })` — la fila permanece.
  `deleteTurno` (`src/actions/turnos/eliminar.actions.ts`) es **hard-delete** (`prisma.turno.delete`).
- Estados **activos** = `[PENDIENTE, CONFIRMADO]` (`ESTADOS_TURNO_ACTIVOS` en `src/lib/constants.ts`).
  `obtenerContextoDeReserva` filtra `estado in activos`.
- Consecuencia: un único índice `@@unique([barberoId, horarioReservado])` a secas **bloquearía la
  re-reserva** de un horario cancelado/completado (la fila CANCELADO/COMPLETADO sigue ocupando el
  `(barbero, horario)`). Eso es una regresión y NO se debe hacer.
- TiDB (semántica MySQL) trata **`NULL` como distintos en un índice único** → una columna anulable
  permite "índice único parcial" (solo las filas no-NULL colisionan).
- `completedTurno` (`src/actions/turnos/completar.actions.ts`) usa `update` (`estado=COMPLETADO`).

## G.3. Requisitos (NO reversibles sin confirmación)

1. Consultar si el horario está disponible.
2. Si ya existe un turno para ese horario, rechazar la creación.
3. Si dos clientes intentan reservar **exactamente el mismo horario** al mismo tiempo, **solo uno**
   obtiene el turno.
4. El otro recibe un error controlado (horario acaba de ser ocupado).
5. No se generan turnos duplicados.
6. No se rompe el flujo posterior de pago con Mercado Pago.
7. Mantener la operación lo más atómica posible dentro de las capacidades reales de TiDB.
8. **La protección contra doble reserva debe estar respaldada por la base de datos**, no depender
   únicamente de una validación del frontend.

## G.4. Solución común (ambas opciones)

`src/lib/crear-turno-transaccion.ts`:

- Reemplazar `Prisma.TransactionIsolationLevel.Serializable` por
  `Prisma.TransactionIsolationLevel.RepetableRead` **o** quitar la opción `isolationLevel` (dejar el
  default de la sesión TiDB, que es `REPEATABLE READ`). Esto corrige el crash de inmediato.
- Mantener la transacción y la re-validación de disponibilidad (mejoran el mensaje de error en el caso
  común); el índice único aporta la garantía dura por BD.
- El mapeo de errores ya existe (`src/lib/interpretar-error-turno.ts`): una violación de índice único
  (`P2002`) → "Horario ocupado". También detecta `P2034` (deadlock/conflicto de escritura).

## G.5. Opción A (RECOMENDADA) — clave derivada anulable `claveSlot` + aislada contra `estado`

**G.5.1. Modelo (`prisma/schema.prisma`, modelo `turno`)**
- Agregar `claveSlot String? @db.VarChar(120)` y `@@unique([claveSlot])`.
- Invariante de aplicación: un turno **ocupa** su slot si y solo si `estado ∈ {PENDIENTE, CONFIRMADO}`.
  - Cuando ocupa: `claveSlot = "{barberoId}|{horarioReservado.toISOString()}"`.
  - Cuando NO ocupa (CANCELADO/COMPLETADO): `claveSlot = null` (los `NULL` no colisionan → libera el slot).
- Garantiza a nivel BD que ninguna combinación **activa** de (barbero, horario) se duplica, **sin
  importar el `estado`** (cierra también el caso PENDIENTE + CONFIRMADO) y respeta la re-reserva tras
  cancelar/completar. Airtight para el requisito §G.3.3.
- Compatible con `prisma db push` (modelo Prisma puro, sin SQL custom).

**G.5.2. Mantenimiento de `claveSlot` (mínimo, sin cambiar comportamiento visible)**
| Archivo | Cambio |
|---|---|
| `src/lib/crear-turno-transaccion.ts` | setear `claveSlot` en el `tx.turno.create` |
| `src/actions/sesion/cancelar-turno.actions.ts` | agregar `claveSlot: null` a la actualización (CANCELADO) |
| `src/actions/turnos/completar.actions.ts` | agregar `claveSlot: null` a la actualización (COMPLETADO) |
| `src/actions/turnos/estado.actions.ts` | recalcular `claveSlot` en edición cuando cambia barbero/horario/estado |
| `prisma/seed.ts` + backfill | setear `claveSlot` de turnos activos existentes (`UPDATE ... WHERE estado IN ('PENDIENTE','CONFIRMADO')`) |

**G.5.3. Nota de backfill / datos**
- Al agregar el índice con la columna nueva (todo `null`) no hay colisiones; después se **backfillea**
  `claveSlot` de los turnos activos. Si existieran duplicados activos previos (justamente el bug), el
  backfill chocaría con el índice → resolver manualmente / `--accept-data-loss` en dev.

## G.6. Opción B (mínima) — `@@unique([barberoId, horarioReservado, estado])`

**G.6.1. Modelo**
- Agregar `@@unique([barberoId, horarioReservado, estado])` en `turno` (mantener el índice compuesto
  existente). Sin cambios de código.
- Bloquea la carrera **dominante** (dos turnos `PENDIENTE` simultáneos del mismo slot) y maneja bien el
  soft-delete: `CANCELADO` es un `estado` distinto → libera el slot para re-reservar.

**G.6.2. Limitación conocida**
- Fuga minoritaria: un turno `PENDIENTE` + otro `CONFIRMADO` del mismo slot podrían coexistir si un
  admin (que crea CONFIRMADO/SEÑADO) y un `USER` (que crea PENDIENTE) reservan el mismo instante el
  mismo horario. Requiere concurrencia admin+usuario simultánea; muy poco probable, pero NO cumple el
  "solamente uno" estricto (§G.3.3).

## G.7. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `src/lib/crear-turno-transaccion.ts` | **MODIFICAR** — `isolationLevel` compatible + (Opción A: `claveSlot` en el create) |
| `src/lib/interpretar-error-turno.ts` | **SIN CAMBIOS** (ya mapea `P2002`/`P2034` → "Horario ocupado") |
| `prisma/schema.prisma` | **MODIFICAR** — índice único (Opción A: `claveSlot`; Opción B: composite con `estado`) |
| `src/actions/sesion/cancelar-turno.actions.ts` | **Opción A** — `claveSlot: null` al cancelar |
| `src/actions/turnos/completar.actions.ts` | **Opción A** — `claveSlot: null` al completar |
| `src/actions/turnos/estado.actions.ts` | **Opción A** — recalcular `claveSlot` en edición |
| `prisma/seed.ts` + backfill SQL | **Opción A** — poblar `claveSlot` de turnos activos |

Sin cambios en: disponibilidad (`src/lib/disponibilidad.ts`), acciones de disponibilidad/horarios,
locks, caché, flujo de pago MP, emails, auth, resto de server actions, sistema de color.

## G.8. Verificación (obligatoria al terminar)

1. `node .\node_modules\typescript\bin\tsc --noEmit` = **0 errores** (el build NO typechequea).
2. `npm run lint` (sin errores nuevos; la base de errores/warnings existentes en archivos ajenos se
   mantiene).
3. `npx next build` OK (**NO** `npm run build`: el script corre `prisma db push` contra la BD remota;
   ver decisión en §G.9).
4. Revisión manual:
   - **Concurrencia**: dos pestañas/navegadores reservando el mismo horario simultáneamente → solo una
     confirma; la otra recibe "Horario ocupado".
   - **Re-reserva**: tras cancelar (y completar) un turno, el mismo horario vuelve a poder reservarse.
   - **Edición**: cambiar barbero/horario desde la edición no crea colisiones ni rompe la reserva.
   - **Mercado Pago**: flujo seña → webhook/back_url → CONFIRMADO + `estadoPago=SEÑADO` intacto; sin
     emails duplicados; sin turneos/pagos duplicados al recargar.
   - **Sin regresiones**: flujo USER `/turno` (cliente autocompletado, seña/saldo), ADMIN `/admin/turno`,
     dashboard, cron de expiración, sistema de color.
5. Reglas del repo (AGENTS.md): 1 export por archivo nuevo, ≤400 líneas (objetivo 300), ≤100 por
   acción, imports `@/`, sin `any`/`@ts-ignore`, nombres y mensajes en español, colores vía
   `var(--page-*)`/`var(--admin-*)` sin hex de marca hardcodeado, contraste según `src/lib/contraste.ts`.

## G.9. Decisiones pendientes de confirmación del usuario

| # | Decisión | Opción |
|---|---|---|
| 1 | **Estrategia de unicidad** | **Opción A** (airtight; toca create+cancel+complete+edit y requiere backfill) **RECOMENDADA** · **Opción B** (mínima; una línea de schema, fuga teórica mínima) |
| 2 | **Aplicar la migración de schema** contra la BD TiDB (dev/remota) | `prisma db push --accept-data-loss` contra BD de desarrollo (**nunca** producción) · `prisma migrate dev` · o no aplicarla en este ciclo |

## G.10. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. Fase pequeña (2 archivos de código + schema): puede ejecutarse con un único subagente
   implementador que reciba este apéndice + AGENTS.md y aplique la opción elegida (+ el cambio de
   `isolationLevel`).
2. **Agente verificador V-G** (toca código compartido; verificador obligatorio): revisa TODO el código
   producido (reglas de §G.8.5, límites de líneas, 1 export por archivo, que la re-reserva tras
   cancelar/completar funcione y que el flujo de pago MP quede intacto), repara fallas y **certifica**
   el pendiente. Gate: `node .\node_modules\typescript\bin\tsc --noEmit` = 0.
3. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en `AUDITORIA.md`
   si el usuario lo confirma).

---

# APÉNDICE H — Flujo de confirmación de turno + pago Mercado Pago + notificaciones

> **Directiva de SOLO LECTURA** para el nuevo pendiente (ciclo 2026-08, "flujo de pago MP").
> Los subagentes deben leerlo antes de trabajar. Los números de línea fueron verificados contra el repo
> el **29-ago-2026** y pueden desplazarse: verificar la línea exacta antes de editar.

## H.0. Objetivo

Corregir y completar el flujo de **confirmación de turno + pago con Mercado Pago + notificaciones**,
de punta a punta:

**Seleccionar servicio → seleccionar barbero → seleccionar día/hora → confirmar turno → generar
preferencia MP → redireccionar a Mercado Pago → realizar pago → webhook/confirmación de pago →
validar pago aprobado → actualizar estado del turno → mostrar confirmación → obligar al cliente a
enviar WhatsApp al número del local → enviar email al barbero.**

**Restricciones (no violar):**
- La confirmación se decide en **backend** (webhook / verificación contra la API de MP), NO porque el
  usuario regrese del checkout.
- El turno **no** se marca `CONFIRMADO`/`PAGADO` por la sola vuelta del navegador.
- Confirmación **idempotente**: si MP reintenta el webhook, no debe duplicar acciones ni emails.
- Turno no puede quedar asociado a un pago incorrecto (validar `external_reference` + monto).
- Usar datos reales de BD (cliente, barbero, servicio, local / WhatsApp): **nada hardcodeado**.
- **No** modificar funcionalidades que funcionan correctamente ni hacer cambios visuales innecesarios.

## H.1. Diagnóstico (por qué "Confirmar turno" no lleva al checkout)

**Causa raíz:** `src/actions/mercadopago/crear-preferencia.actions.ts:91` devuelve
`checkoutUrl: response.init_point`. Con credenciales **de prueba/sandbox** (las que usa la app; ver
`/test-mp` y `src/components/test-mp/FlujoPago.tsx`), Mercado Pago devuelve **`sandbox_init_point`**;
`init_point` apunta al checkout de producción y **no resuelve la preferencia sandbox**. Entonces el
`window.location.href = result.data.checkoutUrl` de `src/hooks/usePagoTurno.ts:53` cae en un checkout
inválido / "preferencia no encontrada".

El propio `FlujoPago.tsx:60-70` confirma la URL correcta:
`sandbox_init_point` (`https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pid}`).

**Fallas secundarias detectadas:**
1. **Solo seña, sin opción "valor total".** `ModalPagoTurno.tsx` solo ofrece "Pagar Seña"/"Pagar
   después"; `crearPreferenciaPago` hardcodea `unit_price: seniaCongelada`. Falta elegir Seña vs Total.
2. **Modelo de estados de pago insuficiente.** `estado_pago` (`prisma/schema.prisma:271`) solo tiene
   `PENDIENTE | SEÑADO | PAGADO`; no representa `aprobado/rechazado/cancelado/pendiente de acreditación`.
3. **No se guarda el tipo de pago** (seña vs total) en el turno.
4. **WhatsApp no obligatorio** y con datos incompletos (`RedireccionWhatsApp.tsx` no distingue
   Seña/Total ni muestra estado del pago); el "éxito" aparece sin exigir el envío.
5. **Riesgo de emails duplicados** por reintentos del webhook (TOCTOU en `confirmar-turno-por-pago.ts`).
6. **El webhook no persiste todos los estados** de MP sobre `estadoPago`.
7. `MP_WEBHOOK_SECRET` no documentado en `.env.example`; expiración de la preferencia muy corta
   (5 min, `crear-preferencia.actions.ts:74`).

## H.2. Decisiones del usuario (confirmadas el 29-ago-2026)

| # | Decisión | Opción elegida |
|---|---|---|
| 1 | Modelo de estados de pago | **Extender el enum `estado_pago`** (+ `prisma db push`) |
| 2 | Exigencia de WhatsApp al volver del pago | **Obligatorio con botón destacado** (paso principal; enlaces de salida condicionados) |
| 3 | Registrar monto exacto | **Solo `tipoPago`** en `turno` (el monto se deduce de `precioCongelado`/`seniaCongelada`) |

## H.3. Etapas de implementación

### H.3.1. Esquema y datos
- `prisma/schema.prisma`:
  - `enum estado_pago` → `PENDIENTE | SEÑADO | PAGADO | APROBADO | RECHAZADO | CANCELADO | EN_ACREDITACION`
    (mantener los 3 primeros al inicio por compatibilidad; los nuevos estados los setea el backend MP).
  - `turno.tipoPago String?` → `"SEÑA" | "TOTAL"`.
  - Ejecutar `prisma generate` + `prisma db push` (dev; nunca producción).
- `src/lib/constants.ts`: ampliar `ESTADOS_PAGO`; nuevo
  `ESTADOS_PAGO_MANUALES = ["PENDIENTE","SEÑADO","PAGADO"]` (selector/creación manual admin) y
  `TIPOS_PAGO = ["SEÑA","TOTAL"] as const`.
- `src/types/mercadopago.ts`: `export type TipoPago = "SEÑA" | "TOTAL";`; ampliar `DatosPreferenciaPago`
  con `tipoPago: TipoPago` y `montoSolicitado: number`.
- `src/types/turno.ts`: agregar `tipoPago` a `TurnoCreado` / `TurnoPagoConfirmado`.

### H.3.2. Preferencia + redirección correcta
- **Nuevo** `src/lib/mercadopago/url-checkout.ts` → única export `obtenerUrlCheckout(preferencia, token)`:
  devuelve `sandbox_init_point` si el token empieza con `TEST-…`, sino `init_point` (con fallback a la
  otra). **Este es el fix del bug.**
- `src/actions/mercadopago/crear-preferencia.actions.ts`: firma `(turnoId, tipoPago: TipoPago)`.
  `unit_price = SEÑA → seniaCongelada` / `TOTAL → precioCongelado`; `title` según tipo; `metadata.tipoPago`;
  usar `obtenerUrlCheckout`; subir `expiration_date_to` a ~30 min; guardar `mpPreferenceId`.
- `src/hooks/usePagoTurno.ts`: `handlePagar(tipoPago)` → llama la preferencia con el tipo y redirige a
  `checkoutUrl`; mantener `handlePagarDespues` (mensaje "Pendiente de pago").
- `src/components/turno/ModalPagoTurno.tsx`: tres acciones — **Pagar Seña ($X)** / **Pagar Total ($Y)** /
  **Pagar después**; mostrar ambos importes según `turnoCreado`.

### H.3.3. Confirmación idempotente (core, backend)
- Reescribir `src/lib/confirmar-turno-por-pago.ts`:
  - Validar `approved`, `external_reference === turnoId`, `montoPago ≥` (seña o total según `tipoPago`).
  - **Transición atómica** con `updateMany({ where: { id, estado: "PENDIENTE" } })`: si `count === 0`
    → `{ ok: true, yaConfirmado: true }` (webhook reintentado no duplica).
  - Solo si `count === 1` → `estado = CONFIRMADO`, `estadoPago = SEÑADO|PAGADO`, `mpPaymentId`, `tipoPago`;
    luego `enviarEmailsTurnoConfirmado` (cliente + barbero) **una única vez** + revalidar rutas.
- `src/app/api/mercadopago/webhook/route.ts`: mapear todos los estados:
  - `approved` → `confirmarTurnoPorPago` (SEÑADO/PAGADO + CONFIRMADO).
  - `pending`/`in_process` → `estadoPago = EN_ACREDITACION`, turno `PENDIENTE`, guardar `mpPaymentId`.
  - `rejected` → `estadoPago = RECHAZADO`, turno `PENDIENTE`.
  - `cancelled` → `estadoPago = CANCELADO`, turno `PENDIENTE`.
  - `refunded`/`charged_back` → `estado = CANCELADO`, `estadoPago = CANCELADO`.
  - Logs en cada etapa (calificar qué falla y dónde) + `tipoPago` desde `metadata`.
  - Mantener validación de firma (`MP_WEBHOOK_SECRET`), fail-closed en prod.

### H.3.4. WhatsApp obligatorio (pago verificado)
- `src/components/pago/RedireccionWhatsApp.tsx`: mensaje completo (cliente, día, hora, servicio, barbero,
  indicar **Seña/Total**, monto, estado del pago). Número desde `PageConfig.whatsapp` (ya llega de BD).
- `src/app/pago/success/page.tsx` y `src/app/pago/status/page.tsx`: el envío a WhatsApp es el **paso
  obligatorio destacado**; los enlaces de salida ("Ver mis turnos"/"Inicio"/"Intentar de nuevo") quedan
  condicionados a esa acción. Mostrar éxito **solo** si `confirmarPagoTurno` verificó `approved` contra la
  API (nunca por la vuelta del navegador).

### H.3.5. Email al barbero
- Ya existe `enviarEmailsTurnoConfirmado` (cliente + `barbero.email` de BD). Asegurar que dispare
  **exactamente una vez** (vía la transición atómica de §H.3.3) y que el email incluya
  cliente/día/hora/servicio/barbero.

### H.3.6. Entorno y compatibilidad
- `.env.example`: agregar `MP_WEBHOOK_SECRET=""` (el webhook ya hace fail-closed en prod). Verificar
  `RESEND_API_KEY`/`RESEND_FROM_EMAIL`/`NEXT_PUBLIC_APP_URL`.
- `src/components/turno/gestion/BadgeEstadoPago.tsx`: labels/colores para `APROBADO`, `RECHAZADO`,
  `CANCELADO`, `EN_ACREDITACION`.
- Restringir a `ESTADOS_PAGO_MANUALES`: `SelectorEstadoPago.tsx`, `crear.actions.ts:55`,
  `estado.actions.ts:47` (no exponer estados MP como opción manual).

### H.3.7. Verificación
- `npx tsc --noEmit` = 0; `npm run lint`; build OK. Ronda de subagentes + agente `verificador`
  (reglas AGENTS.md: 1 export por archivo, ≤400 líneas (objetivo 300), ≤100 por acción, carpetas por
  dominio, imports `@/`, sin `any`/`@ts-ignore`, español, colores vía `var(--page-*)`/`var(--admin-*)`).

## H.4. Archivos involucrados (resumen)

| Archivo | Acción |
|---|---|
| `prisma/schema.prisma` | **MODIFICAR** — enum `estado_pago` ampliado + `turno.tipoPago String?` |
| `src/lib/constants.ts` | **MODIFICAR** — `ESTADOS_PAGO` ampliado + `ESTADOS_PAGO_MANUALES` + `TIPOS_PAGO` |
| `src/types/mercadopago.ts` | **MODIFICAR** — `TipoPago` + `DatosPreferenciaPago` ampliado |
| `src/types/turno.ts` | **MODIFICAR** — `tipoPago` en `TurnoCreado`/`TurnoPagoConfirmado` |
| `src/lib/mercadopago/url-checkout.ts` | **CREAR** — `obtenerUrlCheckout` (fix sandbox/prod) |
| `src/actions/mercadopago/crear-preferencia.actions.ts` | **MODIFICAR** — `tipoPago`, monto, URL, expiración |
| `src/hooks/usePagoTurno.ts` | **MODIFICAR** — `handlePagar(tipoPago)` |
| `src/components/turno/ModalPagoTurno.tsx` | **MODIFICAR** — Seña / Total / Después |
| `src/lib/confirmar-turno-por-pago.ts` | **MODIFICAR** — transición atómica idempotente + emails una vez |
| `src/app/api/mercadopago/webhook/route.ts` | **MODIFICAR** — mapeo completo de estados + logs |
| `src/components/pago/RedireccionWhatsApp.tsx` | **MODIFICAR** — mensaje completo (Seña/Total, monto, estado) |
| `src/app/pago/success/page.tsx` | **MODIFICAR** — WhatsApp obligatorio, éxito solo con verificación |
| `src/app/pago/status/page.tsx` | **MODIFICAR** — ídem |
| `src/components/turno/gestion/BadgeEstadoPago.tsx` | **MODIFICAR** — labels nuevos estados |
| `src/components/turno/reserva/SelectorEstadoPago.tsx` | **MODIFICAR** — restringir a `MANUALES` |
| `src/actions/turnos/crear.actions.ts` | **MODIFICAR (menor)** — `estadoPago` manual → `MANUALES` |
| `src/actions/turnos/estado.actions.ts` | **MODIFICAR (menor)** — ídem |
| `.env.example` | **MODIFICAR** — `MP_WEBHOOK_SECRET` |

Sin cambios en: disponibilidad (`disponibilidad.ts`), locks, caché, `margenes`, auth, sistema de color,
cron, gestión de clientes/presupuestos/mensajes, plantillas.

## H.5. Decisiones pendientes de confirmación del usuario

| # | Decisión | Opción |
|---|---|---|
| 1 | Aplicar la migración de schema (`estado_pago` + `tipoPago`) | `prisma db push --accept-data-loss` contra dev (nunca prod) · `prisma migrate dev` · no aplicarla ahora |

## H.6. Ejecución (cumple AGENTS.md "Uso de subagentes")

1. Fase con ~14 archivos + schema + webhook compartido: ejecutar con subagentes en paralelo por bloques
   independientes (H.3.1/H.3.2, H.3.3/H.3.5, H.3.4/H.3.6) y luego consolidar.
2. **Agente verificador V-H** (toca código compartido extenso): revisa TODO el código producido
   (H.3.7, límites de líneas, 1 export por archivo, idempotencia, mapeo de estados, que el flujo
   seña/total ↔ seña/total haga match), repara fallas y **certifica**. Gate:
   `node .\node_modules\typescript\bin\tsc --noEmit` = 0.
3. La decisión final sobre resultados es del agente principal (nunca de los subagentes).
4. Al aprobarse, registrar el resultado como tarea cerrada en el acta del ciclo (o en `AUDITORIA.md`
   si el usuario lo confirma).

---
