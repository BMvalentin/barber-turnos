// Plantillas de colores para el selector del panel admin.
// Para agregar una plantilla nueva solo hace falta sumar un objeto al array PLANTILLAS_COLORES.
import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";

export interface PlantillaColor {
  id: string;
  nombre: string;
  descripcion: string;
  primaryColor: string;
  secondaryColor: string;
}

export const PLANTILLAS_COLORES: PlantillaColor[] = [
  {
    id: "barberia",
    nombre: "Barbería",
    descripcion: "La combinación cálida clásica de la marca.",
    primaryColor: "#D97706",
    secondaryColor: "#78350F",
  },
  {
    id: "elegante",
    nombre: "Elegante",
    descripcion: "Una combinación sobria y profesional.",
    primaryColor: "#1E293B",
    secondaryColor: "#F8FAFC",
  },
  {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "Azul seguro y confiable para negocios.",
    primaryColor: "#1D4ED8",
    secondaryColor: "#EFF6FF",
  },
  {
    id: "minimalista",
    nombre: "Minimalista",
    descripcion: "Neutros limpios y sin distracciones.",
    primaryColor: "#18181B",
    secondaryColor: "#F4F4F5",
  },
  {
    id: "natural",
    nombre: "Natural",
    descripcion: "Verdes profundos con aire de frescura.",
    primaryColor: "#166534",
    secondaryColor: "#F0FDF4",
  },
  {
    id: "moderno",
    nombre: "Moderno",
    descripcion: "Turquesa actual y despejado.",
    primaryColor: "#0F766E",
    secondaryColor: "#F0FDFA",
  },
  {
    id: "fresco",
    nombre: "Fresco",
    descripcion: "Celeste luminoso y juvenil.",
    primaryColor: "#0EA5E9",
    secondaryColor: "#F0F9FF",
  },
  {
    id: "vibrante",
    nombre: "Vibrante",
    descripcion: "Violeta intenso con mucha energía.",
    primaryColor: "#7C3AED",
    secondaryColor: "#F5F3FF",
  },
];

for (const plantilla of PLANTILLAS_COLORES) {
  if (!esColorHexValido(plantilla.primaryColor) || !esColorHexValido(plantilla.secondaryColor)) {
    throw new Error(`La plantilla "${plantilla.nombre}" define un color inválido.`);
  }
}
