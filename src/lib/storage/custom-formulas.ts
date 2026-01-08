// =============================================================================
// CUSTOM FORMULAS STORAGE - Firestore CRUD operations
// =============================================================================

import {
    Timestamp,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    where,
    setDoc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import type {
    CustomFormulaRecord,
    CreateCustomFormulaInput,
    UpdateCustomFormulaInput,
    CustomFormulasListResult,
} from './types'

// =============================================================================
// COLLECTION REFERENCE
// =============================================================================

/**
 * Get reference to custom formulas collection
 */
function getFormulasCollection(workspaceId: string) {
    return collection(db, 'workspaces', workspaceId, 'customFormulas')
}

/**
 * Generate a unique formula ID
 */
function generateFormulaId(): string {
    return `formula_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// =============================================================================
// CREATE OPERATIONS
// =============================================================================

/**
 * Create a new custom formula
 */
export async function createCustomFormula(
    input: CreateCustomFormulaInput
): Promise<CustomFormulaRecord> {
    const { workspaceId, ...formulaData } = input

    const formulaId = generateFormulaId()
    const formulasCollection = getFormulasCollection(workspaceId)
    const docRef = doc(formulasCollection, formulaId)

    const record: CustomFormulaRecord = {
        workspaceId,
        formulaId,
        name: formulaData.name,
        description: formulaData.description,
        formula: formulaData.formula,
        inputs: formulaData.inputs,
        outputMetric: formulaData.outputMetric,
        isActive: true,
        createdBy: formulaData.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }

    await setDoc(docRef, record)

    return {
        ...record,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    }
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Get a single custom formula by ID
 */
export async function getCustomFormula(options: {
    workspaceId: string
    formulaId: string
}): Promise<CustomFormulaRecord | null> {
    const { workspaceId, formulaId } = options
    const docRef = doc(getFormulasCollection(workspaceId), formulaId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
        return null
    }

    return snapshot.data() as CustomFormulaRecord
}

/**
 * List all custom formulas for a workspace
 */
export async function getCustomFormulas(options: {
    workspaceId: string
    activeOnly?: boolean
}): Promise<CustomFormulasListResult> {
    const { workspaceId, activeOnly = false } = options
    const formulasCollection = getFormulasCollection(workspaceId)

    let q
    if (activeOnly) {
        q = query(formulasCollection, where('isActive', '==', true))
    } else {
        q = query(formulasCollection)
    }

    const snapshot = await getDocs(q)

    const formulas: CustomFormulaRecord[] = snapshot.docs.map((docSnap) => {
        return docSnap.data() as CustomFormulaRecord
    })

    return {
        formulas,
        count: formulas.length,
    }
}

/**
 * Get custom formulas created by a specific user
 */
export async function getCustomFormulasByUser(options: {
    workspaceId: string
    userId: string
}): Promise<CustomFormulaRecord[]> {
    const { workspaceId, userId } = options
    const formulasCollection = getFormulasCollection(workspaceId)

    const q = query(formulasCollection, where('createdBy', '==', userId))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => docSnap.data() as CustomFormulaRecord)
}

// =============================================================================
// UPDATE OPERATIONS
// =============================================================================

/**
 * Update an existing custom formula
 */
export async function updateCustomFormula(
    input: UpdateCustomFormulaInput
): Promise<void> {
    const { workspaceId, formulaId, ...updates } = input
    const docRef = doc(getFormulasCollection(workspaceId), formulaId)

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {}
    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            cleanUpdates[key] = value
        }
    })

    cleanUpdates.updatedAt = serverTimestamp()

    await updateDoc(docRef, cleanUpdates)
}

/**
 * Toggle formula active status
 */
export async function toggleFormulaActive(options: {
    workspaceId: string
    formulaId: string
    isActive: boolean
}): Promise<void> {
    await updateCustomFormula({
        workspaceId: options.workspaceId,
        formulaId: options.formulaId,
        isActive: options.isActive,
    })
}

// =============================================================================
// DELETE OPERATIONS
// =============================================================================

/**
 * Delete a custom formula
 */
export async function deleteCustomFormula(options: {
    workspaceId: string
    formulaId: string
}): Promise<void> {
    const { workspaceId, formulaId } = options
    const docRef = doc(getFormulasCollection(workspaceId), formulaId)
    await deleteDoc(docRef)
}

/**
 * Delete all custom formulas for a workspace
 */
export async function deleteAllCustomFormulas(options: {
    workspaceId: string
}): Promise<{ deleted: number }> {
    const { workspaceId } = options
    const formulasCollection = getFormulasCollection(workspaceId)
    const snapshot = await getDocs(formulasCollection)

    if (snapshot.empty) {
        return { deleted: 0 }
    }

    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref))
    await Promise.all(deletePromises)

    return { deleted: snapshot.size }
}
