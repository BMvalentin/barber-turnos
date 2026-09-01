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
  const crearSuperficie = (proporcion: number) => {
    const candidata = mezclarColores(fondo, poloSuperficie, proporcion);
    if (calcularRazonDeContraste(textoFondo, candidata) >= 4.5) return candidata;
    const poloAlternativo = poloSuperficie === "#ffffff" ? "#000000" : "#ffffff";
    return mezclarColores(fondo, poloAlternativo, proporcion);
  };
  const superficie1 = crearSuperficie(0.06);
  const superficie2 = crearSuperficie(0.12);
  const superficie3 = crearSuperficie(0.18);
  const textoSecundario = ajustarColorParaContraste(
    mezclarColores(textoFondo, fondo, 0.22),
    superficie1
  );
  const textoTenue = ajustarColorParaContraste(
    mezclarColores(textoFondo, fondo, 0.42),
    superficie1
  );
  const primarioSuave = mezclarColores(superficie1, primario, 0.16);
  const secundarioSuave = mezclarColores(superficie1, secundario, 0.14);
  const textoPrimario = resolverColorTextoMarca(primario, superficie1, textoFondo);
  const primarioSobreOscuro = resolverColorTextoMarca(primario, "#09090b", "#ffffff");
  const textoSecundarioMarca = resolverColorTextoMarca(secundario, superficie1, textoFondo);
  const textoPrimarioSuave = resolverColorTextoMarca(primario, primarioSuave, textoFondo);
  const textoSecundarioSuave = resolverColorTextoMarca(secundario, secundarioSuave, textoFondo);
  const sobrePrimario = elegirColorTexto(primario);
  const sobreSecundario = elegirColorTexto(secundario);
  const destinoInteraccionPrimaria = sobrePrimario === "#ffffff" ? "#000000" : "#ffffff";
  const destinoInteraccionSecundaria = sobreSecundario === "#ffffff" ? "#000000" : "#ffffff";
  const primarioHover = mezclarColores(primario, destinoInteraccionPrimaria, 0.12);
  const primarioActivo = mezclarColores(primario, destinoInteraccionPrimaria, 0.2);
  const secundarioHover = mezclarColores(secundario, destinoInteraccionSecundaria, 0.12);
  const bordeSuave = ajustarColorParaContraste(mezclarColores(textoFondo, superficie1, 0.65), superficie1, 3);
  const bordeFuerte = ajustarColorParaContraste(mezclarColores(textoFondo, superficie1, 0.45), superficie1, 3);
  const foco = resolverColorTextoMarca(primario, fondo, bordeFuerte);

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
