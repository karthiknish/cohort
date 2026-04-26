import { describe, expect, it } from 'vitest'

import { getNavigationItemsForUserRole, getQuickActionsForUserRole } from './command-menu'

describe('getNavigationItemsForUserRole', () => {
  it('uses For You route instead of legacy activity redirect', () => {
    const forAdmin = getNavigationItemsForUserRole('admin')
    const forYou = forAdmin.find((i) => i.name === 'For You')
    expect(forYou?.href).toBe('/dashboard/for-you')
  })

  it('hides admin Clients for non-admins', () => {
    expect(
      getNavigationItemsForUserRole('client').some((i) => i.name === 'Clients' && i.href === '/admin/clients')
    ).toBe(false)
    expect(
      getNavigationItemsForUserRole('team').some((i) => i.name === 'Clients' && i.href === '/admin/clients')
    ).toBe(false)
  })

  it('shows Clients for admin', () => {
    const admin = getNavigationItemsForUserRole('admin')
    expect(admin.some((i) => i.name === 'Clients' && i.href === '/admin/clients')).toBe(true)
  })

  it('hides agency Ads, Socials, Proposals for client role', () => {
    const client = getNavigationItemsForUserRole('client')
    expect(client.some((i) => i.href === '/dashboard/ads')).toBe(false)
    expect(client.some((i) => i.href === '/dashboard/socials')).toBe(false)
    expect(client.some((i) => i.href === '/dashboard/proposals')).toBe(false)
  })

  it('shows agency routes for team', () => {
    const team = getNavigationItemsForUserRole('team')
    expect(team.some((i) => i.name === 'Ads')).toBe(true)
    expect(team.some((i) => i.name === 'Proposals')).toBe(true)
  })
})

describe('getQuickActionsForUserRole', () => {
  it('hides create proposal for client', () => {
    expect(
      getQuickActionsForUserRole('client').some((a) => a.action === '/dashboard/proposals' && a.name === 'Create proposal')
    ).toBe(false)
  })

  it('shows create proposal for team', () => {
    expect(
      getQuickActionsForUserRole('team').some((a) => a.action === '/dashboard/proposals' && a.name === 'Create proposal')
    ).toBe(true)
  })
})
