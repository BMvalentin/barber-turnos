import { addMonths, format, parseISO } from "date-fns";
import { z } from "zod";
import { obtenerAmbitoBaseDatosLocal } from "@/lib/ambito-base-datos-cliente";
import { MAX_BARBEROS_POR_CONSULTA, VIGENCIA_CACHE_TURNOS_MS } from "@/lib/turnos/capacidad-horaria";
import { obtenerFechaSola } from "@/lib/utils/obtener-fecha-sola";

const PREFIJO_CACHE = "mayoraz-disponibilidad-v2:";
const PREFIJO_CACHE_ANTERIOR = "mayoraz-disponibilidad-v1:";
const esquemaCapacidad = z.record(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.array(z.tuple([z.number().int().min(0).max(8.64e15), z.number().positive()])),
);
const esquemaVencimiento = z.object({ venceEn: z.number().int() });
const esquemaEntrada = esquemaVencimiento.extend({ capacidad: esquemaCapacidad });
const esquemaRespuesta = z.array(z.object({ barberoId: z.string(), capacidad: esquemaCapacidad }));

type Entrada = z.infer<typeof esquemaEntrada>;
type Peticion = Promise<Entrada | undefined>;
export type ExclusionDisponibilidad = { turnoId: string; usuarioId: string };

const memoria = new Map<string, Entrada>();
const pendientes = new Map<string, Peticion>();
let proximaLimpieza = 0;

function esVigente(venceEn: number, ahora = Date.now()) {
  return venceEn > ahora && venceEn <= ahora + VIGENCIA_CACHE_TURNOS_MS;
}

export function claveDisponibilidad(mes: string, barberoId: string, exclusion?: ExclusionDisponibilidad) {
  const clave = `${PREFIJO_CACHE}${obtenerAmbitoBaseDatosLocal()}:${mes}:${encodeURIComponent(barberoId)}`;
  return exclusion ? `${clave}:${encodeURIComponent(exclusion.turnoId)}:${encodeURIComponent(exclusion.usuarioId)}` : clave;
}

function limpiarVencidas() {
  const ahora = Date.now();
  if (ahora < proximaLimpieza) return;
  proximaLimpieza = ahora + VIGENCIA_CACHE_TURNOS_MS;
  for (const [clave, entrada] of memoria) {
    if (entrada.venceEn <= ahora) memoria.delete(clave);
  }
  try {
    const almacen = window.localStorage;
    for (let indice = almacen.length - 1; indice >= 0; indice -= 1) {
      const clave = almacen.key(indice);
      if (clave?.startsWith(PREFIJO_CACHE_ANTERIOR)) {
        almacen.removeItem(clave);
        continue;
      }
      if (!clave?.startsWith(PREFIJO_CACHE)) continue;
      try {
        const valor: unknown = JSON.parse(almacen.getItem(clave) ?? "null");
        const vencimiento = esquemaVencimiento.safeParse(valor);
        if (vencimiento.success && esVigente(vencimiento.data.venceEn, ahora)) continue;
      } catch {
        // También se descarta el contenido que no se puede leer.
      }
      almacen.removeItem(clave);
    }
  } catch {
    // La disponibilidad sigue funcionando en memoria.
  }
}

export function leerDisponibilidadEnMemoria(clave: string) {
  const entrada = memoria.get(clave);
  return entrada && esVigente(entrada.venceEn) ? entrada : undefined;
}

function leerEntrada(clave: string, exclusion?: ExclusionDisponibilidad) {
  const entrada = leerDisponibilidadEnMemoria(clave);
  if (entrada || exclusion) return entrada;
  try {
    const contenido = window.localStorage.getItem(clave);
    if (!contenido) return;
    const valor: unknown = JSON.parse(contenido);
    const resultado = esquemaEntrada.safeParse(valor);
    if (resultado.success && esVigente(resultado.data.venceEn)) {
      memoria.set(clave, resultado.data);
      return resultado.data;
    }
    window.localStorage.removeItem(clave);
  } catch {
    // Una entrada ilegible se reemplaza cuando se recupera la agenda.
  }
}

