# Secretos y URL de la app

Guía para generar los secretos de Auth.js y configurar la URL base de la app. Documenta las variables del archivo `.env` que controlan el inicio de sesión (JWT), el cron de expiración de turnos y las URLs usadas por Mercado Pago.

---

## 1. AUTH_SECRET

**AUTH_SECRET** es el secreto que firma las sesiones JWT de Auth.js. Debe ser único, largo y aleatorio, y **nunca debe compartirse ni publicarse** (no subirlo a git, no exponerlo al navegador).

### Cómo generarlo

Con **OpenSSL** (funciona en terminal de Linux/Mac, y en Windows con Git Bash o WSL):

```bash
openssl rand -base64 32
```

Con **Node.js** (alternativa que funciona en cualquier sistema):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Dónde pegarlo

```env
AUTH_SECRET="TU_AUTH_SECRET_AQUI"
```

> **NOTA TÉCNICA:** sin `AUTH_SECRET` configurado, Auth.js falla en producción con el error **`MissingSecret`**. En desarrollo puede arrancar de forma laxa, pero en producción el fallo es total, por eso conviene definirlo siempre.

---

## 2. CRON_SECRET

**CRON_SECRET** protege el endpoint `/api/cron/expirar-turnos`, que expira los turnos **PENDIENTES** con seña congelada tras **5 minutos** sin confirmar el pago.

### Cómo generarlo

Se genera igual que `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

```env
CRON_SECRET="TU_CRON_SECRET"
```

### Configuración en Vercel

1. Ir al Dashboard del proyecto → **Settings** → **Cron Jobs** (link: <https://vercel.com/docs/cron-jobs>).
2. Crear un job apuntando a:
   ```
   https://TU_APP.vercel.app/api/cron/expirar-turnos
   ```
3. Elegir una **frecuencia**, por ejemplo cada 1 minuto (`*/1 * * * *`).

> **DETALLE TÉCNICO:** Vercel inyecta el header `x-vercel-cron: 1` automáticamente en producción, y es lo que la ruta valida: el código actual solo exige ese header cuando `NODE_ENV=production`. Por eso `CRON_SECRET` queda como valor opcional/respaldo según `AGENTS.md`, pero **conviene tenerlo definido** como medida extra de seguridad.

---

## 3. AUTH_TRUST_HOST

**AUTH_TRUST_HOST** le indica a Auth.js qué hosts considerar como confiables.

- En **desarrollo local** se setea en `true` para que Auth.js confíe en `http://localhost:3000`:

  ```env
  AUTH_TRUST_HOST=true
  ```

- En **producción en Vercel** no hace falta declararlo: Auth.js resuelve el host automáticamente a partir del dominio del deploy.

---

## 4. NEXT_PUBLIC_APP_URL

**NEXT_PUBLIC_APP_URL** es la URL base de la app.

- **Desarrollo:**

  ```env
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
  ```

- **Producción:** debe ser el dominio real del deploy:

  ```env
  NEXT_PUBLIC_APP_URL="https://TU_APP.vercel.app"
  ```

Se usa para construir las **redirect URIs** de Mercado Pago y los **back_urls** de Checkout, por lo que **DEBE coincidir exactamente** con la URL registrada en la app de Mercado Pago.

> **PRECAUCIÓN:** por el prefijo `NEXT_PUBLIC_`, esta variable se expone al navegador. **Nunca** poner secretos en una variable con ese prefijo.

---

## 5. VERCEL_URL y VERCEL_ENV

**VERCEL_URL** es una variable de entorno que **Vercel inyecta en runtime** (por ejemplo `proyecto-git-rama.vercel.app`). **VERCEL_ENV** indica el entorno del deployment y vale `production`, `preview` o `development`.

- **No hace falta declararlas en local**: solo existen en los entornos de Vercel.
- `VERCEL_URL` **no incluye el protocolo**: el código le agrega `https://` automáticamente.
- `VERCEL_URL` se usa como **fallback** de la URL base en `src/lib/mercadopago/uri-redireccion.ts` (redirect URI de Mercado Pago).

---

## 5.1. Cómo se resuelve la URL base de la app (correos y enlaces)

