"use client"

import * as React from "react"

import { dispatch, listeners, memoryState } from "@/lib/estado-toast"
import { type State } from "@/types/toast"
import { toast } from "@/lib/toast"

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast }
