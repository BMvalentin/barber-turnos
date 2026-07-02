"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const variantes = cva(
  "select-none group pointer-events-auto relative flex w-full items-center gap-4 overflow-hidden rounded-[1rem] border p-6 shadow-lg",
  {
    variants: {
      variant: {
        default: "border-slate-100 bg-white text-slate-900",
        destructive: "border-red-200 bg-red-50 text-red-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface PropiedadesToast
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variantes> {
  onDismiss?: () => void
  dismissed?: boolean
  duration?: number
}

const DURACION_ANIMACION_SALIDA = 400

export const Toast = React.forwardRef<HTMLDivElement, PropiedadesToast>(
  ({ className, variant, onDismiss, dismissed, duration = 5000, children, ...props }, ref) => {
    const [desplazamientoX, setDesplazamientoX] = React.useState(0)
    const [deslizando, setDeslizando] = React.useState(false)
    const [saliendo, setSaliendo] = React.useState(false)
    const yaInicioSalida = React.useRef(false)
    const inicioX = React.useRef(0)
    const refToast = React.useRef<HTMLDivElement>(null)

    const iniciarSalida = React.useCallback(() => {
      // Evita doble disparo
      if (yaInicioSalida.current) return
      yaInicioSalida.current = true
      setSaliendo(true)
      setTimeout(() => {
        onDismiss?.()
      }, DURACION_ANIMACION_SALIDA)
    }, [onDismiss])

    // Auto-dismiss tras "duration" ms
    React.useEffect(() => {
      const temporizador = setTimeout(iniciarSalida, duration)
      return () => clearTimeout(temporizador)
    }, []) // Sin dependencias: solo corre al montar

    // Reacciona al dismissed externo, pero solo si cambia a true
    React.useEffect(() => {
      if (dismissed) iniciarSalida()
    }, [dismissed])

    const alPresionar = (e: React.PointerEvent) => {
      setDeslizando(true)
      inicioX.current = e.clientX
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }

    const alMover = (e: React.PointerEvent) => {
      if (!deslizando) return
      const delta = e.clientX - inicioX.current
      if (delta > 0) setDesplazamientoX(delta)
    }

    const alSoltar = (e: React.PointerEvent) => {
      if (!deslizando) return
      setDeslizando(false)
      const delta = e.clientX - inicioX.current
      if (delta > 80) {
        iniciarSalida()
      } else {
        setDesplazamientoX(0)
      }
    }

    React.useImperativeHandle(ref, () => refToast.current as HTMLDivElement)

    const transformFinal = saliendo
      ? "translateX(120%)"
      : `translateX(${desplazamientoX}px)`

    return (
      <div
        ref={refToast}
        role="alert"
        aria-live="assertive"
        className={variantes({ variant, className })}
        style={{
          transform: transformFinal,
          opacity: saliendo ? 0 : 1,
          transition: saliendo
            ? `transform ${DURACION_ANIMACION_SALIDA}ms cubic-bezier(0.4, 0, 1, 1), opacity ${DURACION_ANIMACION_SALIDA}ms ease`
            : deslizando
              ? "none"
              : "transform 200ms ease, opacity 200ms ease",
          touchAction: "none",
        }}
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Toast.displayName = "Toast"