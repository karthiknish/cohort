import { describe, expect, it } from 'vitest'

import {
  agencyOnlyPrefixes,
  can,
  canAccessPath,
  capabilityForHref,
  navItemsForRole,
  normalizeAuthRole,
} from './dashboard-access'

describe('dashboard-access', () => {
  it('normalizes legacy roles', () => {
    expect(normalizeAuthRole('manager')).toBe('team')
    expect(normalizeAuthRole('member')).toBe('client')
  })

  it('enforces capability matrix', () => {
    expect(can('client', 'analytics.view')).toBe(true)
    expect(can('client', 'proposals.view')).toBe(true)
    expect(can('client', 'proposals.manage')).toBe(false)
    expect(can('client', 'agency.ads')).toBe(false)
    expect(can('team', 'agency.ads')).toBe(true)
    expect(can('admin', 'admin.directory')).toBe(true)
    expect(can('team', 'admin.directory')).toBe(false)
  })

  it('blocks clients from agency routes only', () => {
    expect(canAccessPath('client', '/dashboard/ads')).toBe(false)
    expect(canAccessPath('client', '/dashboard/socials/sync')).toBe(false)
    expect(canAccessPath('client', '/dashboard/proposals')).toBe(true)
    expect(canAccessPath('client', '/dashboard/proposals/deck-1')).toBe(true)
    expect(canAccessPath('client', '/dashboard/analytics')).toBe(true)
    expect(canAccessPath('client', '/dashboard/tasks')).toBe(true)
  })

  it('derives agency-only prefixes from catalog', () => {
    expect(agencyOnlyPrefixes()).toEqual(['/dashboard/ads', '/dashboard/socials'])
  })

  it('maps href capabilities for nav', () => {
    expect(capabilityForHref('/dashboard/proposals')).toBe('proposals.view')
    expect(capabilityForHref('/dashboard/ads')).toBe('agency.ads')
  })

  it('filters nav groups for client role', () => {
    const nav = navItemsForRole('client')
    const agency = nav.find((g) => g.id === 'agency-tools')
    const hrefs = agency?.items.map((i) => i.href) ?? []
    expect(hrefs).toContain('/dashboard/analytics')
    expect(hrefs).toContain('/dashboard/proposals')
    expect(hrefs).not.toContain('/dashboard/ads')
    expect(hrefs).not.toContain('/dashboard/socials')
  })

  it('shows full agency tools for team', () => {
    const nav = navItemsForRole('team')
    const agency = nav.find((g) => g.id === 'agency-tools')
    const hrefs = agency?.items.map((i) => i.href) ?? []
    expect(hrefs).toEqual([
      '/dashboard/analytics',
      '/dashboard/ads',
      '/dashboard/socials',
      '/dashboard/proposals',
    ])
  })
})
