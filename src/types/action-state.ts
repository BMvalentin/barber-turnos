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