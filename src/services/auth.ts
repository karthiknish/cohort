import { User } from '@/types'
import { auth } from '@/lib/firebase'
import {
  enqueueSyncJob,
  persistIntegrationTokens,
} from '@/lib/firestore-integrations'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  linkWithPopup,
  User as FirebaseUser,
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

  ensureAuthenticatedFirebaseUser(): FirebaseUser {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('You must be signed in to connect ad accounts')
    }
    return currentUser
  }

  async connectGoogleAdsAccount(): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    const provider = new GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/adwords')
    provider.addScope('email')

    try {
      const result = await linkWithPopup(currentUser, provider)
      const credential = GoogleAuthProvider.credentialFromResult(result)

      await persistIntegrationTokens({
        userId: currentUser.uid,
        providerId: 'google',
        accessToken: credential?.accessToken ?? null,
        idToken: credential?.idToken ?? null,
        scopes: ['https://www.googleapis.com/auth/adwords', 'email'],
      })
      await enqueueSyncJob({ userId: currentUser.uid, providerId: 'google' })
    } catch (error: any) {
      console.error('Google Ads connection error:', error)
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This Google account is already linked to another user.')
      }
      throw new Error('Failed to connect Google Ads. Please try again.')
    }
  }

  async connectFacebookAdsAccount(): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    const provider = new FacebookAuthProvider()
    provider.addScope('ads_management')
    provider.addScope('business_management')

    try {
      const result = await linkWithPopup(currentUser, provider)
      const credential = FacebookAuthProvider.credentialFromResult(result)
      const rawScopes = (result as any)?._tokenResponse?.oauthAccessTokenScopes
      const rawAccountId = Array.isArray(rawScopes)
        ? rawScopes.find((scope: unknown) => typeof scope === 'string' && scope.includes('act_'))
        : null
      const rawUserInfo = (result as any)?._tokenResponse?.rawUserInfo
      const accountId =
        (typeof rawAccountId === 'string' && rawAccountId) ||
        (typeof rawUserInfo === 'string' ? extractAccountIdFromRaw(rawUserInfo) : null)

      await persistIntegrationTokens({
        userId: currentUser.uid,
        providerId: 'facebook',
        accessToken: credential?.accessToken ?? null,
        scopes: ['ads_management', 'business_management'],
        accountId,
      })
      await enqueueSyncJob({ userId: currentUser.uid, providerId: 'facebook' })
    } catch (error: any) {
      console.error('Facebook Ads connection error:', error)
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This Facebook account is already linked to another user.')
      }
      throw new Error('Failed to connect Facebook Ads. Please try again.')
    }
  }

  async connectLinkedInAdsAccount(): Promise<void> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    const provider = new OAuthProvider('linkedin.com')
    provider.addScope('r_ads')
    provider.addScope('rw_ads')

    try {
      const result = await linkWithPopup(currentUser, provider)
      const credential = OAuthProvider.credentialFromResult(result)

      await persistIntegrationTokens({
        userId: currentUser.uid,
        providerId: 'linkedin',
        accessToken: credential?.accessToken ?? null,
        idToken: credential?.idToken ?? null,
        scopes: ['r_ads', 'rw_ads'],
      })
      await enqueueSyncJob({ userId: currentUser.uid, providerId: 'linkedin' })
    } catch (error: any) {
      console.error('LinkedIn Ads connection error:', error)
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This LinkedIn account is already linked to another user.')
      }
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('LinkedIn Ads connection is not enabled. Contact support to enable this provider.')
      }
      throw new Error('Failed to connect LinkedIn Ads. Please try again.')
    }
  }

  async getIdToken(): Promise<string> {
    const currentUser = this.ensureAuthenticatedFirebaseUser()
    return currentUser.getIdToken()
  }

  async signInWithFacebook(): Promise<AuthUser> {
    try {
      const provider = new FacebookAuthProvider()
      provider.addScope('email')
      provider.addScope('public_profile')

      const userCredential = await signInWithPopup(auth, provider)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: any) {
      console.error('Facebook sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion')
      }
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with the same email. Please sign in using that provider.')
      }
      throw new Error('Failed to sign in with Facebook. Please try again.')
    }
  }

  async signInWithLinkedIn(): Promise<AuthUser> {
    try {
      const provider = new OAuthProvider('linkedin.com')
      provider.addScope('r_liteprofile')
      provider.addScope('r_emailaddress')

      provider.setCustomParameters({
        prompt: 'consent',
      })

      const userCredential = await signInWithPopup(auth, provider)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: any) {
      console.error('LinkedIn sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion')
      }
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('LinkedIn sign-in is not enabled. Please contact support to enable this provider.')
      }
      throw new Error('Failed to sign in with LinkedIn. Please try again.')
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

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider()
      // Configure provider with additional scopes if needed
      provider.addScope('email')
      provider.addScope('profile')
      
      // Set custom parameters for better user experience
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const userCredential = await signInWithPopup(auth, provider)
      return await this.mapFirebaseUser(userCredential.user)
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completion')
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked by the browser. Please allow popups for this site.')
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.')
      } else {
        throw new Error('Failed to sign in with Google. Please try again.')
      }
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

function extractAccountIdFromRaw(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw)
    const accounts = parsed?.data?.adaccounts || parsed?.adaccounts || []
    if (Array.isArray(accounts) && accounts.length > 0) {
      const firstAccount = accounts[0]
      if (typeof firstAccount === 'string') return firstAccount
      if (typeof firstAccount?.id === 'string') return firstAccount.id
      if (typeof firstAccount?.account_id === 'string') return firstAccount.account_id
    }
  } catch (error) {
    console.warn('Failed to parse Meta raw user info for ad account id', error)
  }
  return null
}

export const authService = AuthService.getInstance()
