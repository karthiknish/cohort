import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CrossChannelSearch, QuickSearchInput } from './cross-channel-search'

describe('cross-channel-search composition', () => {
  it('renders the default dialog trigger', () => {
    const markup = renderToStaticMarkup(
      <CrossChannelSearch onSearch={async () => []} />,
    )

    expect(markup).toContain('Search')
  })

  it('renders the inline quick search input placeholder', () => {
    const markup = renderToStaticMarkup(
      <QuickSearchInput onSearch={() => {}} placeholder="Find collaboration messages" />,
    )

    expect(markup).toContain('Find collaboration messages')
  })
})