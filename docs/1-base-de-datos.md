# Guía de base de datos: configuración de variables de entorno

Guía paso a paso para configurar las variables de entorno de base de datos del proyecto. Hay dos opciones disponibles: una base de datos local (recomendada para desarrollo) o una base de datos en la nube (TiDB Cloud).

## Variables de entorno implicadas

El archivo `.env.example` de la raíz define estas variables. Todas deben copiarse al archivo `.env` real y completarse según la opción elegida.

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/db_barber"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="db_barber"
CA="./isrgrootx1.pem"   # opcional, solo TiDB Cloud
```

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión completa que usa el CLI de Prisma (`prisma db push`, `prisma generate`). |
| `DATABASE_HOST` | Dirección del servidor de base de datos. |
| `DATABASE_PORT` | Puerto del servidor de base de datos. |
| `DATABASE_USER` | Usuario de la base de datos. |
| `DATABASE_PASSWORD` | Contraseña del usuario (vacía si no tiene). |
| `DATABASE_NAME` | Nombre de la base de datos a usar. |
| `CA` | Ruta al certificado CA de TiDB Cloud (opcional, solo para la Opción B). |

> **Importante:** el adaptador nativo de Prisma (`@prisma/adapter-mariadb`) usa en runtime `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` para conectarse (ver `src/lib/prisma.ts`). La variable `DATABASE_URL` se usa únicamente para los comandos del CLI.

---

## Opción A — MySQL/MariaDB local con XAMPP (recomendada)

Opción recomendada para desarrollo: no requiere conexión a internet y los datos viven en tu propia máquina.

### Pasos

1. **Descargar XAMPP** desde el sitio oficial: <https://www.apachefriends.org/es/index.html>.
2. **Instalar** el paquete siguiendo el asistente de instalación (se pueden mantener las opciones por defecto).
3. **Abrir el panel de control** (Control Panel) de XAMPP.
4. **Iniciar los módulos Apache y MySQL** haciendo clic en el botón **Start** de cada uno. Cuando el módulo MySQL quede activo, su columna aparecerá resaltada (generalmente en verde).
5. **Abrir phpMyAdmin** en el navegador entrando a <http://localhost/phpmyadmin>. Es la herramienta web que trae XAMPP para administrar la base de datos.
6. **Crear una base de datos nueva** desde la pestaña *Bases de datos* de phpMyAdmin. Escribir el nombre, por ejemplo `db_barber`, y presionar **Crear**.

### Por qué se usa `127.0.0.1` y no `localhost`

Usar `127.0.0.1` en `DATABASE_HOST` evita que Node.js resuelva `localhost` a `::1` (IPv6). Cuando ocurre esa resolución, el cliente de MariaDB intenta activar SSL de forma predeterminada y puede generar timeouts o errores de conexión. Al indicar la IP IPv4 directamente se conecta de forma inmediata y sin SSL innecesario.

### Valores a completar en `.env`

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/db_barber"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="db_barber"
```

**Si el usuario `root` tiene contraseña:**

- Colocarla en `DATABASE_PASSWORD`.
- Colocarla también dentro de `DATABASE_URL`, después de los dos puntos que siguen al usuario. Ejemplo con contraseña `mi_password`:

```env
DATABASE_URL="mysql://root:mi_password@127.0.0.1:3306/db_barber"
DATABASE_PASSWORD="mi_password"
```

**Si XAMPP usa otro puerto** (por ejemplo `3307` por tener otro MySQL instalado):

```env
DATABASE_PORT=3307
DATABASE_URL="mysql://root:@127.0.0.1:3307/db_barber"
```

El puerto por defecto de MySQL es el `3306`; solo hace falta cambiarlo si lo configuraste distinto.

---

## Opción B — TiDB Cloud (base de datos cloud)

Opción para trabajar con una base de datos hospedada en la nube, compatible con MySQL.

### Pasos

1. **Crear una cuenta** en <https://www.tidbcloud.com/>.
2. **Crear un cluster** eligiendo el **Tier libre (Serverless)**.
3. **Obtener los datos de conexión** en la pestaña **Connect** del cluster: ahí se muestran el host (gateway), el puerto, el usuario y la contraseña generada.

### Formato de la URL de conexión

