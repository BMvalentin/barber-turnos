import { calcularRazonDeContraste } from "../../src/lib/contraste/calcular-razon-de-contraste";
import { crearVariablesTema } from "../../src/lib/contraste/crear-variables-tema";

const CASOS = [
  { nombre: "Minimalista", primario: "#18181b", secundario: "#f4f4f5", fondo: "#09090b" },
  { nombre: "Negros idénticos", primario: "#000000", secundario: "#000000", fondo: "#000000" },
  { nombre: "Blancos idénticos", primario: "#ffffff", secundario: "#ffffff", fondo: "#ffffff" },
  { nombre: "Grises idénticos", primario: "#777777", secundario: "#777777", fondo: "#777777" },
  { nombre: "Oscuros próximos", primario: "#111214", secundario: "#121315", fondo: "#101113" },
  { nombre: "Claros próximos", primario: "#f7f7f6", secundario: "#f5f5f4", fondo: "#f8f8f7" },
  { nombre: "Gris al límite oscuro", primario: "#aaaabb", secundario: "#ffe2ca", fondo: "#757575" },
  { nombre: "Gris al límite claro", primario: "#4c4c68", secundario: "#285c99", fondo: "#767676" },
  { nombre: "Fondo saturado", primario: "#dd5520", secundario: "#ef9642", fondo: "#ba4d04" },
  { nombre: "Marca brillante en fondo oscuro", primario: "#ffee00", secundario: "#31d48f", fondo: "#1c1425" },
] as const;

const fondosPagina = ["--tema-fondo", "--tema-superficie-1", "--tema-superficie-2", "--tema-superficie-3"] as const;

for (const caso of CASOS) {
  const tema = crearVariablesTema(caso);
  function verificar(texto: `--${string}`, fondo: string, minimo = 4.5) {
    const contraste = calcularRazonDeContraste(tema[texto], fondo);
    if (contraste < minimo) {
      throw new Error(`${caso.nombre}: ${texto} sobre ${fondo} tiene contraste ${contraste.toFixed(2)}.`);
    }
  }

  for (const superficie of fondosPagina) {
    for (const texto of ["--tema-texto-principal", "--tema-texto-secundario", "--tema-texto-tenue", "--tema-primario-texto", "--tema-secundario-texto", "--tema-error"] as const) {
      verificar(texto, tema[superficie]);
    }
    verificar("--tema-foco", tema[superficie], 3);
    verificar("--tema-borde-fuerte", tema[superficie], 3);
  }

  verificar("--tema-primario-suave-texto", tema["--tema-primario-suave"]);
  verificar("--tema-secundario-suave-texto", tema["--tema-secundario-suave"]);
  verificar("--tema-primario-sobre-oscuro", "#38383a");
  verificar("--tema-primario-sobre", tema["--tema-primario"]);
  verificar("--tema-primario-sobre", tema["--tema-primario-hover"]);
  verificar("--tema-secundario-sobre", tema["--tema-secundario"]);
  verificar("--tema-secundario-sobre", tema["--tema-secundario-hover"]);

  const marcaCercanaAlFondo = calcularRazonDeContraste(caso.primario, caso.fondo) < 3;
  if (marcaCercanaAlFondo && tema["--tema-primario-texto"] !== tema["--tema-texto-principal"]) {
    throw new Error(`${caso.nombre}: una marca próxima al fondo no recurrió al texto neutro.`);
  }
}

console.log(`Matriz de tema verificada: ${CASOS.length} casos válidos.`);
