import { redirect } from "next/navigation";

export default function PaginaConfiguracionMercadoPago() {
  redirect("/admin/config/medios-pago?tab=mercado-pago");
}
