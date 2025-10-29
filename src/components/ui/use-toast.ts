'use client'

import * as React from 'react'

import type { ToastProps, ToastVariantProps } from '@/components/ui/toast'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastToDismiss = string

type Toast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: ToastVariantProps['variant']
}

type ToastState = {
  toasts: Toast[]
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'UPDATE_TOAST'; toast: Partial<Toast> & Pick<Toast, 'id'> }
  | { type: 'DISMISS_TOAST'; toastId?: ToastToDismiss }
  | { type: 'REMOVE_TOAST'; toastId?: ToastToDismiss }

const toastTimeouts = new Map<ToastToDismiss, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: ToastToDismiss) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: 'REMOVE_TOAST', toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const reducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((toast) => (toast.id === action.toast.id ? { ...toast, ...action.toast } : toast)),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((toast) => (toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast)),
      }
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: action.toastId ? state.toasts.filter((toast) => toast.id !== action.toastId) : [],
      }
  }
}

const listeners = new Set<(state: ToastState) => void>()

let memoryState: ToastState = { toasts: [] }

const dispatch = (action: ToastAction) => {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export const toast = ({ ...props }: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).slice(2, 9)

  const update = (props: Toast) => dispatch({ type: 'UPDATE_TOAST', toast: props })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

export type ToastT = ReturnType<typeof toast>

export const useToast = () => {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}
