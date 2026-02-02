import { obtenerBicicletas } from "@/actions/bicicleta.actions";
import FormBicicleta from "../../components/ui/bicicleta/FormBicicleta";
import ListaBicicletas from "../../components/ui/bicicleta/ListaBicicletas";
import Buscador from "../../components/ui/bicicleta/Buscador";

export default async function BicicletasPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    orderBy?: "marca" | "modelo" | "rodado" | "color";
    orderDir?: "asc" | "desc";
  };
}) {
  const bicicletas = await obtenerBicicletas(searchParams);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">🚲 Gestión de Bicicletas</h1>

      <FormBicicleta />

      <Buscador />

      <ListaBicicletas
        bicicletas={bicicletas}
        orderBy={searchParams.orderBy}
        orderDir={searchParams.orderDir}
      />
    </div>
  );
}
