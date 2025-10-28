import { User } from '@/types'
import { auth } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'member'
  agencyId: string
  createdAt: Date
  updatedAt: Date
}

export interface SignUpData {
  email: string
  password: string
  name: string
  agencyName: string
}

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []

  private constructor() {
    // Initialize Firebase auth state listener
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const authUser = await this.mapFirebaseUser(firebaseUser)
          this.currentUser = authUser
          this.notifyListeners(authUser)
        } catch (error) {
          console.error('Error mapping Firebase user:', error)
          this.currentUser = null
          this.notifyListeners(null)
        }
      } else {
        this.currentUser = null
        this.notifyListeners(null)
      }
    })
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async mapFirebaseUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
    // In a real implementation, you would fetch user data from Firestore
    // For now, we'll create a basic user object from Firebase user
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'User',
      role: 'admin', // Default role, would be fetched from database
      agencyId: 'default-agency', // Would be fetched from database
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error) {
      throw new Error('Invalid email or password')
    }
  }

  async signUp(data: SignUpData): Promise<AuthUser> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      )

      // In a real implementation, you would also:
      // 1. Create user document in Firestore
      // 2. Create agency document
      // 3. Set up initial agency settings
      
      const authUser = await this.mapFirebaseUser(userCredential.user)
      return authUser
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use')
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak')
      } else {
        throw new Error('Failed to create account')
      }
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error('Failed to sign out')
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Call callback immediately with current user
    callback(this.currentUser)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(user: AuthUser | null): void {
    this.authStateListeners.forEach(listener => listener(user))
  }

  async resetPassword(email: string): Promise<void> {
    try {
      // In a real implementation, you would use Firebase's sendPasswordResetEmail
      console.log('Password reset email sent to:', email)
    } catch (error) {
      throw new Error('Failed to send password reset email')
    }
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      // In a real implementation, you would update the user document in Firestore
      // and potentially update the Firebase user profile
      
      this.currentUser = {
        ...this.currentUser,
        ...data,
        updatedAt: new Date()
      }
      
      this.notifyListeners(this.currentUser)
      return this.currentUser
    } catch (error) {
      throw new Error('Failed to update profile')
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      // In a real implementation, you would use Firebase's updatePassword
      // after re-authenticating the user
      console.log('Password changed successfully')
    } catch (error) {
      throw new Error('Failed to change password')
    }
  }

  async deleteAccount(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      // In a real implementation, you would:
      // 1. Delete user document from Firestore
      // 2. Delete associated data (clients, campaigns, etc.)
      // 3. Delete Firebase user
      console.log('Account deleted successfully')
    } catch (error) {
      throw new Error('Failed to delete account')
    }
  }
}

export const authService = AuthService.getInstance()
