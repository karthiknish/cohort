// Example of how to use Firebase in your application
import { auth, db } from './firebase'
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { collection, addDoc, getDocs, type DocumentData } from 'firebase/firestore'
import { logAnalyticsEvent } from './analytics'

// Example authentication functions
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error: unknown) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error: unknown) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Example Firestore functions
export const addDocument = async <T extends DocumentData>(collectionName: string, data: T): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data)
    return docRef.id
  } catch (error: unknown) {
    console.error('Error adding document:', error)
    throw error
  }
}

export const getDocuments = async <T extends DocumentData>(collectionName: string): Promise<Array<{ id: string } & T>> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as T) }))
  } catch (error: unknown) {
    console.error('Error getting documents:', error)
    throw error
  }
}

// Example Analytics usage
export const logEvent = async (
  eventName: string,
  parameters?: Record<string, string | number | boolean | null | undefined>
) => {
  await logAnalyticsEvent(eventName, parameters)
}

// Firebase is now ready to use throughout your app!
