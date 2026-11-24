import { ajustarColorParaContraste } from "./ajustar-color-para-contraste";
import { calcularRazonDeContraste } from "./calcular-razon-de-contraste";
import { elegirColorTexto } from "./elegir-color-texto";
import { mezclarColores } from "./mezclar-colores";
import { normalizarColoresTema } from "./normalizar-colores-tema";
import { resolverColorTextoMarca } from "./resolver-color-texto-marca";
import type { EntradasTema, VariablesTema } from "./tipos-tema";

export function crearVariablesTema(entradas: EntradasTema): VariablesTema {
  const { primario, secundario, fondo } = normalizarColoresTema(entradas);
  const textoFondo = elegirColorTexto(fondo);
  const poloSuperficie = textoFondo === "#ffffff" ? "#ffffff" : "#000000";
  const poloAlternativo = textoFondo === "#ffffff" ? "#000000" : "#ffffff";
  const usarPoloSuperficie = calcularRazonDeContraste(textoFondo, mezclarColores(fondo, poloSuperficie, 0.18)) >= 4.5;
  const crearSuperficie = (proporcion: number) =>
    mezclarColores(fondo, usarPoloSuperficie ? poloSuperficie : poloAlternativo, proporcion);
  const superficie1 = crearSuperficie(0.06);
  const superficie2 = crearSuperficie(0.12);
  const superficie3 = crearSuperficie(0.18);
  const superficieMenosContrastada = usarPoloSuperficie ? superficie3 : fondo;
  const textoSecundario = ajustarColorParaContraste(
    mezclarColores(textoFondo, fondo, 0.22),
    superficieMenosContrastada
  );
  const textoTenue = ajustarColorParaContraste(
    mezclarColores(textoFondo, fondo, 0.42),
    superficieMenosContrastada
  );
  const primarioSuave = mezclarColores(superficie1, primario, 0.16);
  const secundarioSuave = mezclarColores(superficie1, secundario, 0.14);
  const superficies = [fondo, superficie1, superficie2, superficie3];
  const asegurarContraste = (color: string, minimo = 4.5) =>
    superficies.every((superficie) => calcularRazonDeContraste(color, superficie) >= minimo)
      ? color
      : textoFondo;
  const textoPrimario = asegurarContraste(resolverColorTextoMarca(primario, superficie1, textoFondo));
  const primarioSobreOscuro = resolverColorTextoMarca(primario, "#38383a", "#ffffff");
  const textoSecundarioMarca = asegurarContraste(resolverColorTextoMarca(secundario, superficie1, textoFondo));
  const textoPrimarioSuave = resolverColorTextoMarca(primario, primarioSuave, elegirColorTexto(primarioSuave));
  const textoSecundarioSuave = resolverColorTextoMarca(secundario, secundarioSuave, elegirColorTexto(secundarioSuave));
  const sobrePrimario = elegirColorTexto(primario);
  const sobreSecundario = elegirColorTexto(secundario);
  const destinoInteraccionPrimaria = sobrePrimario === "#ffffff" ? "#000000" : "#ffffff";
  const destinoInteraccionSecundaria = sobreSecundario === "#ffffff" ? "#000000" : "#ffffff";
  const primarioHover = mezclarColores(primario, destinoInteraccionPrimaria, 0.12);
  const primarioActivo = mezclarColores(primario, destinoInteraccionPrimaria, 0.2);
  const secundarioHover = mezclarColores(secundario, destinoInteraccionSecundaria, 0.12);
  const bordeSuave = ajustarColorParaContraste(mezclarColores(textoFondo, superficie1, 0.65), superficie1, 3);
  const bordeFuerte = asegurarContraste(ajustarColorParaContraste(
    mezclarColores(textoFondo, superficie1, 0.45), superficieMenosContrastada, 3
  ), 3);
  const foco = asegurarContraste(resolverColorTextoMarca(primario, fondo, bordeFuerte), 3);
  const rojo = textoFondo === "#ffffff" ? "#ff9ca5" : "#a82a37";
  const error = asegurarContraste(ajustarColorParaContraste(rojo, superficieMenosContrastada));

  return {
    "--tema-fondo": fondo,
    "--tema-superficie-1": superficie1,
    "--tema-superficie-2": superficie2,
    "--tema-superficie-3": superficie3,
    "--tema-texto-principal": textoFondo,
    "--tema-texto-secundario": textoSecundario,
    "--tema-texto-tenue": textoTenue,
    "--tema-borde-suave": bordeSuave,
    "--tema-borde-fuerte": bordeFuerte,
    "--tema-foco": foco,
    "--tema-error": error,
    "--tema-primario": primario,
    "--tema-primario-hover": primarioHover,
    "--tema-primario-activo": primarioActivo,
    "--tema-primario-sobre": sobrePrimario,
    "--tema-primario-texto": textoPrimario,
    "--tema-primario-sobre-oscuro": primarioSobreOscuro,
    "--tema-primario-suave": primarioSuave,
    "--tema-primario-suave-texto": textoPrimarioSuave,
    "--tema-secundario": secundario,
    "--tema-secundario-hover": secundarioHover,
    "--tema-secundario-sobre": sobreSecundario,
    "--tema-secundario-texto": textoSecundarioMarca,
    "--tema-secundario-suave": secundarioSuave,
    "--tema-secundario-suave-texto": textoSecundarioSuave,
  };
}
