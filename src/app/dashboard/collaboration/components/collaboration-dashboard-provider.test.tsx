import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useCollaborationDashboardContext } from './collaboration-dashboard-provider'

function ContextConsumer() {
  useCollaborationDashboardContext()
  return null
}

describe('useCollaborationDashboardContext', () => {
  it('throws when used outside the provider', () => {
    expect(() => renderToStaticMarkup(<ContextConsumer />)).toThrow(
      'useCollaborationDashboardContext must be used within a CollaborationDashboardProvider',
    )
  })
})