import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => <button {...props}>{children}</button>,
}))

vi.mock('@/shared/ui/popover', () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/calendar', () => ({
  Calendar: () => <div>calendar</div>,
}))

import { DateRangePicker } from './date-range-picker'

const value = {
  start: new Date(2026, 0, 1),
  end: new Date(2026, 0, 31),
}

describe('DateRangePicker', () => {
  it('renders the lifetime preset when a campaign lifetime range is provided', () => {
    const markup = renderToStaticMarkup(
      <DateRangePicker
        value={value}
        onChange={vi.fn()}
        lifetimeRange={{
          start: new Date(2025, 0, 1),
          end: new Date(2025, 11, 31),
        }}
      />,
    )

    expect(markup).toContain('Lifetime')
    expect(markup).toContain('Last 30 days')
  })

  it('does not render the lifetime preset when no lifetime range is available', () => {
    const markup = renderToStaticMarkup(
      <DateRangePicker value={value} onChange={vi.fn()} />,
    )

    expect(markup).not.toContain('Lifetime')
    expect(markup).toContain('Last 7 days')
  })
})