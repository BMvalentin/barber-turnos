"use client";

import { createTurno } from "@/actions/turno.actions";
import { crearPreferenciaPago } from "@/actions/mercadopago-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";
import { X, Plus, CreditCard, Clock, CheckCircle2, Loader2, Scissors } from "lucide-react";

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

  const [sessionId] = useState(() => crypto.randomUUID());

  const [servicios, setServicios] = useState<ServicioData[]>(initialServicios);
  const [barberos, setBarberos] = useState<BarberoData[]>(initialBarberos);
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(initialUsuarios);
  const [relaciones, setRelaciones] = useState<RelacionData[]>(initialRelaciones);
  const [loadingData, setLoadingData] = useState(!initialServicios.length);

  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [selectedBarberoId, setSelectedBarberoId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(
    session?.user?.role === "USER" ? session?.user?.id ?? "" : ""
  );

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

      setTurnoCreado(nuevoTurnoData);

      setIsOpen(false);
      setShowPagoModal(true);
      formRef.current?.reset();
      setSelectedServicioId("");
      setSelectedBarberoId("");
      setSelectedUserId(session?.user?.role === "USER" ? session?.user?.id ?? "" : "");
    }
  }, [state.success, state.data, servicios, barberos, selectedServicioId, selectedBarberoId, session]);

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

      // El mensaje de WhatsApp al barbero se envía recién cuando el pago
      // se confirma en el servidor (webhook/back_url), desde /pago/success
      window.location.href = result.data.checkoutUrl;
    } catch {
      setErrorPago("Error inesperado al iniciar el pago");
      setLoadingPago(false);
    }
  };

  const handlePagarDespues = () => {
    enviarMensajeWhatsApp(turnoCreado!, turnoCreado?.servicioNombre || "N/A", turnoCreado?.barberoNombre || "N/A", turnoCreado?.horarioReservado || new Date(), "Pendiente de pago");
    setShowPagoModal(false);
    setTurnoCreado(null);
    setErrorPago(null);
  };

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
    <div 
      style={{
        "--primary": "var(--page-primary)",
        "--secondary": "var(--page-secondary)",
        "--primary-foreground": "var(--page-primary-foreground)",
        "--primary-tinta": "var(--page-primary-tinta)",
      } as React.CSSProperties}
    >
      {/* Botón para abrir modal */}
      <Button 
        className="flex items-center gap-2 px-6 py-3 text-[var(--primary-foreground)] font-medium shadow-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--primary)" }}
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Nuevo Turno
      </Button>

      {/* MODAL CREAR TURNO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          {/* Contenedor más claro y con mejor separación visual (bg-zinc-900 en vez de black/95) */}
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl">
            
            {/* Header */}
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white tracking-wide">Nuevo Turno</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {loadingData ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto" style={{ borderColor: "var(--primary)" }}></div>
                <p className="text-zinc-400 mt-4 text-sm">Cargando opciones disponibles...</p>
              </div>
            ) : (
              <form ref={formRef} action={formAction} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* CLIENTE */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">
                      Cliente <span style={{ color: "var(--primary)" }}>*</span>
                    </label>

                    {session?.user?.role === "USER" ? (
                      <>
                        <select
                          disabled
                          className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800/50 text-zinc-400 text-sm"
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
                        className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2"
                        style={{ outlineColor: "var(--primary)" }}
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
                    <label className="text-sm font-medium text-zinc-300">
                      Barbero <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <select
                      name="barberoId"
                      required
                      value={selectedBarberoId}
                      onChange={(e) => handleBarberoChange(e.target.value)}
                      className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2"
                      style={{ outlineColor: "var(--primary)" }}
                    >
                      <option value="">-- Seleccionar Barbero --</option>
                      {barberosFiltrados.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.nombre}
                        </option>
                      ))}
                    </select>
                    {barberosFiltrados.length === 0 && (
                      <p className="text-xs text-[var(--page-primary-80)]">
                        {selectedServicioId
                          ? "Ningún barbero ofrece este servicio."
                          : "No hay barberos disponibles."}
                      </p>
                    )}
                  </div>

                  {/* SERVICIO */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-zinc-300">
                      Servicio <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <select
                      name="servicioId"
                      required
                      value={selectedServicioId}
                      onChange={(e) => handleServicioChange(e.target.value)}
                      className="w-full p-3 border border-zinc-700 rounded-xl bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2"
                      style={{ outlineColor: "var(--primary)" }}
                    >
                      <option value="">-- Seleccionar Servicio --</option>

                      {serviciosFiltrados.map((s) => {
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

                    {selectedServicioId && servicios.find(s => s.id === selectedServicioId)?.descripcion && (
                      <p className="text-xs text-zinc-400 italic p-3 rounded-lg bg-zinc-800/40 border-l-2" style={{ borderColor: "var(--primary)" }}>
                        {servicios.find(s => s.id === selectedServicioId)?.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* FECHA Y HORA */}
                <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                  <SeleccionadorHorario
                    name="horarioReservado"
                    servicioId={selectedServicioId}
                    barberoId={selectedBarberoId}
                    sessionId={sessionId}
                    userId={selectedUserId}
                  />
                </div>

                {state.error && (
                  <div className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/30">
                    {state.error}
                  </div>
                )}

                {/* Botones de acción inferior */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-colors font-medium text-sm"
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

      {/* MODAL DE PAGO (SEÑA) */}
      {showPagoModal && turnoCreado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            <div className="border-b border-zinc-800 p-6 flex items-center gap-3" style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
              <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">¡Turno Reservado!</h2>
                <p className="text-xs text-zinc-300">Aboná la seña para confirmar tu lugar.</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Scissors className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                    Detalle del pago
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Precio del servicio</span>
                  <span className="text-sm text-white font-medium">
                    ${turnoCreado.precioCongelado.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">Seña requerida</span>
                    <p className="text-xs text-zinc-500 mt-0.5">El resto se abona en el local</p>
                  </div>
                  <span className="text-2xl font-black" style={{ color: "var(--primary-tinta)" }}>
                    ${turnoCreado.seniaCongelada.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {errorPago && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {errorPago}
                </div>
              )}

              <button
                id="btn-pagar-senia"
                onClick={handlePagarSenia}
                disabled={loadingPago}
                className="w-full flex items-center justify-center gap-3 disabled:opacity-50 text-[var(--primary-foreground)] font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider shadow-lg hover:opacity-90"
                style={{ backgroundColor: "var(--primary)" }}
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

              <button
                id="btn-pagar-despues"
                onClick={handlePagarDespues}
                disabled={loadingPago}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-medium py-3 rounded-xl transition-all text-sm"
              >
                <Clock className="w-4 h-4" />
                Pagar después (dejar pendiente)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 text-[var(--primary-foreground)] font-medium rounded-xl shadow-md transition-all hover:opacity-90 text-sm"
      style={{ backgroundColor: "var(--primary)" }}
    >
      {pending ? "Procesando..." : "Confirmar Reserva"}
    </Button>
  );
}