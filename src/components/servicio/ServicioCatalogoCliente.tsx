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
}: {
  puedeGestionar: boolean;
}) {
  const [servicios, setServicios] = useState<Servicio[] | null>(null);
  const [errorActualizacion, setErrorActualizacion] = useState(false);
  const [intento, setIntento] = useState(0);
  const revisionRef = useRef(0);

  useEffect(() => {
    let cancelado = false;
    const revisionConsulta = revisionRef.current;
    const cache = leerServiciosCacheLocal();
    if (cache) setServicios(cache);

    void getServicios()
      .then((resultado) => {
        if (cancelado || revisionConsulta !== revisionRef.current) return;
        if (!resultado.success || !resultado.data) {
          setErrorActualizacion(true);
          return;
        }
        setServicios(resultado.data);
        guardarServiciosCacheLocal(resultado.data);
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
  }, [intento]);

  const actualizarServicio = useCallback((servicioCreado: ServicioCreado) => {
    revisionRef.current += 1;
    setErrorActualizacion(false);
    const servicio = normalizarServicio(servicioCreado);
    if (!servicio.estado) {
      setServicios((actuales) => (actuales ?? []).filter((actual) => actual.id !== servicio.id));
      eliminarServicioCacheLocal(servicio.id);
      return;
    }

    setServicios((actuales) => {
      if (!actuales) return [servicio];
      const existe = actuales.some((actual) => actual.id === servicio.id);
      const actualizados = existe
        ? actuales.map((actual) => actual.id === servicio.id ? servicio : actual)
        : [servicio, ...actuales];
      actualizarServicioCacheLocal(servicio);
      return actualizados;
    });
  }, []);

  const eliminarServicio = useCallback((id: string) => {
    revisionRef.current += 1;
    setErrorActualizacion(false);
    setServicios((actuales) => {
      const actualizados = (actuales ?? []).filter((servicio) => servicio.id !== id);
      eliminarServicioCacheLocal(id);
      return actualizados;
    });
  }, []);

  if (!servicios) {
    if (errorActualizacion) {
      return (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-sm text-[var(--admin-texto-muted)]">
          <p>No se pudo cargar el catálogo de servicios.</p>
          <button
            type="button"
            onClick={() => setIntento((actual) => actual + 1)}
            className="mt-3 font-medium text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <span className="sr-only">Cargando catálogo de servicios</span>
        <div className="h-24 animate-pulse rounded-xl bg-[var(--admin-surface)]" />
        <div className="h-72 animate-pulse rounded-xl bg-[var(--admin-surface)]" />
      </div>
    );
  }

  return (
    <>
      {errorActualizacion && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-texto-muted)]">
          <span>Se muestra el último catálogo guardado; no se pudo actualizar ahora.</span>
          <button
            type="button"
            onClick={() => setIntento((actual) => actual + 1)}
            className="font-medium text-[var(--page-primary-tinta)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--page-focus-ring)]"
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
