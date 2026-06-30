import { StartClient } from '@tanstack/react-start/client'
import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'

// React Scan — dev-only render profiler. Logs slow renders and re-render
// storms to the console overlay. No-op in production (tree-shaken).
if (process.env.NODE_ENV !== 'production') {
  import('react-scan').then(({ scan }) => {
    scan({
      enabled: true,
      showToolbar: false,
    })
  }).catch(() => {
    // react-scan is a dev-only diagnostic; never block the app on it.
  })
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  )
})
