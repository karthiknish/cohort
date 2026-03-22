import type { Metadata } from 'next'
import ResetPasswordPageClient from './reset-password-page-client'

type RouteSearchParams = Record<string, string | string[] | undefined>

type ResetPasswordPageProps = {
  searchParams?: RouteSearchParams | Promise<RouteSearchParams>
}

function getFirstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return typeof value === 'string' ? value : null
}

export const metadata: Metadata = {
  title: 'Reset Password | Cohorts',
  description: 'Set a new password for your Cohorts account using a secure reset link.',
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams

  return <ResetPasswordPageClient oobCode={getFirstSearchParam(resolvedSearchParams?.oobCode)} />
}
