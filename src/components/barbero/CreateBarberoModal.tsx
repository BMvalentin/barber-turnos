"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import CreateBarberoForm from "@/components/barbero/CreateBarberoForm";

type Props = {
  servicios: any;
  diasLaborales: any;
  config?: any;
};

export default function CreateBarberoModal({ servicios, diasLaborales, config }: Props) {
  const [open, setOpen] = useState(false);
  const primaryColor = config?.primaryColor || "#d97706";

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button
          className="text-white shadow-lg transition-all hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          + Ingresar Barbero
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 bg-transparent border-none animate-in fade-in zoom-in-95 duration-200 [&>button]:hidden">
        <div
          className="bg-black/40 backdrop-blur-lg rounded-xl p-6 space-y-6 shadow-2xl border relative"
          style={{
            borderColor: `${primaryColor}40`,
            boxShadow: `0 25px 50px -12px ${primaryColor}15`
          }}
        >

          {/* AQUÍ ESTÁ LA X: Usamos DialogClose con el color primario */}
          <DialogClose
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none p-1 z-10"
            style={{ color: primaryColor }}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Nuevo Barbero
            </DialogTitle>
          </DialogHeader>

          <CreateBarberoForm
            servicios={servicios}
            diasLaborales={diasLaborales}
            onSuccess={() => setOpen(false)}
            config={config}
          />

        </div>

      </DialogContent>
    </Dialog>
  );
}