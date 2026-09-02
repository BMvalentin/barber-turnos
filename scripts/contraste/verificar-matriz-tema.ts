import { calcularRazonDeContraste } from "../../src/lib/contraste/calcular-razon-de-contraste";
import { crearVariablesTema } from "../../src/lib/contraste/crear-variables-tema";

const CASOS = [
  { nombre: "Minimalista", primario: "#18181b", secundario: "#f4f4f5", fondo: "#09090b" },
  { nombre: "Negros idénticos", primario: "#000000", secundario: "#000000", fondo: "#000000" },
  { nombre: "Blancos idénticos", primario: "#ffffff", secundario: "#ffffff", fondo: "#ffffff" },
  { nombre: "Grises idénticos", primario: "#777777", secundario: "#777777", fondo: "#777777" },
  { nombre: "Oscuros próximos", primario: "#111214", secundario: "#121315", fondo: "#101113" },
  { nombre: "Claros próximos", primario: "#f7f7f6", secundario: "#f5f5f4", fondo: "#f8f8f7" },
] as const;

for (const caso of CASOS) {
  const tema = crearVariablesTema(caso);
  const comprobaciones = [
    ["texto principal", "--tema-texto-principal", "--tema-fondo", 4.5],
    ["texto primario", "--tema-primario-texto", "--tema-superficie-1", 4.5],
    ["texto sobre suave", "--tema-primario-suave-texto", "--tema-primario-suave", 4.5],
    ["texto de botón", "--tema-primario-sobre", "--tema-primario", 4.5],
    ["marca sobre overlay", "--tema-primario-sobre-oscuro", "--tema-fondo-overlay", 4.5],
  ] as const;

  tema["--tema-fondo-overlay"] = "#09090b";

  for (const [etiqueta, texto, fondo, minimo] of comprobaciones) {
    const contraste = calcularRazonDeContraste(tema[texto], tema[fondo]);
    if (contraste < minimo) {
      throw new Error(`${caso.nombre}: ${etiqueta} tiene contraste ${contraste.toFixed(2)}.`);
    }
  }

  const marcaCercanaAlFondo = calcularRazonDeContraste(caso.primario, caso.fondo) < 3;
  if (marcaCercanaAlFondo && tema["--tema-primario-texto"] !== tema["--tema-texto-principal"]) {
    throw new Error(`${caso.nombre}: una marca próxima al fondo no recurrió al texto neutro.`);
  }
}

console.log(`Matriz de tema verificada: ${CASOS.length} casos válidos.`);
