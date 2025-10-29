'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Facebook, Linkedin } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: '',
    agencyName: ''
  })
  const [error, setError] = useState('')
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithLinkedIn, signUp, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = (type: 'signin' | 'signup') => async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (type === 'signup') {
        await signUp(signUpData)
      } else {
        await signIn(signInData.email, signInData.password)
      }
      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.')
    }
  }

  const handleFacebookSignIn = async () => {
    setError('')
    try {
      await signInWithFacebook()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Facebook sign-in failed. Please try again.')
    }
  }

  const handleLinkedInSignIn = async () => {
    setError('')
    try {
      await signInWithLinkedIn()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'LinkedIn sign-in failed. Please try again.')
    }
  }

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 py-12 px-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome to Cohorts</CardTitle>
            <CardDescription>
              {activeTab === 'signup'
                ? 'Create your account to start managing campaigns across channels.'
                : 'Sign in to access your performance dashboards and automations.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="space-y-6">
              <TabsList className="w-full">
                <TabsTrigger value="signin" className="flex-1">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-5" onSubmit={handleSubmit('signin')}>
                  <div className="space-y-2">
                    <Label htmlFor="signInEmail">Email address</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="signInEmail"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signInData.email}
                        onChange={handleSignInChange}
                        placeholder="you@example.com"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signInPassword">Password</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        id="signInPassword"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={signInData.password}
                        onChange={handleSignInChange}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && activeTab === 'signin' && (
                    <Alert variant="destructive">
                      <AlertTitle>Authentication error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Please wait…' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-5" onSubmit={handleSubmit('signup')}>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="name"
                      type="text"
                      required
                      value={signUpData.name}
                      onChange={handleSignUpChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agencyName">Agency Name</Label>
                    <Input
                      id="agencyName"
                      name="agencyName"
                      type="text"
                      required
                      value={signUpData.agencyName}
                      onChange={handleSignUpChange}
                      placeholder="Marketing Agency Inc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpEmail">Email address</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="signUpEmail"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={signUpData.email}
                        onChange={handleSignUpChange}
                        placeholder="you@example.com"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signUpPassword">Password</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </span>
                      <Input
                        id="signUpPassword"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        placeholder="Create a strong password"
                        className="pl-9 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && activeTab === 'signup' && (
                    <Alert variant="destructive">
                      <AlertTitle>Authentication error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Please wait…' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="relative flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Or continue with
                </span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? 'Signing in…' : 'Continue with Google'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleFacebookSignIn}
                className="w-full"
              >
                <Facebook className="mr-2 h-4 w-4" />
                {loading ? 'Signing in…' : 'Continue with Facebook'}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleLinkedInSignIn}
                className="w-full"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                {loading ? 'Signing in…' : 'Continue with LinkedIn'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Connecting with your ad platforms lets Cohorts import campaign data automatically once you’re in the
                dashboard.
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
