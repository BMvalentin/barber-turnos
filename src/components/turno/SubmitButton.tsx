"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
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