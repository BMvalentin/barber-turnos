/* Tipo unificado de respuesta de Server Actions.
   Re-exportado por cada archivo de actions para mantener compatibilidad. */
export type ActionState = {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  warning?: string;
  data?: any;
};