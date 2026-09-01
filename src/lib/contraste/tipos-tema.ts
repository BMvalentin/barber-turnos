export interface EntradasTema {
  primario?: string | null;
  secundario?: string | null;
  fondo?: string | null;
}

export interface ColoresTemaNormalizados {
  primario: string;
  secundario: string;
  fondo: string;
}

export type VariablesTema = Record<`--${string}`, string>;
