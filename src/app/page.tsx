import { getPageConfig } from "@/actions/configuracion/leer-config.actions";
import HomeClient from "@/components/inicio/HomeClient";

export default async function Page() {
  const config = await getPageConfig();

  return <HomeClient config={config} />;
}