# Refactorización de arquitectura por etapas

Este plan parte de los contratos reales del repositorio y de `AGENTS.md`. La auditoría inicial no encontró archivos TypeScript idénticos por contenido; las duplicaciones detectadas son de lógica, ubicación y flujos que evolucionaron por separado.

## Etapa 1: integridad de reservas y pagos

- Verificar propietario o administrador antes de mostrar datos del turno en la página de éxito de pago.
- Consultar el teléfono persistido al reservar; la actualización de sesión ya no acepta ese dato desde el cliente como fuente de verdad.
- Acotar las transiciones de confirmación, finalización y expiración de turnos. Liberar `claveSlot` al cancelar por vencimiento.
- Alinear disponibilidad visible con estado del catálogo, asignación, día laboral, turnos activos y excepciones por intervalo.
- Validar la respuesta OAuth de Mercado Pago, firmar el estado con un secreto obligatorio y evitar que eventos tardíos del webhook alteren turnos confirmados sin asociar el ID de pago.
- Unificar el envío de correos y reconocer los errores devueltos por Resend.

Estos cambios están implementados en el árbol de trabajo. Falta probar las rutas críticas contra una base y cuentas de prueba identificadas como seguras.

## Etapa 2: fronteras y duplicación

- Mantener las acciones de imágenes en sus dominios (`barberos` y `configuracion`) y los componentes de excepciones en `src/components/horarios/`.
- Compartir la serialización de servicios, los datos de transferencia y las estadísticas del panel desde `src/lib/`.
- Devolver el resultado real al eliminar un cierre; la interfaz solo comunica éxito cuando la acción terminó correctamente.
- Consolidar las páginas de resultado de pago (`success`, `status`, `pending`, `failure`) sin perder el respaldo del webhook ni la autorización del servidor.
- Definir un solo contrato de datos para el formulario de turnos: hoy conviven props y `DatosReservaProveedor` en `TurnoManager`.
- Revisar las comprobaciones repetidas entre layouts y páginas según la sensibilidad de cada consulta. Las páginas que leen datos protegidos deben conservar su propia autorización si el layout no garantiza esa frontera.

Los tres primeros puntos están implementados. Los demás requieren una revisión funcional del flujo completo antes de mover responsabilidades.

## Etapa 3: persistencia y limpieza

- Probar la máquina de estados del webhook con eventos fuera de orden, reintentos, pagos duplicados, contracargos y caídas del proveedor. Vincular cada pago con la preferencia y el intento correspondiente antes de ampliar cambios en persistencia.
- Revisar módulos sin consumidores detectados (`src/lib/contexto-reserva.ts`, `src/actions/turnos/horarios-disponibles.actions.ts` y `src/lib/consultas/obtener-barberos-con-rendimiento-hoy.ts`) antes de eliminarlos.
- Añadir pruebas dirigidas a las reglas de reserva, autorización y pagos con una base aislada. No hay un runner de pruebas configurado.

No ejecutar migraciones, `db push`, seed ni el script `npm run build` hasta identificar el destino de la base. Para validar código sin tocar datos, usar `npx --no-install tsc --noEmit --incremental false` y `npm run lint`.
