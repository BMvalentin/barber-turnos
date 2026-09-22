# AGENTS.md

## Propósito

Este archivo define cómo trabajar de forma segura y consistente en este repositorio. Su objetivo es
proteger el tipado, la arquitectura, la seguridad y los cambios locales sin imponer refactors ajenos
a la tarea.

Antes de actuar, leer este archivo completo y revisar el estado real del repositorio. Si una
afirmación documental contradice el código o la configuración vigente, verificarla y comunicar la
discrepancia; no inventar compatibilidad ni conservar reglas obsoletas.

## Fuentes de verdad

Usar, en este orden, las fuentes relevantes para cada decisión:

1. El pedido actual del usuario y el alcance acordado.
2. `AGENTS.md` para reglas de trabajo del repositorio.
3. Configuración ejecutable: `package.json`, `package-lock.json`, `tsconfig.json`,
   `eslint.config.mjs`, `next.config.ts`, `prisma.config.ts` y `prisma/schema.prisma`.
4. El código y los patrones existentes del dominio que se modifica.
5. La documentación de `docs/`.

`README.md` contiene información histórica y no debe usarse para confirmar versiones o arquitectura
sin contrastarla con las fuentes anteriores. Consultar `package.json` y `package-lock.json` para las
versiones exactas; no fijarlas de memoria en documentación nueva.

## Estado actual del proyecto

- Aplicación de reservas para barbería con Next.js 15 App Router y React 19.
- TypeScript estricto, Tailwind CSS 4 y Zod.
- Prisma 7 con MariaDB/MySQL y `@prisma/adapter-mariadb`.
- Auth.js v5 beta con Google, credenciales, Prisma Adapter y sesiones JWT.
- Mercado Pago Checkout Pro con OAuth y webhooks.
- Envío de correo con Resend y React Email; imágenes en Cloudinary.
- No hay un runner de pruebas automatizadas configurado actualmente.

El cliente de Prisma se genera en `generated/prisma`. Es código generado: nunca editarlo a mano.

## Reglas obligatorias

### Alcance y preservación del trabajo

- Ejecutar `git status --short` antes de editar y revisar el diff al terminar.
- Tratar los cambios existentes como trabajo del usuario. No revertirlos, sobreescribirlos,
  formatearlos en masa ni incluirlos en el alcance sin necesidad.
- Hacer el cambio mínimo completo. Evitar limpiezas, renombrados y migraciones de carpetas no
  requeridos para resolver la tarea.
- No usar comandos destructivos (`git reset --hard`, `git clean`, borrados recursivos, restauraciones
  de archivos) salvo pedido explícito y con el destino exacto verificado.
- No crear commits, ramas, PR ni instalar o actualizar dependencias salvo que el usuario lo pida o
  sea imprescindible para el objetivo y se explique antes.
- No ocultar errores ni atribuirlos a un estado previo sin reproducir un baseline verificable.

### Idioma y nomenclatura

- La interfaz, los mensajes al usuario, la documentación propia y los comentarios deben estar en
  español claro.
- Preferir español para nombres nuevos de dominio cuando no rompa una convención existente.
- Conservar nombres exigidos por Next.js, React, Auth.js, Prisma, APIs externas y librerías:
  `page`, `layout`, `route`, `middleware`, `GET`, `POST`, `useSession`, `signIn`, `user`, `account`,
  props de terceros, etc.
- No renombrar símbolos, archivos o carpetas existentes solo para traducirlos. La consistencia local
  y la compatibilidad tienen prioridad sobre una traducción incidental.
- Seguir los patrones actuales: componentes en `PascalCase.tsx`, hooks `useCamelCase.ts`, acciones
  `*.actions.ts` y utilidades preferentemente en `kebab-case.ts`.

### TypeScript y calidad

- Mantener `strict: true`. No relajar `tsconfig.json`, ESLint ni `next.config.ts` para hacer pasar un
  cambio.
- Prohibido introducir `any`, `@ts-ignore` o `@ts-nocheck`. Usar tipos concretos; para datos externos,
  usar `unknown` y estrechamiento seguro.
- `@ts-expect-error` solo es admisible ante una incompatibilidad externa demostrable, con comentario
  que explique el motivo y una verificación que garantice que sigue siendo necesario.
- No usar aserciones de tipo para evitar validar datos. `as` expresa conocimiento del compilador, no
  valida valores en runtime.
- Validar toda entrada no confiable en el límite del sistema: formularios, `searchParams`, cuerpos de
  requests, webhooks, variables de entorno y respuestas externas.
- Manejar errores con mensajes útiles sin exponer secretos, tokens, datos personales ni detalles
  internos innecesarios.
- Mantener módulos cohesivos y con una responsabilidad reconocible. No existe una regla artificial
  de una sola función exportada: route handlers, configuración, tipos y constantes pueden requerir
  varios exports relacionados.
- Usar el tamaño del archivo como señal, no como métrica automática. Considerar dividir un archivo
  cercano a 300 líneas y justificar o separar responsabilidades si supera 400. No refactorizar un
  archivo ajeno solo por su longitud.

