"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { animate, motion, useDragControls, useMotionValue, useReducedMotion } from "framer-motion";
import { CalendarDays, Ellipsis, LayoutDashboard, Scissors, Settings } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import type { RolPanel } from "@/types/usuario";

const CLASE_PESTANA = "flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[11px] font-medium transition-colors duration-150 motion-reduce:transition-none";

interface Props {
  abierto: boolean;
  alCambiar: (abierto: boolean) => void;
  ruta: string;
  rol: RolPanel;
}

export default function NavegacionMovilAdmin({ abierto, alCambiar, ruta, rol }: Props) {
  const arrastre = useDragControls();
  const desplazamiento = useMotionValue(0);
  const reducirMovimiento = useReducedMotion();

  const accesos = [
    { href: "/admin", nombre: "Inicio", Icono: LayoutDashboard },
    { href: "/admin/turno", nombre: "Turnos", Icono: CalendarDays },
    rol === "ADMIN"
      ? { href: "/admin/config", nombre: "Ajustes", Icono: Settings }
      : { href: "/admin/servicio", nombre: "Servicios", Icono: Scissors },
  ];

  return (
    <Dialog.Root
      open={abierto}
      onOpenChange={(siguiente) => {
        if (siguiente) desplazamiento.jump(0);
        alCambiar(siguiente);
      }}
    >
      <nav
        aria-label="Accesos rápidos de administración"
        className="admin-barra-movil fixed right-[max(0.75rem,env(safe-area-inset-right))] left-[max(0.75rem,env(safe-area-inset-left))] z-30 mx-auto grid max-w-sm grid-cols-4 gap-1 rounded-full border border-[var(--admin-border)] p-1.5 shadow-lg shadow-black/10 admin-escritorio:hidden"
      >
        {accesos.map(({ href, nombre, Icono }) => {
          const activo = ruta === href || (href === "/admin/config"
            && ruta.startsWith("/admin/config/")
            && !ruta.startsWith("/admin/config/empleados/horarios-laborales"));

          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={`${CLASE_PESTANA} ${activo ? "bg-[var(--page-primary-soft)] text-[var(--page-primary-tinta)]" : "text-[var(--admin-texto-secundario)]"}`}
            >
              <Icono size={20} aria-hidden="true" />
              {nombre}
            </Link>
          );
        })}
        <Dialog.Trigger className={`${CLASE_PESTANA} text-[var(--admin-texto-secundario)] aria-expanded:bg-[var(--page-primary-soft)] aria-expanded:text-[var(--page-primary-tinta)]`}>
          <Ellipsis size={22} aria-hidden="true" />
          Menú
        </Dialog.Trigger>
      </nav>

      <Dialog.Portal>
        <Dialog.Overlay className="admin-menu-fondo fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content asChild>
          <motion.div
            className="admin-menu-panel fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(88dvh,44rem)] max-w-xl flex-col rounded-t-2xl border border-b-0 border-[var(--admin-border)] bg-[var(--admin-surface)] pb-[env(safe-area-inset-bottom)] outline-none"
            style={{ y: desplazamiento }}
            drag="y"
            dragControls={arrastre}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={(evento, { velocity }) => {
              const distancia = desplazamiento.get();
              const desplazado = distancia >= 72;
              const gestoRapido = distancia >= 18 && velocity.y >= 500;

              if (evento.type !== "pointercancel" && (desplazado || gestoRapido)) {
                alCambiar(false);
              } else if (reducirMovimiento) {
                desplazamiento.jump(0);
              } else {
                void animate(desplazamiento, 0, { type: "spring", duration: 0.5, bounce: 0.2 });
              }
            }}
          >
            <div
              className="flex shrink-0 touch-none cursor-grab select-none flex-col items-center gap-2 rounded-t-2xl border-b border-[var(--admin-border)] px-4 pt-2.5 pb-3 active:cursor-grabbing"
              onPointerDown={(evento) => {
                if (!evento.isPrimary || evento.button !== 0) return;
                evento.currentTarget.setPointerCapture(evento.pointerId);
                arrastre.start(evento);
              }}
            >
              <span className="h-1 w-9 rounded-full bg-[var(--admin-border-fuerte)]" aria-hidden="true" />
              <Dialog.Title className="text-base font-semibold">Menú</Dialog.Title>
            </div>
            <Dialog.Description className="sr-only">
              Para cerrar, deslizá el encabezado hacia abajo, tocá fuera del menú o presioná Escape.
            </Dialog.Description>
            <AdminSidebar movil colapsado={false} alCerrar={() => alCambiar(false)} rol={rol} />
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
