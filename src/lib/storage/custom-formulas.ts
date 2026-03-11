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

export async function createCustomFormula(input: CreateCustomFormulaInput): Promise<CustomFormulaRecord> {
  void input
  throwDeprecated()
}

export async function getCustomFormula(options: { workspaceId: string; formulaId: string }): Promise<CustomFormulaRecord | null> {
  void options
  throwDeprecated()
}

export async function getCustomFormulas(options: { workspaceId: string; activeOnly?: boolean }): Promise<CustomFormulasListResult> {
  void options
  throwDeprecated()
}

export async function getCustomFormulasByUser(options: {
  workspaceId: string
  userId: string
  activeOnly?: boolean
}): Promise<CustomFormulasListResult> {
  void options
  throwDeprecated()
}

export async function updateCustomFormula(input: UpdateCustomFormulaInput): Promise<void> {
  void input
  throwDeprecated()
}

export async function deleteCustomFormula(options: { workspaceId: string; formulaId: string }): Promise<void> {
  void options
  throwDeprecated()
}
