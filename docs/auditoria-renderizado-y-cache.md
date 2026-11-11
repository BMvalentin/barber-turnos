# Auditoría de renderizado y caché

## Criterio aplicado

Se revisaron las rutas de `src/app`, sus componentes y las lecturas de datos que
utilizan. Una directiva `"use client"` no elimina por sí sola el trabajo del servidor:
una Server Action sigue ejecutándose allí y un componente cliente también puede
renderizarse inicialmente en el servidor. Las vistas se trasladaron al navegador
cuando podían reutilizar datos públicos o evitar consultas sin debilitar los controles.

| Área | Resultado | Motivo |
| --- | --- | --- |
| Portada | `HomeClient` y el carrusel de servicios son cliente. Carrusel y horarios públicos usan `localStorage` con validación y vencimiento de 60 segundos. | Son datos públicos que cambian poco. Las mutaciones del panel invalidan la caché de la pestaña y otras pestañas reciben el evento de almacenamiento. |
| Diseño global | El layout raíz permanece en servidor y solo envía nombre y logo al encabezado cliente. | Genera metadatos, aplica los colores de configuración y obtiene la sesión. La configuración se reutiliza con caché de servidor. |
| Reserva | Página y layout de `/turno` permanecen en servidor. | Verifican sesión, rol y datos necesarios para reservar. La disponibilidad conserva caché breve de servidor con invalidación; los cupos no se persisten en el navegador. |
| Panel administrativo | Páginas protegidas permanecen en servidor; formularios y controles interactivos ya son cliente. El catálogo interno reutiliza una caché en memoria de cinco minutos, separada por usuario. | Las páginas consultan datos privados y aplican autorización. La caché del catálogo evita una nueva consulta al volver durante la navegación. |
| Usuarios del panel | El listado inicial y las búsquedas usan páginas de 20 cuentas, con búsqueda y filtros validados en el servidor. | Se evita cargar y serializar todas las cuentas en cada entrada. Los contadores por rol solo se recalculan al entrar o tras una mutación. |
| Sidebar del panel | Su preferencia de ancho se guarda como cookie y se sincroniza con `localStorage`. | El layout puede renderizar desde el inicio el mismo estado que verá React después de hidratar, incluso al pulsar F5. |
| Turnos del panel | Se conserva la caché existente en `localStorage`, por pedido del usuario, con alcance por usuario/rol/barbero y vencimiento de diez minutos. | Permite reutilizar la colección en calendario, filtros y lista sin una consulta en cada navegación. |
| Dashboard | La página protegida permanece en servidor, usa los datos del perfil ya presentes en la sesión y consulta turnos y medios de pago al abrir «Mis turnos». | Las Server Actions verifican la sesión o el propietario y devuelven solo la proyección necesaria. Abrir «Mi perfil» ya no consulta usuario, turnos ni configuración de pagos; el retorno posterior al inicio de sesión aún verifica el destino en la base. |
| Pagos, cuenta y legales | Registro y avisos de pago fallido/pendiente son cliente. Confirmación de pago, pruebas de Mercado Pago y páginas con metadatos o lecturas protegidas permanecen en servidor. | El estado real del pago debe verificarse en el servidor. Los identificadores de URL se validan antes de usarlos. |

Los componentes de presentación sin directiva propia que se importan desde un
componente cliente ya forman parte de ese árbol cliente. Agregarles la directiva
individualmente no reduciría consultas y puede ampliar el código enviado al navegador.

## Lecturas que siguen en cada área

| Ruta | Lectura al entrar | Estado |
| --- | --- | --- |
| Todas las rutas | Sesión JWT y configuración visual. | La configuración usa caché de servidor de cinco minutos; la sesión permite personalizar el encabezado. |
| `/admin` | Estadísticas y agenda del día. | Las seis consultas tienen caché de servidor de 30 segundos y se invalidan por cambios de dominio. |
| `/admin/barbero` y `/admin/barbero/perfil` | Servicios, horarios y perfiles profesionales. | Los datos compartidos usan caché de servidor de 3 a 5 minutos con etiquetas de invalidación. |
| `/admin/turno` y `/turno` | Catálogo de reserva al renderizar y colección de turnos al montar si falta o venció la caché local. | El catálogo tiene caché de servidor de cinco minutos. La colección completa sigue siendo el costo principal; el calendario emergente reutiliza ahora esa misma colección. |
| `/admin/usuarios` | Conteos y la primera página de 20 cuentas. | Cambiar pestaña, página o búsqueda consulta solo la página solicitada; los conteos por rol no se repiten en cada búsqueda. |
| `/admin/config/*` | Configuración, horarios o excepciones de la sección. | Las lecturas comunes están cacheadas. La conexión con Mercado Pago se consulta solo al abrir su pestaña y su nombre externo tiene caché breve. |
| `/pago/status` y `/pago/success` | Estado de pago y propiedad del turno. | Deben verificarse en el servidor; no se acepta como verdadero el estado de la URL. |

Las rutas de configuración y el panel de administración siguen enviando una
respuesta de servidor para comprobar permisos. Mover solo su JSX al cliente no
eliminaría esas verificaciones ni las consultas necesarias para mostrar datos
actualizados.

## Almacenamiento y límites

La cookie nueva contiene solo la preferencia visual del sidebar (`0` o `1`). La
sesión ya utiliza cookies de Auth.js y la intención de consentimiento legal tiene
su propio mecanismo. No se guardan datos de negocio en cookies: viajarían en cada
solicitud y no serían una fuente confiable para autorización, importes, estado de
pagos o disponibilidad.

La caché local de turnos incluye datos de clientes e importes. Su limpieza al
cerrar sesión y su vencimiento reducen exposición accidental, pero los datos
permanecen accesibles en ese navegador hasta que se borren. El panel también
mantiene `getTodosTurnos()` sin límite de filas porque calendario, filtros y lista
usan la colección completa. Para escalar a volúmenes grandes hace falta cambiar
juntos esos contratos a `getTurnos` paginado y `obtenerResumenCalendario` por mes,
con caché local por usuario, filtro y página. Un `take` arbitrario ocultaría turnos
históricos.

## Verificación y estado del repositorio

`npm run lint` pasa con dos advertencias de variables sin usar en
`src/actions/servicios/crear.actions.ts`. El typecheck ya fallaba antes de esta
auditoría: el paquete Vitest figura en `package.json` pero falta en la instalación
local, y el cliente Prisma generado no contiene el modelo `consentimiento_legal`
que sí aparece en `prisma/schema.prisma`. No se instaló dependencias ni se
regeneró Prisma como efecto secundario de esta tarea.

`AGENTS.md` describe un build con `db push` y ausencia de runner de pruebas;
el `package.json` actual define `prisma migrate deploy` y un script de Vitest.
No se ejecutó `npm run build` para evitar una migración sobre la base configurada.
