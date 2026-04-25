import { describe, expect, it } from 'vitest'

import { validateChecklistRequiredFields } from './checklist-answers-validation'
import type { FormFieldDefinition } from '@/types/workforce'

const fields: FormFieldDefinition[] = [
  { id: 'a', label: 'Alpha', type: 'text', required: true },
  { id: 'b', label: 'Beta', type: 'text', required: false },
  { id: 'c', label: 'Gamma', type: 'number', required: true },
]

describe('validateChecklistRequiredFields', () => {
  it('returns errors only for required empty fields', () => {
    const errors = validateChecklistRequiredFields(fields, { a: '  x  ', b: '', c: '' })
    expect(errors).toEqual({ c: 'Required' })
  })

  it('treats whitespace-only as empty for required fields', () => {
    const errors = validateChecklistRequiredFields(fields, { a: '   ', b: 'ok', c: '1' })
    expect(errors).toEqual({ a: 'Required' })
  })
})
