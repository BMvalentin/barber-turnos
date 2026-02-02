# 🚗 Lavadero Web - Next.js & Prisma

Este proyecto es una aplicación web moderna para gestión de turnos y usuarios, construida con **Next.js 16**, autenticación robusta mediante **Auth.js** (Google OAuth + Credenciales), y base de datos MySQL gestionada con **Prisma ORM 7**.

## 🛠 Tech Stack

- **Framework:** Next.js 16
- **Base de Datos:** MySQL / MariaDB
- **ORM:** Prisma 7 (con Driver Adapters Nativos)
- **Autenticación:** Auth.js (NextAuth)
- **Validación:** Zod
- **Estilos:** Tailwind CSS

---

## 🚀 Guía de Inicio Rápido

### 1. Prerrequisitos
Asegúrate de tener instalado:
- **Node.js** (v20 o superior)
- **MySQL** o **MariaDB** (XAMPP, Workbench, Docker, etc.)

### 2. Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/BrandonAlanDev/lavadero-web.git
cd lavadero-web
```
recuerda seleccionar la rama con la que trabajar

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto y copia el siguiente contenido.

> **Nota:** Es importante usar `127.0.0.1` en lugar de `localhost` para evitar problemas de conexión en Windows/Node.js.

```env
# Conexión a Base de Datos (URL Completa para Prisma)
DATABASE_URL="mysql://root@127.0.0.1:3306/db_lavadero"

# Variables para el Adaptador Nativo (Requerido en Prisma 7)
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="db_lavadero"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306

# Configuración de Auth.js
# Genera un secreto seguro en terminal, puede ser por ejemplo con: openssl rand -base64 32
AUTH_SECRET="un_secreto_muy_largo_y_seguro"

# Credenciales de Google OAuth (Ver paso 4)
AUTH_GOOGLE_ID="TU_GOOGLE_ID_AQUI"
AUTH_GOOGLE_SECRET="TU_GOOGLE_SECRET_AQUI"

# Importante para desarrollo local
AUTH_TRUST_HOST=true
```

---

### 4. 🔑 Configuración de Google Cloud (Paso a Paso)

Para que el inicio de sesión con Google funcione, necesitas obtener el **Client ID** y **Client Secret**. Sigue estos pasos con atención:

1.  Ve a la **[Google Cloud Console](https://console.cloud.google.com/)** e inicia sesión.
2.  Arriba a la izquierda, haz clic en el selector de proyectos y selecciona **"Nuevo Proyecto"**. Ponle un nombre (ej: `Lavadero App`) y créalo.
3.  En el menú lateral, ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
    *   Selecciona **Externo** y dale a "Crear".
    *   Rellena: Nombre de la app, correo de soporte y correo del desarrollador. Guarda y continúa.
4.  En el menú lateral, ve a **Credenciales**.
5.  Haz clic en **+ CREAR CREDENCIALES** > **ID de cliente de OAuth**.
6.  En "Tipo de aplicación", selecciona **Aplicación web**.
7.  En la sección **"URIs de redireccionamiento autorizados"** (Authorized redirect URIs), haz clic en "Agregar URI" y pega **EXACTAMENTE** esta ruta:
    ```
    http://localhost:3000/api/auth/callback/google
    ```
    *(Si esta ruta no es exacta, el login fallará con error 400).*
8.  Haz clic en **Crear**.
9.  ⚠️ **¡IMPORTANTE!** Aparecerá una ventana emergente con tu `ID de cliente` y `Secreto de cliente`.
    *   Copia el **ID de cliente** en tu `.env` como `AUTH_GOOGLE_ID`.
    *   Copia el **Secreto de cliente** en tu `.env` como `AUTH_GOOGLE_SECRET`.
    *   **¡Guarda bien el secreto!** Una vez cierres esa ventana, no podrás verlo completo de nuevo (tendrás que generar uno nuevo si lo pierdes).

---

### 5. Configuración de Base de Datos

Como usamos **Prisma 7** con una estructura de carpetas personalizada (`src/generated`), sigue estos comandos para inicializar la DB:

1.  Sincroniza el esquema con tu base de datos (esto crea las tablas `User` y `Account`):
    ```bash
    npx prisma db push
    ```

2.  Genera el cliente de Prisma (esto crea los archivos JS en `src/generated`):
    ```bash
    npx prisma generate
    ```

---

### 6. Ejecutar el Proyecto

Una vez configurado todo, inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

*   Si **NO** estás logueado, serás redirigido al Login.
*   Si **SÍ** estás logueado, serás redirigido al Dashboard.

---

## 📁 Estructura del Proyecto

```text
src/
├── actions/             # Server Actions (Lógica backend)
├── app/
│   ├── api/auth/        # Route Handlers de Auth.js
│   ├── dashboard/       # Ruta privada
│   ├── login/           # Ruta pública
│   ├── register/        # Ruta pública
│   └── turnos/          # Ruta protegida de ejemplo
├── components/          # Componentes React (Navbar, GoogleButton)
├── generated/           # Cliente Prisma generado (NO editar manualmente)
├── lib/
│   ├── prisma.ts        # Instancia Singleton de la DB
│   └── zod.ts           # Esquemas de validación
└── middleware.ts        # Protección de rutas
```

## 🐛 Solución de Problemas Comunes

- **Error de conexión (Timeout / active=0):** Asegúrate de que `DATABASE_HOST` sea `127.0.0.1` en el `.env`.
- **Error "Configuration" al loguearse:** Falta la tabla `Account` en la DB (`npx prisma db push`) o las credenciales de Google están mal.
- **Error de rutas Prisma:** Si moviste carpetas, borra `node_modules` `.next` `package-lock.json` y ejecuta `npm install` y `npx prisma generate` de nuevo.
- **Si modificas la estructura de la DB:** borra `node_modules` `.next` `package-lock.json` y ejecuta `npm install`, `npx prisma db pull` y `npx prisma generate`