async function pedirAgendas(mes: string, barberos: string[], exclusion?: ExclusionDisponibilidad, actualizar?: boolean) {
  const parametros = new URLSearchParams({ mes });
  for (const id of barberos) parametros.append("barberoId", id);
  if (exclusion) parametros.set("turnoIdAExcluir", exclusion.turnoId);
  if (actualizar) parametros.set("actualizar", "1");
  try {
    const respuesta = await fetch(`/api/turnos/disponibilidad?${parametros}`, { cache: "no-store" });
    if (!respuesta.ok) return;
    const valor: unknown = await respuesta.json();
    const resultado = esquemaRespuesta.safeParse(valor);
    if (resultado.success) return new Map(resultado.data.map(({ barberoId, capacidad }) => [barberoId, capacidad]));
  } catch {
    // El formulario ofrece reintentar una consulta fallida.
  }
}

function iniciarConsultas(mes: string, barberos: string[], exclusion?: ExclusionDisponibilidad, actualizar?: boolean) {
  const respuesta = pedirAgendas(mes, barberos, exclusion, actualizar);
  for (const id of barberos) {
    const clave = claveDisponibilidad(mes, id, exclusion);
    const peticion: Peticion = respuesta.then((agendas) => {
      // Una consulta anterior a un conflicto puede terminar después de la nueva.
      if (pendientes.get(clave) !== peticion) return pendientes.get(clave) ?? leerDisponibilidadEnMemoria(clave);

      pendientes.delete(clave);
      const capacidad = agendas?.get(id);
      if (!capacidad) return;
      const entrada = { capacidad, venceEn: Date.now() + VIGENCIA_CACHE_TURNOS_MS };
      memoria.set(clave, entrada);
      if (!exclusion) {
        try {
          window.localStorage.setItem(clave, JSON.stringify(entrada));
        } catch {
          // La agenda ya está disponible en memoria.
        }
      }
      return entrada;
    });
    pendientes.set(clave, peticion);
  }
}

export async function precargarDisponibilidadMensual(mes: string, barberos: readonly string[]) {
  limpiarVencidas();
  const ids = [...new Set(barberos)];
  const faltantes = ids.filter((id) => {
    const clave = claveDisponibilidad(mes, id);
    return !pendientes.has(clave) && !leerEntrada(clave);
  });
  for (let indice = 0; indice < faltantes.length; indice += MAX_BARBEROS_POR_CONSULTA) {
    iniciarConsultas(mes, faltantes.slice(indice, indice + MAX_BARBEROS_POR_CONSULTA));
  }
  const agendas = await Promise.all(ids.map((id) => {
    const clave = claveDisponibilidad(mes, id);
    return pendientes.get(clave) ?? leerEntrada(clave);
  }));
  return agendas.every(Boolean);
}

export async function precargarDisponibilidadInicial(
  barberos: readonly string[],
  fecha: Date = new Date(),
  exclusion?: ExclusionDisponibilidad & { barberoId: string },
) {
  const inicio = parseISO(obtenerFechaSola(fecha));
  const mes = format(inicio, "yyyy-MM");
  const [actual, siguiente, agendaEditable] = await Promise.all([
    precargarDisponibilidadMensual(mes, exclusion ? barberos.filter((id) => id !== exclusion.barberoId) : barberos),
    precargarDisponibilidadMensual(format(addMonths(inicio, 1), "yyyy-MM"), barberos),
    exclusion ? consultarDisponibilidadMensual(mes, exclusion.barberoId, exclusion) : true,
  ]);
  return actual && siguiente && Boolean(agendaEditable);
}

export function consultarDisponibilidadMensual(mes: string, barberoId: string, exclusion?: ExclusionDisponibilidad, actualizar = false) {
  limpiarVencidas();
  const clave = claveDisponibilidad(mes, barberoId, exclusion);
  if (!actualizar) {
    const pendiente = pendientes.get(clave);
    if (pendiente) return pendiente;
    const entrada = leerEntrada(clave, exclusion);
    if (entrada) return Promise.resolve(entrada);
  }
  iniciarConsultas(mes, [barberoId], exclusion, actualizar);
  return pendientes.get(clave) ?? Promise.resolve(undefined);
}

export function invalidarDisponibilidadLocal(barberoId: string, fecha: string) {
  const clave = claveDisponibilidad(fecha.slice(0, 7), barberoId);
  for (const entradas of [memoria, pendientes]) {
    for (const guardada of entradas.keys()) {
      if (guardada === clave || guardada.startsWith(`${clave}:`)) entradas.delete(guardada);
    }
  }
  try {
    window.localStorage.removeItem(clave);
  } catch {
    // La invalidación en memoria sigue siendo efectiva.
  }
}
