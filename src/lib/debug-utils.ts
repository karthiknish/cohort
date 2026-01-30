'use client'

import { useEffect, useRef } from 'react'

/**
 * Debug hook to track how many times a component renders and what changed.
 * Only active in development mode.
 */
export function useRenderLog(name: string, props?: Record<string, any>) {
  const countRef = useRef(0)
  const prevPropsRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    countRef.current += 1
    const changedProps: Record<string, { from: any; to: any }> = {}

    if (props) {
      Object.keys(props).forEach((key) => {
        if (prevPropsRef.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevPropsRef.current[key],
            to: props[key],
          }
        }
      })
      prevPropsRef.current = { ...props }
    }

    const logEntry = {
      name,
      renderCount: countRef.current,
      timestamp: new Date().toISOString(),
      changedProps: Object.keys(changedProps).length > 0 ? changedProps : 'none (likely state or context change)',
    }

    if (typeof window !== 'undefined') {
      const win = window as any
      if (!win.__RENDER_LOGS__) win.__RENDER_LOGS__ = []
      win.__RENDER_LOGS__.push(logEntry)
      if (win.__RENDER_LOGS__.length > 200) win.__RENDER_LOGS__.shift()
    }

    console.log(`[RenderLog] ${name} render #${countRef.current}`, logEntry)

    if (countRef.current > 50) {
      console.warn(`[RenderLog] ${name} has rendered more than 50 times! Potential loop detected.`)
    }
  })
}
