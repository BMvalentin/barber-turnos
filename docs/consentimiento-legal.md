# Consentimiento legal: centralización, versionado y re-aceptación

Documento de diseño de la implementación. Describe el comportamiento vigente y
la estrategia de re-aceptación, que permanece **inerte** hasta su aprobación.

## 1. Documentos y versionado

- Los textos legales viven en archivos versionados por Git, en
  `src/lib/legal/contenido-*.ts`, agregados en `src/lib/legal/documentos.ts`.
- Cada documento declara `version` (semántica, p. ej. `1.0.0`) y `vigenteDesde`
  (ISO `YYYY-MM-DD`).
- Los documentos con `requiereAceptacion: true` (Términos y Privacidad) se
  exigen al crear una cuenta. Cookies y Pagos son informativos.
- Rutas públicas: `/legal`, `/legal/terminos`, `/legal/privacidad`,
  `/legal/cookies`, `/legal/pagos-y-cancelaciones`.
- Un cambio de texto que afecte el consentimiento **debe** incrementar
  `version`; eso hace que las aceptaciones previas queden como históricas y se
  distingan de la versión vigente.

## 2. Persistencia

- Tabla `consentimiento_legal`: `id`, `userId`, `documento`, `version`,
  `aceptadoEn`, `metodo` (`credentials` | `google`).
- Se inserta una fila por documento y versión. **Nunca se sobrescriben** filas
  anteriores: el historial queda intacto.
- La creación del usuario y de sus aceptaciones es transaccional.
- No se almacenan IP, user-agent ni otros datos personales en el registro de
  consentimiento.

## 3. Registro con credenciales

- `FormularioRegistro` muestra una casilla obligatoria, desmarcada por defecto,
  con enlaces a Términos y Privacidad (se abren en pestaña nueva, sin perder el
  formulario).
- Validación en cliente (botón deshabilitado hasta aceptar) y en servidor
  (`registerAction` valida `aceptacionLegalSchema` antes de crear nada).
- La versión aceptada la define el servidor (`construirAceptacionesVigentes()`),
  nunca el cliente.

## 4. Google OAuth (aceptación previa)

Orden real verificado en `@auth/core@0.41.3`
(`lib/actions/callback/index.js`): `handleOAuth` → `getUserByAccount` →
`callbacks.signIn` → (`handleLoginOrRegister` → `createUser`).

- Al marcar la casilla en `/register`, la Server Action
  `googleLoginConAceptacionAction` emite una **cookie firmada** (HMAC con
  `AUTH_SECRET`), `httpOnly`, `sameSite=lax`, TTL 10 min, con las versiones
  aceptadas y un `nonce`. No contiene datos personales.
- `callbacks.signIn` (en `src/auth.ts`) decide:
  - cuenta de Google ya vinculada → usuario existente → se permite sin
    consentimiento retroactivo;
  - ya existe un usuario con ese correo → se permite (Auth.js no creará cuenta);
  - cuenta nueva → exige intención válida y vigente; si falta o no coincide con
    las versiones actuales, devuelve una redirección a
    `/register?consentimiento=requerido` y **no se crea la cuenta**.
- `events.signIn` persiste la aceptación solo cuando `isNewUser` es verdadero,
  usando las versiones verificadas de la intención, y limpia la cookie.
- Timeout/cancelación de OAuth no crea cuenta (Auth.js redirige sin perfil).

## 5. Usuarios existentes

- No se les asignan aceptaciones retroactivas ni registros ficticios.
- No se alteran roles, sesiones, credenciales, cuentas vinculadas ni el acceso
  inicial.
- Al no tener filas en `consentimiento_legal`, se distinguen naturalmente de
  las cuentas nuevas.

## 6. Política de re-aceptación (INERTE)

La lógica está en `src/lib/legal/reaceptacion.ts`, **no se invoca desde la UI**
y no bloquea el acceso. `REACEPTACION_ACTIVA` es `false`.

`documentosConVersionVencida(aceptaciones)` identifica los documentos
obligatorios cuya versión aceptada no coincide con la vigente (o sin aceptación).

**Condiciones para activarla (requieren aprobación explícita):**

1. Definir el evento disparador: cambio de `version` de un documento
   obligatorio.
2. Definir el momento y el flujo (p. ej. aviso no bloqueante en `/dashboard`, o
   exigir aceptación antes de una acción concreta).
3. Definir si el bloqueo es total o parcial, y cómo se comunica.
4. Documentar si alguna obligación legal exige una actuación distinta de la
   política de no interrumpir el acceso inicial; si existiera, documentar el
   conflicto antes de aplicarla.
5. Cambiar `REACEPTACION_ACTIVA` a `true` **solo** con esas definiciones.

## 7. Pendientes de definición (no resueltos)

- Datos identificatorios y de contacto del responsable del sitio.
- Política de reembolsos, devoluciones, penalizaciones y ausencias.
- Plazos de conservación de datos, transferencias internacionales y tratamiento
  de menores.
- Ley aplicable, jurisdicción y procedimiento de modificación de los Términos.
- Revisión jurídica de todos los textos (son borradores).
