"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, Settings, 
  CheckCircle2, AlertCircle, ShieldCheck, Scissors
} from "lucide-react";
import { Button } from "../ui/button";
import { updateProfile } from "@/actions/user-dashboard";
import { useSession } from "next-auth/react";

/* --- FOOTER ADAPTADO AL ANCHO TOTAL --- */
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-10 border-t border-amber-900/30 bg-black mt-20">
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

export default function DashboardPanel({ user }: { user: any }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfile(user.id, formData);
      if (res.success) {
        setStatus('success');
        setMsg("Perfil actualizado correctamente.");
        if (res.user) await update({ name: res.user.name, telefono: res.user.telefono });
        setTimeout(() => setStatus('idle'), 3000);
      }
    });
  };

  return (
    /* Contenedor principal sin límites de ancho para que el fondo y footer expandan */
    <div className="flex flex-col min-h-screen bg-neutral-950 w-full">
      
      {/* Contenedor del contenido del Perfil (Este sí tiene ancho máximo) */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-12">
        
        <div className="mb-10 border-b border-amber-900/20 pb-8">
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase">
            Mi <span className="text-amber-500">Perfil</span>
          </h1>
          <p className="text-amber-100/50 mt-2 font-light">
            Gestioná tus datos de contacto y preferencias de cuenta.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/40 rounded-3xl border border-amber-900/20 overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="p-6 md:p-8 border-b border-amber-900/10 bg-amber-500/5">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white uppercase tracking-widest">
              <Settings className="w-5 h-5 text-amber-500" />
              Detalles de usuario
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 md:p-10 grid gap-8 md:grid-cols-2">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Correo Electrónico
              </label>
              <div className="p-4 bg-black/40 border border-amber-900/10 rounded-2xl text-amber-100/20 text-sm font-mono">
                {user.email}
              </div>
            </div>

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
                
                <Button 
                  disabled={isPending} 
                  type="submit" 
                  className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest px-10 rounded-2xl h-14 w-full md:w-auto transition-all shadow-lg shadow-amber-500/10"
                >
                  {isPending ? "Guardando..." : "Actualizar Datos"}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}