import { redirect } from "next/navigation";

export default function DiaLaboralRedirect() {
  redirect("/admin/config/empleados/horarios-laborales");
}
