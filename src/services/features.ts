import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type {
  FeatureItem,
  CreateFeatureInput,
  UpdateFeatureInput,
} from '@/types/features'

const COLLECTION_NAME = 'platform_features'

/**
 * Get all features ordered by creation date
 */
export async function getFeatures(): Promise<FeatureItem[]> {
  const featuresRef = collection(db, COLLECTION_NAME)
  const q = query(featuresRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title ?? '',
      description: data.description ?? '',
      status: data.status ?? 'backlog',
      priority: data.priority ?? 'medium',
      imageUrl: data.imageUrl ?? null,
      references: data.references ?? [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    } as FeatureItem
  })
}

/**
 * Create a new feature
 */
export async function createFeature(input: CreateFeatureInput): Promise<FeatureItem> {
  const now = Timestamp.now()
  const featuresRef = collection(db, COLLECTION_NAME)

  const docRef = await addDoc(featuresRef, {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    imageUrl: input.imageUrl ?? null,
    references: input.references ?? [],
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: docRef.id,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    imageUrl: input.imageUrl ?? null,
    references: input.references ?? [],
    createdAt: now.toDate().toISOString(),
    updatedAt: now.toDate().toISOString(),
  }
}

/**
 * Update an existing feature
 */
export async function updateFeature(
  id: string,
  input: UpdateFeatureInput
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id)
  const updateData: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  }

  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined) updateData.description = input.description
  if (input.status !== undefined) updateData.status = input.status
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl
  if (input.references !== undefined) updateData.references = input.references

  await updateDoc(docRef, updateData)
}

/**
 * Delete a feature
 */
export async function deleteFeature(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

/**
 * Upload an image for a feature and return the download URL
 */
export async function uploadFeatureImage(
  featureId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`
  const storagePath = `features/${featureId}/${fileName}`
  const fileRef = ref(storage, storagePath)

  await uploadBytes(fileRef, file, { contentType: file.type })
  const downloadUrl = await getDownloadURL(fileRef)

  return downloadUrl
}

/**
 * Delete a feature image from storage
 */
export async function deleteFeatureImage(imageUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, imageUrl)
    await deleteObject(fileRef)
  } catch (error) {
    // Ignore errors if file doesn't exist
    console.warn('Failed to delete feature image:', error)
  }
}
