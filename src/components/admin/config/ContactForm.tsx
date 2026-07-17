// src/components/admin/config/ContactForm.tsx
"use client";

import { useState } from "react";
import { updateWhatsappConfig } from "@/actions/configPage"; // IMPORTA BIEN LA ACCIÓN

export default function WhatsappForm({ initialValue }: { initialValue: string | null }) {
  const [value, setValue] = useState(initialValue || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // PASA EL VALOR AL LLAMAR LA FUNCIÓN
    await updateWhatsappConfig(value); 
    setLoading(false);
    alert("WhatsApp actualizado correctamente");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-black/50 border border-amber-900/30 rounded-lg p-2 text-white"
      />
      <button 
        type="submit"
        disabled={loading}
        className="bg-amber-600 px-4 py-2 rounded-lg font-bold text-black"
      >
        {loading ? "Guardando..." : "Guardar Número"}
      </button>
    </form>
  );
}