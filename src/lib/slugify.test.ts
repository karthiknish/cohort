import { describe, expect, it } from 'vitest'

import { slugify, slugifyMeetingTitle } from './slugify'

describe('slugify', () => {
  it('normalizes titles for artifact filenames', () => {
    expect(slugifyMeetingTitle('Q2 Launch Review')).toBe('q2-launch-review')
    expect(slugify('!!!', { fallback: 'meeting' })).toBe('meeting')
  })

  it('respects max length', () => {
    const long = 'a'.repeat(80)
    expect(slugify(long, { maxLength: 10 }).length).toBeLessThanOrEqual(10)
  })
})
