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
