"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  BarberoData,
  RelacionData,
  ServicioData,
  UsuarioData,
} from "@/types/turno";

export type DatosConfiguracionTurno = {
  servicios: ServicioData[];
  barberos: BarberoData[];
  usuarios: UsuarioData[];
  relaciones: RelacionData[];
};

const DATOS_VACIOS: DatosConfiguracionTurno = {
  servicios: [],
  barberos: [],
  usuarios: [],
  relaciones: [],
};

export function useConfiguracionTurno(activo: boolean) {
  const [datos, setDatos] = useState<DatosConfiguracionTurno>(DATOS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch("/api/configuracion-turno");
      const datosJson = (await respuesta.json()) as Partial<DatosConfiguracionTurno>;
      setDatos({
        servicios: datosJson.servicios ?? [],
        barberos: datosJson.barberos ?? [],
        usuarios: datosJson.usuarios ?? [],
        relaciones: datosJson.relaciones ?? [],
      });
    } catch (err) {
      console.error("Error cargando la configuración de turno:", err);
      setError("No se pudo cargar la configuración.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (activo) {
      void recargar();
    }
  }, [activo, recargar]);

  return { datos, cargando, error, recargar };
}
