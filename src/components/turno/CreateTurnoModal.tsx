"use client";

import { createTurno } from "@/actions/turno.actions";
import { crearPreferenciaPago } from "@/actions/mercadopago-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";
import { X, Plus, CreditCard, Clock, CheckCircle2, Loader2, Scissors } from "lucide-react";
import { prisma } from "@/lib/prisma";

type ServicioData = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: number;
  descuento: number | null;
  senia: number | null;
};

type BarberoData = {
  id: string;
  nombre: string;
  srcImage?: string | null;
};

type UsuarioData = {
  id: string;
  name: string | null;
  email: string | null;
};

type RelacionData = {
  barberoId: string;
  servicioId: string;
};

type TurnoCreado = {
  id: string;
  precioCongelado: number;
  seniaCongelada: number;
  servicioNombre?: string;
  barberoNombre?: string;
  horarioReservado?: Date | string;
};

type Props = {
  session: any;
  initialServicios?: ServicioData[];
  initialBarberos?: BarberoData[];
  initialUsuarios?: UsuarioData[];
  initialRelaciones?: RelacionData[];
  whatsappPhone: string;
};

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

export default function CreateTurnoModal({
  session,
  initialServicios = [],
  initialBarberos = [],
  initialUsuarios = [],
  initialRelaciones = [],
  whatsappPhone,
}: Props) {

  const enviarMensajeWhatsApp = (
    turno: TurnoCreado,
    servicioNombre: string,
    barberoNombre: string,
    fecha: Date | string, 
    estado: "Pagado" | "Pendiente de pago"
  ) => {
    const fechaObj = new Date(fecha);
    
    const fechaFormateada = fechaObj.toLocaleString('es-AR', {
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit'
    });

    const mensaje = `Hola! Confirmé mi turno:
    📅 Fecha: ${fechaFormateada}
    ✂️ Servicio: ${servicioNombre}
    💈 Barbero: ${barberoNombre}
    Estado: ${estado}`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createTurno, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // sessionId único por instancia del modal — no cambia entre renders
  const [sessionId] = useState(() => crypto.randomUUID());

  const [servicios, setServicios] = useState<ServicioData[]>(initialServicios);
  const [barberos, setBarberos] = useState<BarberoData[]>(initialBarberos);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(initialUsuarios);
  const [relaciones, setRelaciones] = useState<RelacionData[]>(initialRelaciones);
  const [loadingData, setLoadingData] = useState(!initialServicios.length);

  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [selectedBarberoId, setSelectedBarberoId] = useState("");
  // Cliente para el cual se está creando el turno: si es USER, es él mismo;
  // si es ADMIN, es el que elige en el <select name="userId">
  const [selectedUserId, setSelectedUserId] = useState(
    session?.user?.role === "USER" ? session?.user?.id ?? "" : ""
  );

  // Estado del modal de pago
  const [turnoCreado, setTurnoCreado] = useState<TurnoCreado | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [loadingPago, setLoadingPago] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  useEffect(() => {
    if (initialServicios.length > 0) {
      setLoadingData(false);
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/configuracion-turno");
        const data = await res.json();

        if (isMounted) {
          setServicios(data.servicios || []);
          setBarberos(data.barberos || []);
          setUsuarios(data.usuarios || []);
          setRelaciones(data.relaciones || []);
          setLoadingData(false);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoadingData(false);
      }
    }

    if (isOpen) {
      load();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialServicios.length]);

  useEffect(() => {
    if (state.success && state.data) {
      const nombreServicio = servicios.find(s => s.id === selectedServicioId)?.nombre || "N/A";
      const nombreBarbero = barberos.find(b => b.id === selectedBarberoId)?.nombre || "N/A";

      const nuevoTurnoData: TurnoCreado = {
        ...state.data,
        servicioNombre: nombreServicio,
        barberoNombre: nombreBarbero
      };

      // 3. GUARDAMOS EN EL ESTADO
      setTurnoCreado(nuevoTurnoData);

      // 4. RESETEO
      setIsOpen(false);
      setShowPagoModal(true);
      formRef.current?.reset();
      setSelectedServicioId("");
      setSelectedBarberoId("");
      setSelectedUserId(session?.user?.role === "USER" ? session?.user?.id ?? "" : "");
    }
  }, [state.success, state.data]);

  const handlePagarSenia = async () => {
    if (!turnoCreado) return;
    setLoadingPago(true);
    setErrorPago(null);

    try {
      const result = await crearPreferenciaPago(turnoCreado.id);

      if (!result.success || !result.data?.checkoutUrl) {
        setErrorPago(result.error ?? "No se pudo generar el enlace de pago");
        setLoadingPago(false);
        return;
      }
      const servicio = servicios.find(s => s.id === selectedServicioId);
      const barbero = barberos.find(b => b.id === selectedBarberoId);

      enviarMensajeWhatsApp(turnoCreado, servicio?.nombre || "N/A", barbero?.nombre || "N/A",turnoCreado.horarioReservado || new Date() , "Pagado");
      // Redirigir a Mercado Pago
      window.location.href = result.data.checkoutUrl;
    } catch {
      setErrorPago("Error inesperado al iniciar el pago");
      setLoadingPago(false);
    }


  };

  const handlePagarDespues = () => {

    // Aquí enviamos el mensaje con el estado "Pendiente"
    enviarMensajeWhatsApp(turnoCreado!, turnoCreado?.servicioNombre || "N/A", turnoCreado?.barberoNombre || "N/A", turnoCreado?.horarioReservado || new Date(), "Pendiente de pago");
    setShowPagoModal(false);
    setTurnoCreado(null);
    setErrorPago(null);
  };

  // ─── Filtro cruzado barbero ↔ servicio ────────────────────────────────
  const serviciosFiltrados = selectedBarberoId
    ? servicios.filter((s) =>
      relaciones.some(
        (r) => r.barberoId === selectedBarberoId && r.servicioId === s.id
      )
    )
    : servicios;

  const barberosFiltrados = selectedServicioId
    ? barberos.filter((b) =>
      relaciones.some(
        (r) => r.servicioId === selectedServicioId && r.barberoId === b.id
      )
    )
    : barberos;

  const handleBarberoChange = (nuevoBarberoId: string) => {
    setSelectedBarberoId(nuevoBarberoId);
    // Si el servicio ya elegido no aplica a este barbero, se limpia
    if (
      selectedServicioId &&
      nuevoBarberoId &&
      !relaciones.some(
        (r) => r.barberoId === nuevoBarberoId && r.servicioId === selectedServicioId
      )
    ) {
      setSelectedServicioId("");
    }
  };

  const handleServicioChange = (nuevoServicioId: string) => {
    setSelectedServicioId(nuevoServicioId);
    // Si el barbero ya elegido no ofrece este servicio, se limpia
    if (
      selectedBarberoId &&
      nuevoServicioId &&
      !relaciones.some(
        (r) => r.servicioId === nuevoServicioId && r.barberoId === selectedBarberoId
      )
    ) {
      setSelectedBarberoId("");
    }
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <Button className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Nuevo Turno
      </Button>
      {/* ===================== */}
      {/* MODAL CREAR TURNO     */}
      {/* ===================== */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black/95 backdrop-blur-xl border border-amber-900/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-black/95 border-b border-amber-900/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Nuevo Turno</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-amber-200/70 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-amber-200/70 mt-4">Cargando datos...</p>
              </div>
            ) : (
              <form ref={formRef} action={formAction} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* CLIENTE */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-200/70">
                      Cliente <span className="text-amber-500">*</span>
                    </label>

                    {session?.user?.role === "USER" ? (
                      <>
                        <select
                          disabled
                          className="w-full p-2.5 border border-amber-900/30 rounded-lg bg-black/60 text-amber-200/50"
                        >
                          <option>
                            {session?.user?.name || "Usuario"} ({session?.user?.email})
                          </option>
                        </select>

                        <input
                          type="hidden"
                          name="userId"
                          value={session?.user?.id}
                        />
                      </>
                    ) : (
                      <select
                        name="userId"
                        required
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full p-2.5 border border-amber-900/30 rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">-- Seleccionar Cliente --</option>
                        {usuarios.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name || "Sin nombre"} ({u.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* BARBERO */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-200/70">
                      Barbero <span className="text-amber-500">*</span>
                    </label>
                    <select
                      name="barberoId"
                      required
                      value={selectedBarberoId}
                      onChange={(e) => handleBarberoChange(e.target.value)}
                      className="w-full p-2.5 border border-amber-900/30 rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">-- Seleccionar Barbero --</option>
                      {barberosFiltrados.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                    {barberosFiltrados.length === 0 && (
                      <p className="text-xs text-amber-400">
                        {selectedServicioId
                          ? "Ningún barbero ofrece este servicio."
                          : "No hay barberos disponibles. Crea barberos primero."}
                      </p>
                    )}
                  </div>

                  {/* SERVICIO */}

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-amber-200/70">Servicio</label>
                    <select
                      name="servicioId"
                      required
                      value={selectedServicioId}
                      onChange={(e) => handleServicioChange(e.target.value)}
                      className="w-full p-2.5 border border-amber-900/30 rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">-- Seleccionar Servicio --</option>

                      {/* Reemplaza tu mapa actual por este: */}
                      {serviciosFiltrados.map((s) => {
                        // Definimos el corte de la descripción antes del return
                        const descripcionCorta = s.descripcion && s.descripcion.length > 50
                          ? s.descripcion.substring(0, 50) + "..."
                          : s.descripcion;

                        return (
                          <option key={s.id} value={s.id}>
                            {s.nombre}
                            {s.precio && ` - $${s.precio.toString()}`}
                            {s.duracion && ` (${s.duracion} min)`}
                            {descripcionCorta && ` - ${descripcionCorta}`}
                          </option>
                        );
                      })}
                    </select>

                    {/* Mostrar la descripción detallada aquí debajo */}
                    {selectedServicioId && servicios.find(s => s.id === selectedServicioId)?.descripcion && (
                      <p className="text-xs text-amber-200/50 italic p-2 border-l-2 border-amber-500">
                        {servicios.find(s => s.id === selectedServicioId)?.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* FECHA Y HORA */}
                <SeleccionadorHorario
                  name="horarioReservado"
                  servicioId={selectedServicioId}
                  barberoId={selectedBarberoId}
                  sessionId={sessionId}
                  userId={selectedUserId}
                />

                {state.error && (
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg text-sm border border-amber-500/50">
                    {state.error}
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-amber-900/30">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 border border-amber-900/30 text-amber-200/70 rounded-lg hover:bg-black/60 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <SubmitButton />
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* MODAL DE PAGO (SEÑA)  */}
      {/* ===================== */}
      {showPagoModal && turnoCreado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-amber-500/20 rounded-2xl w-full max-w-md shadow-2xl shadow-amber-900/20 overflow-hidden">

            {/* Header del modal de pago */}
            <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 border-b border-amber-500/20 p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">¡Turno Reservado!</h2>
                <p className="text-sm text-amber-200/60">Tu lugar está aparatado. Aboná la seña para confirmarlo.</p>
              </div>
            </div>

            {/* Detalle de precios */}
            <div className="p-6 space-y-4">
              {/* Card de la seña */}
              <div className="bg-black/40 border border-amber-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                    Detalle del pago
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Precio del servicio</span>
                  <span className="text-sm text-white font-medium">
                    ${turnoCreado.precioCongelado.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="border-t border-zinc-700/50 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">Seña requerida</span>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      El resto se abona en el local
                    </p>
                  </div>
                  <span className="text-2xl font-black text-amber-400">
                    ${turnoCreado.seniaCongelada.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Error de pago */}
              {errorPago && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {errorPago}
                </div>
              )}

              {/* Botón pagar seña */}
              <button
                id="btn-pagar-senia"
                onClick={handlePagarSenia}
                disabled={loadingPago}
                className="w-full flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-zinc-950 font-black py-4 rounded-xl transition-all text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30"
              >
                {loadingPago ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando enlace...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pagar Seña · ${turnoCreado.seniaCongelada.toLocaleString("es-AR")}
                  </>
                )}
              </button>

              {/* Botón pagar después */}
              <button
                id="btn-pagar-despues"
                onClick={handlePagarDespues}
                disabled={loadingPago}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-400 hover:text-zinc-200 font-medium py-3 rounded-xl transition-all text-sm"
              >
                <Clock className="w-4 h-4" />
                Pagar después (turno pendiente)
              </button>

              <p className="text-center text-xs text-zinc-600">
                Serás redirigido a Mercado Pago para completar el pago de forma segura.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white"

    >
      {pending ? "Procesando..." : "Confirmar Reserva"}
    </Button>
  );
}