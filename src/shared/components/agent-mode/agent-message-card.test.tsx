import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { AgentMessage } from '@/shared/hooks/use-agent-mode'

import { AgentMessageCard } from './agent-message-card'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/shared/ui/motion', () => ({
  domAnimation: {},
  LazyMotion: ({ children }: { children: ReactNode }) => <>{children}</>,
  m: {
    div: ({ children, ...rest }: { children: ReactNode }) => <div {...rest}>{children}</div>,
  },
}))

function agentMessage(partial: Partial<AgentMessage> & Pick<AgentMessage, 'content'>): AgentMessage {
  return {
    id: 'm1',
    type: 'agent',
    timestamp: new Date('2026-01-01T00:00:00.000Z'),
    ...partial,
  }
}

describe('AgentMessageCard', () => {
  it('renders structured warning card for attachment wait state', () => {
    const markup = renderToStaticMarkup(
      <AgentMessageCard
        message={agentMessage({
          content: 'Still reading files.',
          status: 'warning',
          metadata: { action: 'response', success: false },
        })}
      />,
    )
    expect(markup).toContain('Heads up')
    expect(markup).toContain('Warning')
    expect(markup).toContain('Still reading files.')
  })

  it('renders clarification as warning-styled structured card', () => {
    const markup = renderToStaticMarkup(
      <AgentMessageCard
        message={agentMessage({
          content: 'Which project should I use?',
          status: 'info',
          metadata: { action: 'clarify' },
        })}
      />,
    )
    expect(markup).toContain('Need a bit more detail')
    expect(markup).toContain('Clarification')
  })

  it('renders execute error with try again when retryable', () => {
    const onRetry = vi.fn()
    const markup = renderToStaticMarkup(
      <AgentMessageCard
        message={agentMessage({
          content: 'Could not complete that.',
          status: 'error',
          metadata: {
            action: 'execute',
            operation: 'createProject',
            success: false,
            data: { retryable: true },
          },
        })}
        onRetryLastUserTurn={onRetry}
      />,
    )
    expect(markup).toContain('Project action failed')
    expect(markup).toContain('Try again')
  })

  it('renders neutral info card for conversational response', () => {
    const markup = renderToStaticMarkup(
      <AgentMessageCard
        message={agentMessage({
          content: 'Here is a general answer.',
          status: 'info',
          metadata: { action: 'response', success: true },
        })}
      />,
    )
    expect(markup).toContain('Reply')
    expect(markup).toContain('Information')
    expect(markup).toContain('Here is a general answer.')
  })
})
