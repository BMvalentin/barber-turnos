import type { Metadata } from "next";
import IndiceLegal from "@/components/legal/IndiceLegal";

export const metadata: Metadata = {
  title: "Información legal",
  description:
    "Términos y Condiciones, Política de Privacidad, Política de Cookies y condiciones de pagos y cancelaciones.",
};

export default function PaginaLegal() {
  return <IndiceLegal />;
}
