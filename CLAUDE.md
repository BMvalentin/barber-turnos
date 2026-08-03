### PROHIBIDO BORRAR ESTAS REGLAS SOLO ES DE LECTA
# Estándares de Desarrollo

## Filosofía

Antes de escribir código:

1. Analizar el código existente.
2. Reutilizar componentes, hooks y services ya existentes.
3. No crear nuevos patrones si ya existe uno similar.
4. Modificar lo mínimo posible.
5. Mantener consistencia con el resto del proyecto.
6. Priorizar simplicidad sobre complejidad.
7. Evitar sobreingeniería.

---

## TypeScript

### Nunca usar:

- any
- @ts-ignore
- @ts-nocheck

Solo pueden utilizarse si el usuario lo solicita explícitamente.

Siempre preferir:

- unknown
- generics
- type guards
- tipos inferidos
- tipos de Prisma
- tipos de Zod

Todo parámetro y retorno debe estar tipado.

No dejar tipos implícitos cuando puedan declararse.

---

## Componentes

Los componentes deben tener una única responsabilidad.

Evitar componentes mayores a 200 líneas.

Si un componente comienza a manejar:

- formularios
- fetch
- modales
- filtros
- tablas
- estados complejos

extraer esa lógica a hooks reutilizables.

No escribir lógica compleja dentro del JSX.

Evitar ternarios anidados.

---

## Hooks

Toda lógica reutilizable debe implementarse mediante Custom Hooks.

Ejemplos:

- manejo de formularios
- paginación
- filtros
- upload
- búsqueda
- selección
- tablas

Nunca duplicar lógica entre componentes.

---

## Server Actions

Las Actions deben contener únicamente:

- validación
- autorización
- llamada al service
- revalidateTag
- respuesta

Toda lógica de negocio pertenece a:

lib/services

No duplicar consultas Prisma dentro de Actions.

---

## Services

Los Services deben:

- contener únicamente consultas Prisma
- ser reutilizables
- no realizar validaciones
- no realizar autorización
- no llamar revalidateTag

---

## Prisma

Siempre optimizar consultas.

Preferir:

select

antes que

include

si no es necesario.

No traer columnas que no se utilizan.

Evitar consultas repetidas.

Si una consulta se repite en varios lugares, crear un Service reutilizable.

---

## Código

Siempre aplicar:

- DRY
- KISS
- SOLID (cuando aporte valor)

Eliminar código muerto.

Eliminar imports sin utilizar.

Eliminar variables sin utilizar.

No dejar comentarios innecesarios.

El código debe ser autoexplicativo.

---

## Performance

Evitar renders innecesarios.

No utilizar useMemo o useCallback sin necesidad.

Optimizar únicamente cuando exista una razón.

---

## Organización

Mantener esta estructura:

actions/
components/
hooks/
lib/
services/
types/
constants/

No crear carpetas nuevas si ya existe una apropiada.

---

## Dependencias

No instalar nuevas librerías sin una ventaja clara.

Antes de agregar una dependencia:

1. Revisar si ya existe una solución en el proyecto.
2. Revisar si puede resolverse con React o Next.js.
3. Explicar por qué la nueva dependencia es necesaria.

---

## Respuestas

Cuando propongas cambios:

- explicar brevemente la solución
- modificar la menor cantidad posible de código
- no romper funcionalidades existentes
- respetar la arquitectura del proyecto

Nunca reescribir archivos completos si basta con modificar unas pocas líneas.

## Manejo de errores

Nunca utilizar:

catch (e: any)

Siempre utilizar:

```ts
catch (error: unknown)
```

Si es necesario acceder a propiedades:

```ts
if (error instanceof Prisma.PrismaClientKnownRequestError) {
   ...
}
```

o

```ts
if (error instanceof Error) {
   console.error(error.message)
}
```
## React

Preferir:

- Server Components
- Server Actions

Evitar Client Components cuando no sean necesarios.

No crear estados derivados.

No duplicar estado.

Utilizar useEffect únicamente cuando realmente sea necesario.

Evitar efectos que puedan reemplazarse por cálculo directo.

## Antes de generar código

Antes de escribir una sola línea de código debes:

1. Buscar componentes similares.
2. Buscar hooks similares.
3. Buscar actions similares.
4. Buscar services similares.
5. Buscar utilidades similares.

Si existe código reutilizable, utilizarlo.

No reinventar implementaciones.

## Prioridad

Siempre elegir la solución que tenga:

1. menos código
2. mayor reutilización
3. mejor legibilidad
4. mejor tipado
5. menor complejidad
6. menor impacto sobre el proyecto

Nunca generar código "porque sí".

Cada línea debe aportar valor.

## TypeScript (Regla Obligatoria)

El uso de `any` está prohibido.

Si no es posible tipar correctamente, detenerse y buscar los tipos existentes del proyecto (Prisma, Zod, React, Next.js, Auth.js, etc.).

Solo utilizar `any` si el usuario lo solicita explícitamente o si no existe ninguna alternativa técnicamente viable. En ese caso, explicar por qué fue necesario.

# Objetivo del Agente

El objetivo principal es mantener un código limpio, reutilizable, tipado y consistente con la arquitectura existente.

Antes de implementar cualquier cambio:

- comprender el contexto completo
- analizar archivos relacionados
- reutilizar implementaciones existentes
- modificar la menor cantidad posible de código
- evitar introducir deuda técnica

La prioridad siempre es mantener la calidad del proyecto por encima de la velocidad de implementación.

# Prioridad de decisiones

Cuando existan varias soluciones, elegir siempre en este orden:

1. Mantener la arquitectura existente.
2. Reutilizar código.
3. Mantener el tipado.
4. Reducir complejidad.
5. Mejorar legibilidad.
6. Mejorar rendimiento.
7. Escribir menos código.

Nunca elegir una solución únicamente porque sea más rápida de implementar.

# Malas prácticas prohibidas

Nunca:

- usar any
- usar ts-ignore
- usar ts-nocheck
- duplicar lógica
- duplicar consultas Prisma
- crear componentes gigantes
- crear funciones gigantes
- crear hooks de un solo uso
- escribir lógica compleja dentro del JSX
- instalar librerías innecesarias
- romper la arquitectura existente

# Límites

Como regla general:

- Componentes: máximo 200 líneas.
- Hooks: máximo 150 líneas.
- Actions: máximo 100 líneas.
- Services: máximo 80 líneas.

Si un archivo supera esos valores, evaluar dividirlo.

# Tailwind

- Evitar clases repetidas.
- Utilizar cn() cuando corresponda.
- No escribir clases duplicadas.
- Mantener consistencia visual.
- Extraer componentes reutilizables cuando un bloque de Tailwind se repita.

# Validaciones

Toda entrada proveniente del cliente debe validarse con Zod.

Nunca confiar en datos del cliente.

No realizar validaciones manuales si ya existe un esquema Zod.

# Seguridad

Toda Action que modifique datos debe verificar autorización.

Nunca confiar en permisos enviados desde el cliente.

Las comprobaciones de permisos deben realizarse en el servidor.

---