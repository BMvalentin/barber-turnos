/* Tipo unificado de respuesta de Server Actions.
   Re-exportado por cada archivo de actions para mantener compatibilidad.
   TData tipa el payload de `data`; por defecto unknown. */
export type ActionState<TData = unknown> = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  warning?: string;
  data?: TData;
};

/* Estado inicial genérico para useActionState / useState.
   Se tipa con `satisfies` (y no como `ActionState`) para que su tipo literal,
   sin la propiedad `data`, sea asignable a `ActionState<TData>` para cualquier
   `TData` sin caer en `unknown` (que no es asignable a tipos concretos). */
export const ActionStateInicial = {
  success: false,
  error: "",
} satisfies ActionState;

/* Alias simple para estados que no necesitan payload de datos. */
export const ActionStateInicialSimple = ActionStateInicial;