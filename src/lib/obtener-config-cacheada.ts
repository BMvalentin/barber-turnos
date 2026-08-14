import { cache } from "react";
import { getPageConfig } from "@/actions/configuracion/leer-config.actions";

/** Configuración de página memoizada por request (compartida por metadata y layout). */
export const obtenerConfigCacheada = cache(async () => await getPageConfig());
