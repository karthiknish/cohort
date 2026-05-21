import { describe, expect, it, vi, beforeEach } from 'vitest'

import { runGaReport } from './sync'

describe('runGaReport', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('paginates with offset until rowCount is satisfied', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rowCount: 2,
          rows: [
            {
              dimensionValues: [{ value: '20260301' }],
              metricValues: [{ value: '10' }, { value: '20' }, { value: '1' }, { value: '5' }],
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rowCount: 2,
          rows: [
            {
              dimensionValues: [{ value: '20260302' }],
              metricValues: [{ value: '11' }, { value: '21' }, { value: '2' }, { value: '6' }],
            },
          ],
        }),
      })

    vi.stubGlobal('fetch', fetchMock)

    const rows = await runGaReport({
      accessToken: 'token',
      propertyId: '123',
      days: 7,
    })

    expect(rows).toHaveLength(2)
    expect(rows[0]?.date).toBe('2026-03-01')
    expect(rows[1]?.date).toBe('2026-03-02')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const secondBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))
    expect(secondBody.offset).toBe(1)
  })
})
