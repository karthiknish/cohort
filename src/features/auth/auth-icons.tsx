import Link from 'next/link'
import { Lock, Mail, User } from 'lucide-react'

export const authMailIconSm = <Mail className="h-4 w-4" aria-hidden />
export const authMailIconLg = <Mail className="h-6 w-6" aria-hidden />
export const authLockIconSm = <Lock className="h-4 w-4" aria-hidden />
export const authLockIconLg = <Lock className="h-6 w-6" aria-hidden />
export const authUserIconSm = <User className="h-4 w-4" aria-hidden />

export const authForgotPasswordLink = (
  <Link
    href="/auth/forgot"
    className="text-xs font-medium text-primary hover:underline underline-offset-4"
  >
    Forgot password?
  </Link>
)
