// =============================================================================
// CUSTOM FORMULAS STORAGE - Deprecated
// =============================================================================

import { ServiceUnavailableError } from '@/lib/api-errors'
import type {
  CustomFormulaRecord,
  CreateCustomFormulaInput,
  UpdateCustomFormulaInput,
  CustomFormulasListResult,
} from './types'

function throwDeprecated(): never {
  throw new ServiceUnavailableError(
    'Client-side Firestore formulas storage has been removed. Use Convex customFormulas instead.'
  )
}

export async function createCustomFormula(_input: CreateCustomFormulaInput): Promise<CustomFormulaRecord> {
  throwDeprecated()
}

export async function getCustomFormula(_options: { workspaceId: string; formulaId: string }): Promise<CustomFormulaRecord | null> {
  throwDeprecated()
}

export async function getCustomFormulas(_options: { workspaceId: string; activeOnly?: boolean }): Promise<CustomFormulasListResult> {
  throwDeprecated()
}

export async function getCustomFormulasByUser(_options: {
  workspaceId: string
  userId: string
  activeOnly?: boolean
}): Promise<CustomFormulasListResult> {
  throwDeprecated()
}

export async function updateCustomFormula(_input: UpdateCustomFormulaInput): Promise<void> {
  throwDeprecated()
}

export async function deleteCustomFormula(_options: { workspaceId: string; formulaId: string }): Promise<void> {
  throwDeprecated()
}
