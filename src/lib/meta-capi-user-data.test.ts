import { describe, expect, it } from 'vitest'

import { buildMetaCapiHashedUserData, hashMetaCapiPhone } from './meta-capi-user-data'

describe('meta-capi-user-data', () => {
  it('hashes phone with country code', () => {
    const a = hashMetaCapiPhone('(415) 555-0101')
    const b = hashMetaCapiPhone('14155550101')
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })

  it('builds hashed email in user_data', () => {
    const data = buildMetaCapiHashedUserData({ email: 'User@Example.com' })
    expect(Array.isArray(data.em)).toBe(true)
    expect((data.em as string[])[0]).toHaveLength(64)
  })
})
