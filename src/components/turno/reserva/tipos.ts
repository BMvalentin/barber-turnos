import type { ReactNode, RefObject } from "react";
import type { Session } from "next-auth";
import type { ESTADOS_PAGO } from "@/lib/constants";
import type { ActionState } from "@/types/action-state";
import type {
  BarberoData,
  ServicioData,
  TurnoListado,
  UsuarioData,
} from "@/types/turno";
import type { ParametrosFormularioTurno } from "@/hooks/useFormularioTurno";

/** Datos de disponibilidad provistos por `useDisponibilidadHorarios`. */
export type DatosDisponibilidadHorarios = {
  fecha: Date | undefined;
  mesVisible: Date;
  diasDisponibles: string[];
  cargandoDias: boolean;
  slots: string[];
  cargando: boolean;
  slotSeleccionado: string;
  isSlotBloqueado: (slot: string) => boolean;
  irAlMesAnterior: () => void;
  irAlMesSiguiente: () => void;
  manejarSeleccionFecha: (dia: Date) => void;
  manejarSeleccionSlot: (slot: string) => void;
};

export type PropsPanelFechaHorario = {
  disponibilidad: DatosDisponibilidadHorarios;
  servicioId?: string;
  barberoId?: string;
};

export type PropsSelectorEstadoPago = {
  valor: (typeof ESTADOS_PAGO)[number];
  onChange: (valor: (typeof ESTADOS_PAGO)[number]) => void;
};

export type PropsCalendarioReserva = {
  mesVisible: Date;
  diasDisponibles: string[];
  cargandoDias: boolean;
  fecha: Date | undefined;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onSeleccionarDia: (dia: Date) => void;
};

export type PropsDiaCalendarioReserva = {
  dia: Date;
  estaEnElMes: boolean;
  disponible: boolean;
  seleccionado: boolean;
  esHoy: boolean;
  pasado: boolean;
  onSeleccionar: (dia: Date) => void;
};

export type PropsListaHorariosReserva = {
  slots: string[];
  cargando: boolean;
  fecha: Date | undefined;
  servicioId?: string;
  barberoId?: string;
  slotSeleccionado: string;
  isSlotBloqueado: (slot: string) => boolean;
  onSeleccionarSlot: (slot: string) => void;
};

export type PropsPanelBarberoServicio = {
  barberos: BarberoData[];
  selectedBarberoId: string;
  onSeleccionarBarbero: (id: string) => void;
  serviciosFiltrados: ServicioData[];
  selectedServicioId: string;
  onSeleccionarServicio: (id: string) => void;
};

export type PropsSelectorBarberosReserva = {
  barberos: BarberoData[];
  seleccionadoId: string;
  onSeleccionar: (id: string) => void;
};

export type PropsTarjetaBarberoReserva = {
  barbero: BarberoData;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
};

export type PropsSelectorServiciosReserva = {
  servicios: ServicioData[];
  seleccionadoId: string;
  onSeleccionar: (id: string) => void;
};

export type PropsTarjetaServicioReserva = {
  servicio: ServicioData;
  seleccionado: boolean;
  onSeleccionar: (id: string) => void;
};

export type PropsResumenReserva = {
  servicio: ServicioData | null;
  barbero: BarberoData | null;
  fecha: Date | undefined;
  slotSeleccionado: string;
  completo: boolean;
  onCancelar: () => void;
  esAdmin: boolean;
  usuarios: UsuarioData[];
  selectedUserId: string;
  onCambiarCliente: (id: string) => void;
  esEdicion?: boolean;
  estadoPago: (typeof ESTADOS_PAGO)[number];
  onCambiarEstadoPago: (valor: (typeof ESTADOS_PAGO)[number]) => void;
  clienteUsuario?: { nombre?: string | null; telefono?: string | null };
  senia?: number;
};

export type PropsSelectorClienteReserva = {
  usuarios: UsuarioData[];
  selectedUserId: string;
  onCambiar: (id: string) => void;
};

export type PropsFormularioReservaTurno = {
  session: Session | null;
  formRef: RefObject<HTMLFormElement | null>;
  state: ActionState;
  formAction: (formData: FormData) => void;
  sessionId: string;
  servicios: ServicioData[];
  barberos: BarberoData[];
  usuarios: UsuarioData[];
  selectedServicioId: string;
  selectedBarberoId: string;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  serviciosFiltrados: ServicioData[];
  handleBarberoChange: (id: string) => void;
  handleServicioChange: (id: string) => void;
  onCancelar: () => void;
  turnoInicial?: TurnoListado | null;
  estadoPago: (typeof ESTADOS_PAGO)[number];
  setEstadoPago: (valor: (typeof ESTADOS_PAGO)[number]) => void;
};

export type PropsModalGestionTurno = ParametrosFormularioTurno & {
  claseTrigger?: string;
  contenidoTrigger?: ReactNode;
  onTriggerClick?: () => void;
};
