# Google OAuth (Client ID y Client Secret)

Guía paso a paso para obtener las credenciales de Google OAuth y configurar el login con "Continuar con Google" en la app.

---

## 1. Acceso

- Ir a la consola de Google Cloud: <https://console.cloud.google.com/>
- Iniciar sesión con la cuenta de Google que administra el proyecto.

---

## 2. Crear o seleccionar el proyecto

- En la **barra superior**, abrir el **selector de proyectos**.
- Hacer clic en **"Nuevo proyecto"**.
- Asignar un nombre, por ejemplo `barber-turnos`, y crear el proyecto.
- Asegurarse de que el proyecto recién creado quede seleccionado en el selector.

---

## 3. Configurar la pantalla de consentimiento de OAuth

- Ir a **"APIs y servicios"** → **"Pantalla de consentimiento"** (link directo: <https://console.cloud.google.com/apis/credentials/consent>).
- Elegir el tipo de usuario **"Externo" (External)** → **Crear**.
- Completar los campos solicitados:
  - **Nombre de la app**: por ejemplo `barber-turnos`.
  - **Correo de soporte**: un correo válido.
  - **Correo del desarrollador**: un correo válido.
- Hacer clic en **"Guardar y continuar"**.
- En la sección **"Audiencia" / usuarios de prueba**, agregar los emails de las cuentas que van a poder iniciar sesión durante el desarrollo. Es **opcional pero recomendado** mientras la app esté en modo "Prueba".
- Continuar con los pasos siguientes hasta **finalizar**.

---

## 4. Crear las credenciales OAuth

- Ir a **"APIs y servicios"** → **"Credenciales"** (link directo: <https://console.cloud.google.com/apis/credentials>).
- Hacer clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth"**.
- **Tipo de aplicación**: **Aplicación web**.
- **Nombre**: por ejemplo `barber-turnos-web`.
- En **"URIs de redirección autorizados" (Authorized redirect URIs)** agregar **exactamente**:
  - `http://localhost:3000/api/auth/callback/google`
  - (en producción) `https://TU_APP.vercel.app/api/auth/callback/google`

> **ADVERTENCIA:** si esta URI no coincide exactamente (incluyendo `http`/`https`, el puerto y el resto de la ruta), el login falla con el error **400: `redirect_uri_mismatch`**.

- En **"URIs de origen JavaScript autorizados"**: agregar `http://localhost:3000` (y la URL de producción). Es opcional para el flujo de Auth.js, pero es una buena práctica.
- Hacer clic en **"Crear"**.

---

## 5. Copiar las credenciales

- Al crear, aparecerá una ventana con los datos de la credencial:
  - **ID de cliente**: termina en `.apps.googleusercontent.com`. Se asigna a `AUTH_GOOGLE_ID`.
  - **Secreto de cliente**: empieza con `GOCSPX-...`. Se asigna a `AUTH_GOOGLE_SECRET`.

> **ADVERTENCIA:** el secreto **solo se muestra una vez**. Guardarlo antes de cerrar la ventana. Si se pierde, hay que generar uno nuevo desde "Crear credenciales" → botón de crear secreto nuevo (no repetir el secreto anterior).

---

## 6. Archivo `.env`

Crear o completar el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
AUTH_GOOGLE_ID="TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="TU_GOOGLE_CLIENT_SECRET"
AUTH_TRUST_HOST=true
```

- `AUTH_TRUST_HOST=true` es necesario para el desarrollo local.
- `AUTH_SECRET` (si no existiera) se puede generar con `npx auth secret`.

---

## 7. Cómo probar

1. Levantar la app con `npm run dev`.
2. Ir a la pantalla de login.
3. Usar **"Continuar con Google"**.

> **NOTA:** mientras la app esté en modo de prueba, la cuenta utilizada debe estar agregada en la lista de **usuarios de prueba** (paso 3), de lo contrario Google rechazará el acceso.
