import { z } from 'zod/v4'
import { Errors } from './errors'
import {
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
} from './functions'

function generateLegacyId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

const ADJECTIVES = ['Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Keen', 'Lively', 'Merry', 'Noble', 'Patient']
const NOUNS = ['Falcon', 'Hawk', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Eagle', 'Raven', 'Phoenix', 'Dragon']

export function generatePseudonym(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 9999)
  return `${adj} ${noun} ${num}`
}

export function generateRelayIdentifier(): string {
  const prefix = 'relay'
  const random = Math.random().toString(36).substring(2, 8).toLowerCase()
  const domain = 'private.cohorts.app'
  return `${prefix}-${random}@${domain}`
}
