import { describe, expect, it } from 'vitest'

import { buildProviderIdsKey, normalizeInsightMarkdown, normalizeProviderIds } from './insight-utils'

describe('insight-utils', () => {
  it('normalizes provider ids into a stable sorted key and array', () => {
    expect(buildProviderIdsKey(['google-analytics', 'facebook'])).toBe('facebook|google-analytics')
    expect(normalizeProviderIds(['google-analytics', 'facebook'])).toEqual(['facebook', 'google-analytics'])
  })

  it('cleans markdown fences and excessive blank lines', () => {
    const input = '```markdown\n# Summary\n\n- One\n\n\n- Two\n```'
    expect(normalizeInsightMarkdown(input)).toBe('# Summary\n\n- One\n\n- Two')
  })
})