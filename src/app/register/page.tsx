import FormularioRegistro from "@/components/auth/FormularioRegistro";

type Props = {
  searchParams: Promise<{ consentimiento?: string }>;
};

export default async function PaginaRegistro({ searchParams }: Props) {
  const { consentimiento } = await searchParams;
  return <FormularioRegistro consentimientoRequerido={consentimiento === "requerido"} />;
}
