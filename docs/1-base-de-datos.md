# Guía de base de datos: configuración de variables de entorno

Guía paso a paso para configurar las variables de entorno de base de datos del proyecto. Hay dos opciones disponibles: una base de datos local (recomendada para desarrollo) o una base de datos en la nube (TiDB Cloud).

## Variable de conexión

Definí `DATABASE_URL` en `.env` con los datos del entorno elegido. La aplicación, el seed y el CLI de Prisma usan esta misma URL.

```env
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@SERVIDOR:PUERTO/BASE_DE_DATOS"
```

Codificá los caracteres especiales de las credenciales para la URL. Por ejemplo, escribí `%40` para `@` y `%23` para `#`.

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

### Dirección local de XAMPP

Usá `127.0.0.1` en `DATABASE_URL` si el servidor de XAMPP escucha en IPv4.

### Valores a completar en `.env`

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/db_barber"
```

Si `root` tiene contraseña, agregala entre `root:` y `@`.

```env
DATABASE_URL="mysql://root:mi_password@127.0.0.1:3306/db_barber"
```

**Si XAMPP usa otro puerto** (por ejemplo `3307` por tener otro MySQL instalado):

```env
DATABASE_URL="mysql://root:@127.0.0.1:3307/db_barber"
```

Si omitís el puerto, se usa `3306`.

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
- `sslaccept=strict` indica al CLI de Prisma que valide el certificado. La aplicación y el seed siempre validan el certificado de servidores remotos con TLS.

---

## Comandos de sincronización

Ejecutá estos comandos desde la raíz del proyecto una vez que `DATABASE_URL` apunte a la base que querés inicializar o actualizar.

```bash
npx prisma generate
npx prisma migrate deploy
```

- `npx prisma generate` — genera el cliente Prisma en `generated/prisma`.
- `npx prisma migrate deploy` aplica las migraciones pendientes a la base indicada por `DATABASE_URL`.

**Opcional — sembrar datos iniciales:**

```bash
npx prisma db seed
```

El seed está en `prisma/seed.ts` y crea los días laborables.

---

## Solución de problemas comunes

| Error | Causa probable | Solución |
| --- | --- | --- |
| Timeout de conexión / `active=0` | El servidor no está disponible en esa dirección o puerto. | Verificá el servicio y usá `127.0.0.1` en `DATABASE_URL` si XAMPP escucha en IPv4. |
| `Access denied for user 'root'@...` | Credenciales incorrectas. | Revisá el usuario y la contraseña en `DATABASE_URL`. |
| `Unknown database 'db_barber'` | La base de datos no existe o el nombre no coincide. | Creá la base en phpMyAdmin o TiDB Cloud, o corregí el nombre en `DATABASE_URL`. |

### Consejos generales

- **Copiar `.env.example` a `.env`** antes de modificar cualquier valor: `.env` no se versiona y `.env.example` queda intacto como referencia.
- Después de cambiar `DATABASE_URL`, reiniciá el servidor de desarrollo y recargá la página para abrirla con la base nueva. Si cambiaste de base, volvé a iniciar sesión.
- Verificar que los servicios de XAMPP estén iniciados (Apache y MySQL) antes de correr cualquier comando de Prisma.
