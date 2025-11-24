'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useToast } from '@/components/ui/use-toast'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) return

    setSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      await resetPassword(email)
      setSuccess(true)
      toast({
        title: 'Check your inbox',
        description: 'If an account exists for this email, we sent password reset instructions.',
      })
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to send reset instructions. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <FadeIn as="div" className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Enter the email associated with your account and we&apos;ll email you reset instructions.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <FadeInStagger as="div" className="space-y-5">
            <FadeInItem as="div" className="space-y-2">
              <Label htmlFor="reset-email">Email address</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </FadeInItem>

            <FadeInItem as="div">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending reset link…' : 'Send reset link'}
              </Button>
            </FadeInItem>
          </FadeInStagger>
        </form>

        {success && (
          <Alert>
            <AlertTitle>Reset email sent</AlertTitle>
            <AlertDescription>
              If an account exists for <strong>{email.trim()}</strong>, you&apos;ll receive an email with steps to reset your password.
              Be sure to check your spam folder as well.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center text-xs text-muted-foreground">
          Remember your password?{' '}
          <Link href="/auth" className="font-medium text-primary hover:underline">
            Return to sign in
          </Link>
        </div>
      </FadeIn>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}
