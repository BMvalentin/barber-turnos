export type RespuestaTokenMP = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  user_id?: number;
  refresh_token?: string;
  public_key?: string;
  live_mode?: boolean;
};

export type OpcionesGuardarMP = {
  /** Si true (por defecto), bloquea la configuración después de guardar */
  bloquearDespuesDeGuardar?: boolean;
};
