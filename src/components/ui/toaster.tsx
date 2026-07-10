"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="select-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map(({ id, title, description, action, variant, duration, dismissed }) => (
        <Toast
          key={id}
          variant={variant}
          duration={duration}
          dismissed={dismissed}
          onDismiss={() => dismiss(id)}
          className="pointer-events-auto animate-slide-in-from-right"
        >
          <div className="grid gap-1 flex-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
          {action}
        </Toast>
      ))}
    </div>
  )
}