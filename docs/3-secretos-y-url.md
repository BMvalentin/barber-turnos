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

## 5. VERCEL_URL

**VERCEL_URL** es una variable de entorno que **Vercel inyecta en runtime** (por ejemplo `proyecto-git-rama.vercel.app`).

- **No hace falta declararla en local**: solo existe en los entornos de Vercel.
- El código la usa como **fallback** cuando falta `NEXT_PUBLIC_APP_URL`: en `src/lib/mercadopago.ts` se le agrega el `https://` automáticamente (Vercel no la provee con protocolo).

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
| `NEXT_PUBLIC_APP_URL` | URL base de la app (redirects y back_urls de Mercado Pago) | `http://localhost:3000` | **Sí** |
| `VERCEL_URL` | URL inyectada por Vercel en runtime (fallback de la URL base) | `proyecto-git-rama.vercel.app` | No (la inyecta Vercel) |
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