Los correos de verificación de cuenta y de restablecimiento de contraseña obtienen
su URL base desde `src/lib/obtener-url-app.ts`. La resolución depende del entorno
(Mercado Pago usa su propia resolución en `src/lib/mercadopago/uri-redireccion.ts`,
que prefiere `NEXT_PUBLIC_APP_URL` y cae a `VERCEL_URL`):

| Entorno | Fuente de la URL base | Comportamiento si falta configuración |
| --- | --- | --- |
| **Desarrollo local** (sin `VERCEL`, o `VERCEL_ENV=development`) | `NEXT_PUBLIC_APP_URL` o `http://localhost:3000` | Usa `localhost` |
| **Preview** (`VERCEL_ENV=preview`) | `https://${VERCEL_URL}` (deployment que originó la solicitud) | Error controlado; **no** cae a `NEXT_PUBLIC_APP_URL` ni a `localhost` |
| **Producción** (`VERCEL_ENV=production`) | `NEXT_PUBLIC_APP_URL` (debe ser HTTPS válida) | Error controlado; **no** cae a `localhost` ni a una URL de Preview |
| **Desplegado sin `VERCEL_ENV` reconocido** | `NEXT_PUBLIC_APP_URL` (debe ser HTTPS válida) | Error controlado |

Consecuencias prácticas:

- En **Preview** conviene **no** definir `NEXT_PUBLIC_APP_URL` (o definirla con el dominio de producción para otros usos): los enlaces de correo usan igualmente `VERCEL_URL`, de modo que apuntan a la rama desplegada y no a producción.
- En **Producción** `NEXT_PUBLIC_APP_URL` es **obligatoria** y debe ser una URL `https://` válida.
- El error de configuración se propaga de forma controlada (respuesta genérica al usuario y registro sin secretos, tokens ni enlaces completos).

### Variables necesarias para que el correo salga

Para que las Server Actions realmente envíen el correo con el enlace, el scope del
entorno correspondiente debe tener configuradas:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (remitente; `onboarding@resend.dev` en pruebas)

Si el scope de Preview no tiene estas variables, el enlace se genera igual pero el
envío falla silenciosamente (`enviarCorreo` devuelve `success: false`).

> **IMPORTANTE:** por el prefijo `NEXT_PUBLIC_`, `NEXT_PUBLIC_APP_URL` se inlinea en
> tiempo de build. Tras agregar o cambiar variables de entorno en Vercel hay que
> **volver a desplegar** para que el cambio tenga efecto.


---

## 6. IS_PRODUCTION

**IS_PRODUCTION** es una variable **legacy** presente en el `.env` real pero **sin uso en el código actual**. Se documenta para no confundir:

- Es **opcional**.
- No afecta el funcionamiento de la app.
- Puede conservarse por compatibilidad o eliminarse sin riesgo.

---

## 7. Tabla resumen

| Variable | Para qué sirve | Valor de ejemplo | Obligatoria |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Firma las sesiones JWT de Auth.js | `TU_AUTH_SECRET_AQUI` | **Sí** (en producción falla sin ella) |
| `CRON_SECRET` | Respaldo de seguridad del cron de expiración de turnos | `TU_CRON_SECRET` | No (el cron valida el header `x-vercel-cron`) |
| `AUTH_TRUST_HOST` | Hace que Auth.js confíe en el host en desarrollo | `true` | Solo en desarrollo local |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (correos, redirects y back_urls de Mercado Pago). Obligatoria y HTTPS en Producción | `http://localhost:3000` (dev) / `https://TU_APP.vercel.app` (prod) | **Sí** |
| `VERCEL_URL` | URL del deployment inyectada por Vercel en runtime; en Preview es la URL base de los correos | `proyecto-git-rama.vercel.app` | No (la inyecta Vercel) |
| `VERCEL_ENV` | Entorno del deployment (`production`/`preview`/`development`); decide qué fuente usa la URL base | `preview` | No (la inyecta Vercel) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Credenciales de envío del correo con el enlace | `re_...` / `onboarding@resend.dev` | **Sí** para enviar correos |
| `IS_PRODUCTION` | Variable legacy sin uso en el código actual | `false` | No |

---

## Resumen de ejemplo del `.env`

```env
AUTH_SECRET="TU_AUTH_SECRET_AQUI"
CRON_SECRET="TU_CRON_SECRET"
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_URL="http://localhost:3000"
VERCEL_URL="TU_APP.vercel.app"
IS_PRODUCTION=false
```
