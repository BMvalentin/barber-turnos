"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getServicios } from "@/actions/servicios/listar.actions";
import ServicioList from "@/components/servicio/ServicioList";
import {
  eliminarServicioCacheLocal,
  actualizarServicioCacheLocal,
  guardarServiciosCacheLocal,
  leerServiciosCacheLocal,
} from "@/lib/admin/servicios-cache-local";
import { invalidarCacheServiciosPublicos } from "@/lib/admin/invalidar-cache-publica";
import type { Servicio, ServicioCreado } from "@/types/servicio";

function normalizarServicio(servicio: ServicioCreado): Servicio {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    srcImage: servicio.srcImage,
    estado: servicio.estado,
    duracion: servicio.duracion,
    precio: servicio.precio,
    descuento: servicio.descuento,
    senia: servicio.senia,
    createdAt: servicio.createdAt,
    imagenes: servicio.imagenes,
  };
}

export default function ServicioCatalogoCliente({
  puedeGestionar,
  alcanceCache,
}: {
  puedeGestionar: boolean;
  alcanceCache: string;
}) {
  const [servicios, setServicios] = useState<Servicio[] | null>(null);
  const [errorActualizacion, setErrorActualizacion] = useState(false);
  const [intento, setIntento] = useState(0);
  const revisionRef = useRef(0);

  useEffect(() => {
    let cancelado = false;
    const revisionConsulta = revisionRef.current;
    const cache = leerServiciosCacheLocal(alcanceCache);
    if (cache) {
      setServicios(cache);
      setErrorActualizacion(false);
      return;
    }
    setServicios(null);

    void getServicios()
      .then((resultado) => {
        if (cancelado || revisionConsulta !== revisionRef.current) return;
        if (!resultado.success || !resultado.data) {
          setErrorActualizacion(true);
          return;
        }
        setServicios(resultado.data);
        guardarServiciosCacheLocal(alcanceCache, resultado.data);
        setErrorActualizacion(false);
      })
      .catch(() => {
        if (!cancelado && revisionConsulta === revisionRef.current) {
          setErrorActualizacion(true);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [alcanceCache, intento]);

  const actualizarServicio = useCallback((servicioCreado: ServicioCreado) => {
    revisionRef.current += 1;
    setErrorActualizacion(false);
    invalidarCacheServiciosPublicos();
    const servicio = normalizarServicio(servicioCreado);
    if (!servicio.estado) {
      setServicios((actuales) => (actuales ?? []).filter((actual) => actual.id !== servicio.id));
      eliminarServicioCacheLocal(alcanceCache, servicio.id);
      return;
    }

    setServicios((actuales) => {
      if (!actuales) return [servicio];
      const existe = actuales.some((actual) => actual.id === servicio.id);
      const actualizados = existe
        ? actuales.map((actual) => actual.id === servicio.id ? servicio : actual)
        : [servicio, ...actuales];
      actualizarServicioCacheLocal(alcanceCache, servicio);
      return actualizados;
    });
  }, [alcanceCache]);

  const eliminarServicio = useCallback((id: string) => {
    revisionRef.current += 1;
    setErrorActualizacion(false);
    invalidarCacheServiciosPublicos();
    setServicios((actuales) => {
      const actualizados = (actuales ?? []).filter((servicio) => servicio.id !== id);
      eliminarServicioCacheLocal(alcanceCache, id);
      return actualizados;
    });
  }, [alcanceCache]);

  if (!servicios) {
    if (errorActualizacion) {
      return (
        <div role="alert" className="admin-card space-y-3 p-4 text-sm text-[var(--admin-texto-muted)]">
          <p>No se pudo cargar el catálogo de servicios.</p>
          <button
            type="button"
            onClick={() => setIntento((actual) => actual + 1)}
            className="admin-control"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <span className="sr-only">Cargando catálogo de servicios</span>
        <div aria-hidden="true" className="admin-card h-20 motion-safe:animate-pulse" />
        <div aria-hidden="true" className="admin-card h-64 motion-safe:animate-pulse" />
      </div>
    );
  }

  return (
    <>
      {errorActualizacion && (
        <div role="alert" className="admin-card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--admin-texto-muted)]">
          <span>No se pudo actualizar el catálogo. Se muestra la última versión guardada.</span>
          <button
            type="button"
            onClick={() => setIntento((actual) => actual + 1)}
            className="admin-control"
          >
            Reintentar
          </button>
        </div>
      )}
      <ServicioList
        servicios={servicios}
        puedeGestionar={puedeGestionar}
        onServicioActualizado={actualizarServicio}
        onServicioEliminado={eliminarServicio}
      />
    </>
  );
}
