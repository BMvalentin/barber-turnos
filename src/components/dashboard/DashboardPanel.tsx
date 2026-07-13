"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Settings,
  ShieldCheck, Scissors, Calendar
} from "lucide-react";
import { Button } from "../ui/button";
import { updateProfile } from "@/actions/user-dashboard";
import { useSession } from "next-auth/react";
import TurnoList from "@/components/turno/TurnoList";

/* --- FOOTER ADAPTADO AL ANCHO TOTAL --- */
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-10 border-t border-amber-900/30 bg-black mt-auto">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <span className="font-bold text-white tracking-widest uppercase text-xl">
              Barber<span className="text-amber-500">Shop</span>
            </span>
          </div>

          <p className="text-sm text-amber-100/30 text-center font-light tracking-wide">
            Excelencia en barbería tradicional.{" "}Santa Clara del Mar.{" "}{currentYear}
          </p>

          <div className="flex gap-10">
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-amber-100/40 hover:text-amber-500 transition-colors">
              Términos
            </a>
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-amber-100/40 hover:text-amber-500 transition-colors">
              Privacidad
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default function DashboardPanel({ user, turnos, session }: { user: any; turnos: any[]; session: any }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<'perfil' | 'turnos'>('perfil');
  const [hasPhone, setHasPhone] = useState(!!user.telefono);

  let defaultPrefix = "+54 9";
  let defaultPhone = "";
  if (user.telefono) {
    const match = user.telefono.match(/^(\+\d{1,3}(?:\s\d)?)\s?(.*)$/);
    if (match) {
      defaultPrefix = match[1].trim();
      defaultPhone = match[2].trim();
    } else {
      defaultPhone = user.telefono;
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const prefix = formData.get("prefix") as string;
    const telefonoNum = formData.get("telefono") as string;
    if (prefix && telefonoNum) {
      formData.set("telefono", `${prefix} ${telefonoNum}`);
    }

    startTransition(async () => {
      const res = await updateProfile(user.id, formData);
      if (res.success) {
        setStatus('success');
        setMsg("Perfil actualizado correctamente.");
        if (res.user) {
          await update({ name: res.user.name, telefono: res.user.telefono });
          if (res.user.telefono) setHasPhone(true);
        }
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setMsg(res.message || "Error al actualizar");
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 w-full font-sans">
      
      {/* MODAL OBLIGATORIO DE TELÉFONO */}
      {!hasPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl shadow-amber-900/20">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Atención</h2>
            <p className="text-amber-100/60 mb-6 text-sm">
              Para poder reservar un turno necesitamos tu número de teléfono.
              Por favor, ingresálo y guardálo para continuar.
            </p>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <input type="hidden" name="name" value={user.name || ''} />
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> WhatsApp / Teléfono
                </label>
                <div className="flex bg-black/40 border border-amber-900/30 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
                  <div className="flex items-center justify-center px-2 bg-amber-500/10 border-r border-amber-900/30">
                    <select name="prefix" defaultValue={defaultPrefix} className="bg-transparent text-amber-500 font-bold outline-none cursor-pointer pr-2 text-sm">
                      <option value="+54 9" className="bg-neutral-900 text-white">🇦🇷 +54 9</option>
                      <option value="+598" className="bg-neutral-900 text-white">🇺🇾 +598</option>
                      <option value="+56" className="bg-neutral-900 text-white">🇨🇱 +56</option>
                      <option value="+55" className="bg-neutral-900 text-white">🇧🇷 +55</option>
                      <option value="+595" className="bg-neutral-900 text-white">🇵🇾 +595</option>
                      <option value="+591" className="bg-neutral-900 text-white">🇧🇴 +591</option>
                      <option value="+1" className="bg-neutral-900 text-white">🇺🇸 +1</option>
                      <option value="+34" className="bg-neutral-900 text-white">🇪🇸 +34</option>
                    </select>
                  </div>
                  <input
                    name="telefono"
                    defaultValue={defaultPhone}
                    type="tel"
                    required
                    placeholder="11 1234-5678"
                    className="w-full p-4 bg-transparent text-white outline-none placeholder:text-neutral-800"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="text-red-500 text-xs font-bold uppercase tracking-tighter">
                  ⚠ {msg}
                </div>
              )}

              <Button
                disabled={isPending}
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest px-10 rounded-2xl h-14 transition-all shadow-lg shadow-amber-500/10 active:scale-95"
              >
                {isPending ? "Guardando..." : "Guardar Teléfono"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-12">

        {/* ENCABEZADO CON TABS */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-amber-900/20 pb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">
              Hola, <span className="text-amber-500">{user.name?.split(' ')[0] || 'Usuario'}</span>
            </h1>
            <p className="text-amber-100/50 mt-2 font-light">
              Gestioná tu perfil y tus reservas.
            </p>
          </div>

          {/* TABS DESKTOP & MOBILE */}
          <div className="flex bg-amber-500/10 p-1 rounded-2xl w-full md:w-fit border border-amber-500/20">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'perfil' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-amber-500 hover:bg-amber-500/10'}`}
            >
              <User className="w-4 h-4" /> Mi Perfil
            </button>
            <button
              onClick={() => setActiveTab('turnos')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'turnos' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-amber-500 hover:bg-amber-500/10'}`}
            >
              <Calendar className="w-4 h-4" /> Mis Turnos
            </button>
          </div>
        </div>

        {/* CONTENIDO DE TABS */}
        <AnimatePresence mode="wait">
          {activeTab === 'perfil' && (
            <motion.div
              key="perfil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-neutral-900/40 rounded-3xl border border-amber-900/20 overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 md:p-8 border-b border-amber-900/10 bg-amber-500/5">
                <h2 className="text-lg font-bold flex items-center gap-3 text-white uppercase tracking-widest">
                  <Settings className="w-5 h-5 text-amber-500" />
                  Detalles de usuario
                </h2>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 md:p-10 grid gap-8 md:grid-cols-2">

                {/* Email */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                  </label>
                  <div className="p-4 bg-black/40 border border-amber-900/10 rounded-2xl text-amber-100/20 text-sm font-mono italic">
                    {user.email}
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Nombre y Apellido
                  </label>
                  <input
                    name="name"
                    defaultValue={user.name}
                    type="text"
                    required
                    className="w-full p-4 bg-black/40 border border-amber-900/30 rounded-2xl text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                </div>

                {/* TELÉFONO (WhatsApp) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> WhatsApp / Teléfono
                  </label>
                  <div className="flex bg-black/40 border border-amber-900/30 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
                    <div className="flex items-center justify-center px-2 bg-amber-500/10 border-r border-amber-900/30">
                      <select name="prefix" defaultValue={defaultPrefix} className="bg-transparent text-amber-500 font-bold outline-none cursor-pointer pr-2 text-sm">
                        <option value="+54 9" className="bg-neutral-900 text-white">🇦🇷 +54 9</option>
                        <option value="+598" className="bg-neutral-900 text-white">🇺🇾 +598</option>
                        <option value="+56" className="bg-neutral-900 text-white">🇨🇱 +56</option>
                        <option value="+55" className="bg-neutral-900 text-white">🇧🇷 +55</option>
                        <option value="+595" className="bg-neutral-900 text-white">🇵🇾 +595</option>
                        <option value="+591" className="bg-neutral-900 text-white">🇧🇴 +591</option>
                        <option value="+1" className="bg-neutral-900 text-white">🇺🇸 +1</option>
                        <option value="+34" className="bg-neutral-900 text-white">🇪🇸 +34</option>
                      </select>
                    </div>
                    <input
                      name="telefono"
                      defaultValue={defaultPhone}
                      type="tel"
                      required
                      placeholder="11 1234-5678"
                      className="w-full p-4 bg-transparent text-white outline-none placeholder:text-neutral-800"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8 mt-4 pt-8 border-t border-amber-900/10">
                  <div className="flex items-center gap-3 text-[10px] text-amber-100/20 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-500/30" />
                    Conexión segura SSL activa
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {status === 'success' && (
                      <span className="text-green-500 text-xs font-bold uppercase tracking-tighter">
                        ✓ Cambios Guardados
                      </span>
                    )}

                    {status === 'error' && (
                      <span className="text-red-500 text-xs font-bold uppercase tracking-tighter">
                        ⚠ {msg}
                      </span>
                    )}

                    <Button
                      disabled={isPending}
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest px-10 rounded-2xl h-14 w-full md:w-auto transition-all shadow-lg shadow-amber-500/10 active:scale-95"
                    >
                      {isPending ? "Guardando..." : "Actualizar Perfil"}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'turnos' && (
            <motion.div
              key="turnos"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-neutral-900/40 rounded-3xl border border-amber-900/20 overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 md:p-8 min-h-[500px]">
                <div className="mb-6 pb-6 border-b border-amber-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                    Historial de <span className="text-amber-500">Turnos</span>
                  </h2>
                </div>
                <TurnoList turnos={turnos} session={session} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}