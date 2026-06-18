import { Link } from '@/shared/ui/link';
import { Lock, Mail, User } from 'lucide-react';
export const authMailIconSm = <Mail className="size-4" aria-hidden/>;
export const authMailIconLg = <Mail className="size-6" aria-hidden/>;
export const authLockIconSm = <Lock className="size-4" aria-hidden/>;
export const authLockIconLg = <Lock className="size-6" aria-hidden/>;
export const authUserIconSm = <User className="size-4" aria-hidden/>;
export const authForgotPasswordLink = (<Link href="/auth/forgot" className="text-xs font-medium text-primary hover:underline underline-offset-4">
    Forgot password?
  </Link>);
