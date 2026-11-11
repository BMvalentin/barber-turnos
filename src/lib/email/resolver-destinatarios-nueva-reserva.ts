import { z } from "zod";

export type DestinatarioNuevaReserva = {
  email: string;
  tipo: "administrador" | "barbero";
};

type CandidatoDestinatario = {
  email: string | null | undefined;
  tipo: "administrador" | "barbero";
};

export function resolverDestinatariosUnicos(
  candidatos: readonly CandidatoDestinatario[],
): DestinatarioNuevaReserva[] {
  const porCorreo = new Map<string, DestinatarioNuevaReserva>();

  for (const candidato of candidatos) {
    const email = candidato.email?.trim().toLowerCase();
    if (!email || !z.email().safeParse(email).success) continue;

    const existente = porCorreo.get(email);
    if (!existente || candidato.tipo === "barbero") {
      porCorreo.set(email, { email, tipo: candidato.tipo });
    }
  }

  return [...porCorreo.values()];
}