```env
DATABASE_URL="mysql://USUARIO.CLUSTER:PASSWORD@HOST:4000/db_barber?sslaccept=strict"
```

Donde:

- `USUARIO.CLUSTER` es el usuario en formato `usuario.cluster` (puede verse distinto si la cuenta usa el prefijo `user`).
- `PASSWORD` es la contraseña que TiDB genera para el cluster.
- `HOST` es la dirección del gateway, con formato similar a `gateway01.us-west-2.prod.aws.tidbcloud.com`.
- `4000` es el puerto de conexión de TiDB Cloud Serverless.
- `?sslaccept=strict` exige una conexión cifrada con SSL.

### Variables a completar

```env
DATABASE_HOST="gateway01.us-west-2.prod.aws.tidbcloud.com"
DATABASE_PORT=4000
DATABASE_USER="usuario.cluster"
DATABASE_PASSWORD="la_contraseña_del_cluster"
DATABASE_NAME="db_barber"
```

| Variable | Valor |
| --- | --- |
| `DATABASE_USER` | Usuario en formato `usuario.cluster`. |
| `DATABASE_HOST` | El gateway que muestra TiDB Cloud (ej. `gateway01.us-west-2.prod.aws.tidbcloud.com`). |
| `DATABASE_PORT` | `4000`. |
| `DATABASE_NAME` | Nombre de la base de datos dentro del cluster. |

### Certificado CA (variable `CA`)

TiDB Cloud Serverless puede requerir un certificado CA para validar la conexión SSL.

1. **Descargar el certificado** desde la página del cluster (TiDB lo indica en su sección *Connect* / documentación). La raíz de confianza está disponible en <https://www.pki.goog/roots.pem> y la documentación oficial de TiDB está en <https://docs.pingcap.com/tidbcloud/>.
2. **Guardarlo en la raíz del proyecto** y apuntar la ruta en la variable `CA`.
3. El certificado del archivo `.env` real se llama `isrgrootx1.pem`, pero el nombre puede ser cualquiera siempre que la ruta apunte al archivo correcto.

```env
CA="./isrgrootx1.pem"
```

---

## Comandos de sincronización

El proyecto usa Prisma 7 con `prisma.config.ts`, que lee `DATABASE_URL` para los comandos del CLI. Ejecutarlos desde la raíz del proyecto.

```bash
npx prisma generate
npx prisma db push
```

- `npx prisma generate` — genera el cliente Prisma en `generated/prisma`.
- `npx prisma db push` — crea las tablas en la base de datos indicada por `DATABASE_URL` (opcionalmente con `--accept-data-loss` para forzar cambios destructivos en desarrollo).

**Opcional — sembrar datos iniciales:**

```bash
npm run seed
```

O directamente:

```bash
npx prisma db seed
```

El seed está en `prisma/seed.ts` y crea los días laborables, entre otros datos iniciales.

> **Recordatorio:** el adaptador nativo en `src/lib/prisma.ts` usa `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD` y `DATABASE_NAME` para la conexión en runtime; la URL solo la usa el CLI de Prisma. Si conectas a una base distinta desde la app, revisa esas cuatro variables además de `DATABASE_URL`.

---

## Solución de problemas comunes

| Error | Causa probable | Solución |
| --- | --- | --- |
| Timeout de conexión / `active=0` | Node.js resolvió `localhost` a IPv6 (`::1`) y activó SSL innecesario. | Usar `127.0.0.1` en `DATABASE_HOST` (y en la URL). |
| `Access denied for user 'root'@...` | Credenciales incorrectas. | Revisar `DATABASE_USER` y `DATABASE_PASSWORD`, y que coincidan en `DATABASE_URL`. |
| `Unknown database 'db_barber'` | La base de datos no existe o el nombre no coincide. | Crear primero la base de datos en phpMyAdmin/TiDB o corregir `DATABASE_NAME`. |

### Consejos generales

- **Copiar `.env.example` a `.env`** antes de modificar cualquier valor: `.env` no se versiona y `.env.example` queda intacto como referencia.
- **Tras cada cambio en `.env` hay que reiniciar el servidor** (`npm run dev`) y, si cambiaron las variables de conexión, volver a ejecutar `npx prisma generate`.
- Verificar que los servicios de XAMPP estén iniciados (Apache y MySQL) antes de correr cualquier comando de Prisma.
