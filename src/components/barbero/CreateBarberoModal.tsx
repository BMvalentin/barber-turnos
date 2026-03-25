"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateBarberoForm from "@/components/barbero/CreateBarberoForm";

type Props = {
  servicios: any;
  diasLaborales: any;
};

export default function CreateBarberoModal({ servicios, diasLaborales }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          + Ingresar Barbero
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 bg-transparent border-none animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-black/40 backdrop-blur-lg border border-amber-900/30 rounded-xl p-6 space-y-6 shadow-2xl shadow-amber-900/20">
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Nuevo Barbero
            </DialogTitle>
          </DialogHeader>

          <CreateBarberoForm
            servicios={servicios}
            diasLaborales={diasLaborales}
            onSuccess={() => setOpen(false)}
          />

        </div>

      </DialogContent>
    </Dialog>
  );
}