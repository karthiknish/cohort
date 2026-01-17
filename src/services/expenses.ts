import type { Expense, ExpenseAttachment, ExpenseCategory, ExpenseReportResponse, Vendor } from '@/types/expenses'
import { cache } from 'react'

export type CreateExpenseInput = {
  description: string
  amount: number
  currency?: string
  costType?: Expense['costType']
  incurredAt?: string | null
  categoryId?: string | null
  vendorId?: string | null
  employeeId?: string | null
  attachments?: Expense['attachments']
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>

export type ExpenseServices = {
  listExpenseCategories: (options?: { includeInactive?: boolean }) => Promise<{ categories: ExpenseCategory[] }>
  createExpenseCategory: (input: {
    name: string
    code?: string | null
    description?: string | null
    isActive?: boolean
    sortOrder?: number
  }) => Promise<{ category: ExpenseCategory }>
  updateExpenseCategory: (id: string, input: Partial<Omit<ExpenseCategory, 'id'>>) => Promise<{ ok: true }>
  deleteExpenseCategory: (id: string) => Promise<{ ok: true }>

  listVendors: (options?: { includeInactive?: boolean; q?: string }) => Promise<{ vendors: Vendor[] }>
  createVendor: (input: {
    name: string
    email?: string | null
    phone?: string | null
    website?: string | null
    notes?: string | null
    isActive?: boolean
  }) => Promise<{ vendor: Vendor }>
  updateVendor: (id: string, input: Partial<Omit<Vendor, 'id'>>) => Promise<{ ok: true }>
  deleteVendor: (id: string) => Promise<{ ok: true }>

  listExpenses: (options?: { employeeId?: string; status?: string; limit?: number }) => Promise<{ expenses: Expense[] }>
  createExpense: (input: CreateExpenseInput) => Promise<{ expense: Expense }>
  updateExpense: (id: string, input: UpdateExpenseInput) => Promise<{ ok: true }>
  deleteExpense: (id: string) => Promise<{ ok: true }>
  transitionExpense: (id: string, action: 'submit' | 'approve' | 'reject' | 'mark_paid', note?: string | null) => Promise<{ ok: true }>

  fetchExpenseReport: (options?: { from?: string; to?: string }) => Promise<ExpenseReportResponse>
}

let provider: ExpenseServices | null = null

export function setExpenseServices(next: ExpenseServices) {
  provider = next
}

function requireProvider(): ExpenseServices {
  if (!provider) {
    throw new Error('Expense services not initialised (missing Convex provider)')
  }
  return provider
}

async function listExpenseCategoriesInternal(options?: { includeInactive?: boolean }) {
  return requireProvider().listExpenseCategories(options)
}

export const listExpenseCategories = cache(listExpenseCategoriesInternal)

export async function createExpenseCategory(input: {
  name: string
  code?: string | null
  description?: string | null
  isActive?: boolean
  sortOrder?: number
}) {
  return requireProvider().createExpenseCategory(input)
}

export async function updateExpenseCategory(id: string, input: Partial<Omit<ExpenseCategory, 'id'>>) {
  return requireProvider().updateExpenseCategory(id, input)
}

export async function deleteExpenseCategory(id: string) {
  return requireProvider().deleteExpenseCategory(id)
}

async function listVendorsInternal(options?: { includeInactive?: boolean; q?: string }) {
  return requireProvider().listVendors(options)
}

export const listVendors = cache(listVendorsInternal)

export async function createVendor(input: {
  name: string
  email?: string | null
  phone?: string | null
  website?: string | null
  notes?: string | null
  isActive?: boolean
}) {
  return requireProvider().createVendor(input)
}

export async function updateVendor(id: string, input: Partial<Omit<Vendor, 'id'>>) {
  return requireProvider().updateVendor(id, input)
}

export async function deleteVendor(id: string) {
  return requireProvider().deleteVendor(id)
}

async function listExpensesInternal(options?: { employeeId?: string; status?: string; limit?: number }) {
  return requireProvider().listExpenses(options)
}

export const listExpenses = cache(listExpensesInternal)

export async function createExpense(input: CreateExpenseInput) {
  return requireProvider().createExpense(input)
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  return requireProvider().updateExpense(id, input)
}

export async function deleteExpense(id: string) {
  return requireProvider().deleteExpense(id)
}

export async function transitionExpense(id: string, action: 'submit' | 'approve' | 'reject' | 'mark_paid', note?: string | null) {
  return requireProvider().transitionExpense(id, action, note)
}

export async function fetchExpenseReport(options?: { from?: string; to?: string }) {
  return requireProvider().fetchExpenseReport(options)
}

export async function upsertExpenseAttachmentFiles(
  input: CreateExpenseInput,
  lookup: (args: { url: string }) => Promise<{ storageId: string } | null>
): Promise<CreateExpenseInput> {
  const attachments = Array.isArray(input.attachments) ? input.attachments : []
  if (attachments.length === 0) return input

  const resolved: ExpenseAttachment[] = []
  for (const attachment of attachments) {
    const existing = await lookup({ url: attachment.url })
    if (existing) {
      resolved.push({ ...attachment, url: existing.storageId })
    } else {
      resolved.push(attachment)
    }
  }

  return {
    ...input,
    attachments: resolved,
  }
}