### Seguridad y datos

- La autorización siempre se aplica en el servidor. Ocultar controles en la UI no es una medida de
  seguridad.
- Las Server Actions y Route Handlers deben validar entrada, autenticar y autorizar antes de mutar
  datos.
- Mantener secretos únicamente en el servidor. No leer ni imprimir `.env`; nunca exponer una variable
  sensible con prefijo `NEXT_PUBLIC_`.
- No registrar contraseñas, tokens, firmas, cookies, cuerpos completos de webhooks ni datos personales.
- En pagos, no confiar en estado, importe, referencia ni identidad enviados por el cliente. Verificar
  contra Mercado Pago, validar la firma del webhook y mantener las operaciones idempotentes.
- En reservas, preservar los controles de concurrencia, locks, restricciones únicas y transacciones.
  No separar lecturas y escrituras que deban ser atómicas.
- Usar las utilidades de fecha y zona horaria existentes. Evitar conversiones manuales que dependan de
  la zona horaria del proceso.

## Arquitectura vigente

No crear una segunda arquitectura ni mover archivos como efecto colateral.

- `src/app/`: rutas, layouts, loading/error/not-found, metadata y Route Handlers de App Router. Las
  páginas deben componer la vista; extraer UI o lógica compleja a su dominio.
- `src/actions/<dominio>/`: Server Actions por dominio (`turnos`, `barberos`, `servicios`, `horarios`,
  `excepciones`, `configuracion`, `sesion`, `mercadopago`). Deben actuar como frontera: validar,
  autorizar, orquestar, revalidar y devolver resultados tipados.
- `src/components/<dominio>/`: ubicación canónica para componentes nuevos. Los Server Components son
  la opción por defecto; agregar `"use client"` solo cuando hagan falta estado, efectos, eventos o APIs
  del navegador.
- `src/componentes/`: subárbol parcial existente. No ampliarlo ni migrarlo incidentalmente. Cualquier
  unificación entre `components` y `componentes` requiere una tarea explícita con actualización de
  imports y verificación completa.
- `src/lib/`: infraestructura y lógica reutilizable. Extraer aquí lógica de negocio o transacciones
  cuando se reutilice o cuando una action/route deje de ser una frontera fácil de leer.
- `src/hooks/`: lógica reutilizable del cliente. No acceder desde hooks a secretos ni infraestructura
  exclusiva del servidor.
- `src/types/`: tipos compartidos entre dominios. Los tipos locales deben permanecer junto a la
  funcionalidad que los usa.
- `src/contextos/`: contextos de React. Evitar contextos globales para estado que puede permanecer
  local o en el servidor.
- `src/emails/`: plantillas de React Email; mantener compatibilidad con clientes de correo y estilos
  soportados.
- `src/auth.ts`, `src/auth.config.ts` y `src/middleware.ts`: archivos legítimos de infraestructura en
  la raíz de `src`; no moverlos por una regla genérica de carpetas.
- `prisma/`: esquema, migraciones y seed. Las migraciones representan historial y deben revisarse; no
  reescribir migraciones ya aplicadas salvo una tarea explícita.

### Imports y fronteras

- Usar el alias `@/` para cruzar carpetas o dominios dentro de `src`.
- Permitir imports relativos dentro de una misma funcionalidad cuando resulten más claros.
- La importación relativa hacia `generated/prisma` es una excepción necesaria porque está fuera de
  `src` y el alias `@/` no la cubre.
- Evitar dependencias circulares y archivos barril que oculten fronteras o incorporen código de cliente
  en módulos del servidor.
- No importar módulos exclusivos del servidor desde Client Components. Mantener Prisma, secretos,
  filesystem y SDKs privilegiados fuera del bundle del navegador.

### Prisma y persistencia

- Reutilizar el singleton de `src/lib/prisma.ts`; no crear nuevas instancias de `PrismaClient` en la
  aplicación.
- Si cambia `prisma/schema.prisma`, validar el esquema y revisar índices, relaciones, nulabilidad,
  defaults y migración de datos.
- Con `relationMode = "prisma"`, los índices necesarios no se crean por claves foráneas: revisar los
  patrones de consulta al modificar relaciones.
- Preferir migraciones versionadas y revisables para cambios de esquema. No usar `db push` como
  sustituto automático de una migración.
- No ejecutar `prisma db push`, `prisma migrate`, `prisma db seed` ni SQL contra una base sin confirmar
  antes el entorno y el impacto.

### Tema, colores y contraste

- Las fuentes canónicas son `src/app/globals.css`, `src/app/layout.tsx` y `src/lib/contraste/`.
- Reutilizar los tokens CSS existentes; no hardcodear colores de marca ni propagar colores por props
  fuera de una vista previa/configurador que lo necesite explícitamente.
- Sobre fondos sólidos de marca usar los tokens `--page-*-foreground`. Para texto de marca sobre
  superficies sólidas usar las variantes de tinta existentes. Sobre superficies translúcidas de
  marca usar un token de texto de la superficie, como `--admin-texto-primario`.
