/* Decisión del ingreso/registro con Google, separada de la persistencia para
   poder verificarla con pruebas. Se evalúa en `callbacks.signIn`, que corre
   antes de `createUser` en @auth/core. */

export const REDIRECCION_CONSENTIMIENTO_GOOGLE = "/register?consentimiento=requerido";

export type EstadoIngresoGoogle = {
  /* Ya existe una fila `account` para (provider, providerAccountId). */
  cuentaExistente: boolean;
  /* Ya existe un usuario con el mismo correo (Auth.js no creará una cuenta). */
  usuarioPorCorreo: boolean;
  /* Hay una intención de consentimiento firmada, vigente y con las versiones
     actuales. */
  tieneIntencion: boolean;
};

export type DecisionIngresoGoogle =
  | { permitir: true }
  | { permitir: false; redirigir: string };

export function decidirIngresoGoogle(estado: EstadoIngresoGoogle): DecisionIngresoGoogle {
  if (estado.cuentaExistente) return { permitir: true };
  if (estado.usuarioPorCorreo) return { permitir: true };
  if (estado.tieneIntencion) return { permitir: true };
  return { permitir: false, redirigir: REDIRECCION_CONSENTIMIENTO_GOOGLE };
}
