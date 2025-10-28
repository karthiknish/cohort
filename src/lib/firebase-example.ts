// Example of how to use Firebase in your application
import { app, analytics, auth, db, storage, functions } from './firebase'
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { collection, addDoc, getDocs } from 'firebase/firestore'

// Example authentication functions
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, user)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Example Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data)
    return docRef.id
  } catch (error) {
    console.error('Error adding document:', error)
    throw error
  }
}

export const getDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error getting documents:', error)
    throw error
  }
}

// Example Analytics usage
export const logEvent = (eventName: string, parameters?: any) => {
  if (analytics) {
    // Note: You'll need to import logEvent from 'firebase/analytics'
    // import { logEvent } from 'firebase/analytics'
    // logEvent(analytics, eventName, parameters)
    console.log('Analytics event:', eventName, parameters)
  }
}

// Firebase is now ready to use throughout your app!