- No duplicar cálculos de luminancia o contraste. Extender las utilidades de `src/lib/contraste/` y
  mantener la validación `#RRGGBB` en la frontera de configuración.
- Si se agregan o renombran tokens, buscar todos sus consumidores y verificar visualmente al menos una
  configuración clara y una oscura.

## Uso de subagentes

Los subagentes son una herramienta de ejecución, no un requisito ceremonial.

### Cuándo usarlos

- Cuando haya dos o más subtareas sustantivas e independientes.
- Para auditorías amplias, investigación especializada o validaciones que puedan correr en paralelo.
- Para separar implementación y revisión en cambios grandes, compartidos o de alto riesgo.

No desplegarlos para una edición pequeña, una pregunta puntual o trabajos que dependan continuamente
del mismo archivo o de decisiones secuenciales.

### Cómo coordinarlos

- El agente principal conserva la coordinación, define interfaces, integra resultados y decide el
  cierre.
- Cada prompt debe incluir objetivo, alcance, archivos permitidos, restricciones, criterios de
  aceptación y validaciones esperadas. El subagente debe leer este `AGENTS.md`; no hace falta copiarlo
  entero en el prompt.
- Asignar propiedad exclusiva de archivos cuando haya escrituras. Dos agentes no deben editar el
  mismo archivo ni conjuntos que se importan mutuamente sin una secuencia explícita.
- Las investigaciones de solo lectura sí pueden ejecutarse en paralelo.
- Un agente verificador revisa primero sin editar. Solo puede reparar problemas dentro del alcance
  autorizado y después de que el agente principal evalúe sus hallazgos.
- Cada subagente debe informar archivos tocados, decisiones, comandos ejecutados, resultados y riesgos
  pendientes.
- Después de integrar, el agente principal revisa el diff completo y ejecuta las verificaciones
  finales; no delega la responsabilidad del resultado.

## Flujo de trabajo

1. Leer el pedido, este archivo y las configuraciones relevantes.
2. Revisar `git status --short`, ubicar cambios existentes y delimitar el alcance.
3. Inspeccionar implementaciones vecinas antes de diseñar una solución nueva.
4. Si ayuda, obtener un baseline reproducible antes de editar.
5. Implementar el cambio mínimo completo, respetando fronteras servidor/cliente y contratos existentes.
6. Revisar el diff, imports, estados vacíos/error/carga, accesibilidad y seguridad del dominio.
7. Ejecutar validación proporcional al cambio.
8. Entregar un resumen honesto con archivos cambiados, validaciones y riesgos o pendientes reales.

## Verificación

### Cambios de TypeScript o JavaScript

Ejecutar antes de finalizar:

```bash
npx --no-install tsc --noEmit --incremental false
npm run lint
```

`npm run lint` usa actualmente `next lint`, que está deprecado pero es el comando vigente y funcional
del proyecto. No ejecutar `npx eslint .` como sustituto hasta que la configuración excluya de forma
correcta `.next` y `generated`; la migración del script de lint debe hacerse como tarea separada.

### Cambios de Prisma

Ejecutar como mínimo:

```bash
npx --no-install prisma validate
npx --no-install prisma generate
```

`prisma generate` corresponde cuando cambia el esquema. Además, revisar la migración generada o escrita
y probarla únicamente contra una base identificada como segura.

### Build

`npm run build` no es una comprobación inocua: el script actual ejecuta `prisma generate` y
`prisma db push` contra `DATABASE_URL`, y continúa incluso si el push falla. No usarlo como validación
rutinaria ni ejecutarlo sin confirmar el destino de la base de datos.

Cuando se necesite validar solo Next.js y el entorno esté preparado, puede usarse:

```bash
npx --no-install next build
```

Este comando escribe `.next` y el render de rutas puede requerir variables de entorno o acceso a
servicios. Documentar cualquier limitación real; no simular éxito.

### Pruebas funcionales

No hay suite automatizada configurada. Realizar comprobaciones manuales dirigidas al flujo cambiado y
describirlas. Para cambios críticos de reservas, autenticación, cron o pagos, cubrir como mínimo camino
feliz, entrada inválida, falta de autorización, reintento/idempotencia y fallo del proveedor cuando
aplique.

Los cambios exclusivos de documentación no requieren typecheck ni build, pero sí revisión del diff y
comprobación de que comandos, rutas y afirmaciones coincidan con el repositorio actual.

## Criterios de finalización

Una tarea está terminada cuando:

- el pedido está implementado sin ampliar el alcance de manera innecesaria;
- no se perdieron ni alteraron cambios ajenos;
- el código nuevo mantiene tipado estricto, validación, autorización y manejo de errores;
- las verificaciones proporcionales pasan, o se informa exactamente qué falló y por qué;
- no quedan logs de depuración, secretos, placeholders accidentales ni código generado editado;
- la respuesta final resume resultado, archivos modificados, validaciones y cualquier riesgo pendiente.
