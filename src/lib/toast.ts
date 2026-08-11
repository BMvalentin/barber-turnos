"use client"

import { dispatch } from "@/lib/estado-toast"
import { type ToasterToast, type Toast } from "@/types/toast"

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      duration: props.duration ?? 5000,
    },
  })

  return { id, dismiss, update }
}

export { toast }
