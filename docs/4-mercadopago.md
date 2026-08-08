# Mercado Pago (Checkout Pro + OAuth)

Guía para configurar Mercado Pago en la app: crear la aplicación, obtener las credenciales, registrar la URI de redirección y conectar la cuenta de cobro desde el panel admin.

---

## 1. Crear la aplicación en Mercado Pago

- Ir al panel de desarrolladores de Mercado Pago: <https://www.mercadopago.com.ar/developers/panel/app>
- Docs de referencia (credenciales): <https://www.mercadopago.com.ar/developers/es/docs/your-integrations/credentials>

Pasos:

1. Ingresar con la **cuenta de Mercado Pago de la barbería** (la cuenta que va a cobrar las señas).
2. Ir a **"Tus aplicaciones"** → **"Crear aplicación"**.
3. Elegir **"Checkout Pro"** como producto (o **"Checkout API"** / pagos online según la opción que ofrezca el panel en el momento).
4. Asignar un nombre a la app, por ejemplo `barber-turnos`.

> **NOTA:** el panel distingue entre **"Credenciales de prueba" (TEST)** y **"Credenciales de producción" (APP_USR)**. Para cobrar pagos reales hay que usar las credenciales de **producción**. Las de prueba solo sirven para probar el flujo sin dinero real.

---

## 2. Obtener MP_CLIENT_ID y MP_CLIENT_SECRET

1. Dentro de la aplicación creada, ir a la sección **"Credenciales"** → **"Credenciales de producción"**.
2. Copiar el **Client ID** (un número) y el **Client Secret**.
3. Asignarlos en el `.env`:
   - **Client ID** → `MP_CLIENT_ID`
   - **Client Secret** → `MP_CLIENT_SECRET`

> **ADVERTENCIA:** el Client Secret es un secreto. No se debe subir al repositorio ni compartirlo.

---

## 3. Registrar la URI de redirección (crítico)

En la aplicación de MP hay un campo **"Redirect URI"** (o **"URI de redirección"**). Pegar exactamente:

- Desarrollo: `http://localhost:3000/api/mercadopago/oauth/callback`
- Producción: `https://TU_APP.vercel.app/api/mercadopago/oauth/callback`

> **ADVERTENCIA:** la URI debe coincidir **exactamente** (protocolo, dominio, puerto y ruta). Si no coincide, el flujo falla con un error de `redirect_uri`.

**NOTA:** el panel admin del proyecto muestra la URI exacta a copiar cuando falta configuración (componente `MercadoPagoConnectionPanel` en `/admin/mercadopago`).

---

## 4. Variables del `.env`

```env
MP_CLIENT_ID="TU_MP_CLIENT_ID"
MP_CLIENT_SECRET="TU_MP_CLIENT_SECRET"
MP_AUTH_BASE_URL="https://auth.mercadopago.com.ar"   # opcional
# MP_ACCESS_TOKEN="APP_USR-..."                        # legacy / opcional
# MP_PUBLIC_KEY="APP_USR-..."                          # legacy / opcional
```

- `MP_AUTH_BASE_URL`: URL base de autorización. Por defecto es `https://auth.mercadopago.com.ar` (Argentina). Se puede cambiar para otros países.
- `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY`: **legacy / opcionales**. No se usan directamente en el código actual; los tokens reales se guardan en la base de datos tras el OAuth (ver sección 6).

---

## 5. Conexión desde el panel admin

1. Levantar la app con `npm run dev`.
2. Entrar a `/admin/mercadopago`.
3. Hacer clic en **"Conectar con Mercado Pago"**.
4. Autorizar en la pantalla de Mercado Pago con la cuenta que va a cobrar.
5. Al volver, la conexión queda guardada en la tabla `configuracion_mercadopago` (ID `mercadopago-principal`) y **bloqueada por seguridad** (campo `bloqueado = true`).

### Qué significa el bloqueo

El bloqueo impide que se cambien los tokens sin autorización: no se puede reconectar ni desconectar la cuenta desde el panel mientras esté bloqueada. Para cambiar de cuenta hay que pedirle al equipo de desarrollo que ponga `bloqueado = false` en la tabla `configuracion_mercadopago`.

Forma de desbloquear en la base de datos:

```sql
UPDATE configuracion_mercadopago
SET bloqueado = false
WHERE id = 'mercadopago-principal';
```

---

## 6. Cómo se renueva el token

Al conectar, Mercado Pago devuelve un `access_token` y un `refresh_token` (por el scope `offline_access`). Ambos se guardan en la base de datos. La función `refrescarTokenMP` usa el `refresh_token` para renovar automáticamente el `access_token` cuando expira.

Por eso el `.env` **no necesita** `MP_ACCESS_TOKEN` en el día a día: el token real sale del OAuth y se almacena en la BD.

---

## 7. Probar pagos

Con credenciales de prueba se pueden usar las tarjetas de prueba de Mercado Pago:

- Tarjetas de prueba: <https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/your-integrations/test/cards>

El proyecto incluye una ruta de pruebas en `/test-mp` (solo desarrollo).
