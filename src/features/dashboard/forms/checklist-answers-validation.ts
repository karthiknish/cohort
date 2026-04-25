import type { FormFieldDefinition } from '@/types/workforce'

/** Returns field id -> error message for any required field left blank. */
export function validateChecklistRequiredFields(
  fields: FormFieldDefinition[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    if (f.required && !(values[f.id] ?? '').trim()) {
      errors[f.id] = 'Required'
    }
  }
  return errors
}
