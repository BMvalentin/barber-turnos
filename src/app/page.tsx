import HomeClient from "@/components/inicio/HomeClient";
import { obtenerConfigCacheada } from "@/lib/obtener-config-cacheada";

export default async function Page() {
  const config = await obtenerConfigCacheada();

  return <HomeClient config={config} />;
}
