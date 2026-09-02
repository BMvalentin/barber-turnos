# PENDIENTES.md — Plan directivo

> **Estado: CERRADO el 01-sep-2026.** Todas las tareas pendientes fueron implementadas, verificadas
> y certificadas. Este archivo se conserva como referencia de cierre; no contiene tareas pendientes.

## Historial de cierre

| Tarea | Estado | Fecha |
|---|---|---|
| Fases 9-15 (ciclo de ordenamiento: constantes, consultas, seguridad, desglose de actions/lib/UI, QA global) | Completado y certificado (V9…V15) | ago-2026 |
| Apéndice A — Selector visual de barberos con tarjetas de foto | Completado y certificado (V-A) | ago-2026 |
| Apéndice B — Rediseño del modal "Nuevo Turno" en flujo completo de reserva | Completado y certificado (V-B) | ago-2026 |
| Apéndice C — Flujo de turnos USER vs ADMIN + estado de pago de la seña + calendario tras ícono + completar perfil | Completado y certificado (V-C) | ago-2026 |
| Apéndice D — Corrección: revertir modal de reserva y aplicar "calendario tras ícono" a la navegación de `/admin/turno` | Completado y certificado (V-D) | ago-2026 |
| Apéndice E — Actualización inmediata del listado de turnos al crear un turno | Completado y certificado (V-E) | ago-2026 |
| Apéndice F — Horarios ocupados no seleccionables + endurecer condición de carrera (transacción) | Completado y certificado (V-F) | ago-2026 |
| Apéndice G — Corrección doble reserva: TiDB sin `SERIALIZABLE` (Opción A: `claveSlot` + `RepeatableRead`) | Completado y certificado (V-G) | ago-2026 |
| Apéndice H — Flujo de confirmación de turno + pago Mercado Pago + notificaciones | Completado y certificado (V-H) | ago-2026 |
| Apéndice I — Modal "Reservar turno": mostrar únicamente horarios realmente disponibles | Completado y certificado (V-I) | ago-2026 |
| Apéndice J — "Configuración" como grupo desplegable del sidebar principal del admin | Completado y certificado (V-J) | 01-sep-2026 |

## Gates finales verificados (01-sep-2026)

- `npx tsc --noEmit` = **0 errores**.
- `npm run lint` sin errores nuevos (solo preexistentes en archivos ajenos).
- Sistema de color y contraste intactos (`var(--page-*)` / `var(--admin-*)`).
