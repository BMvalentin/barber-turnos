export const ROLES_USUARIO = ["USER", "ADMIN", "EMPLEADO"] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number];
export type RolPanel = Extract<RolUsuario, "ADMIN" | "EMPLEADO">;

export const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  USER: "Usuario",
  ADMIN: "Administrador",
  EMPLEADO: "Empleado",
};
