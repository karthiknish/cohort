import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_ROUTE_MATCHER = ['/dashboard', '/admin']
const ADMIN_ONLY_ROUTE_PREFIX = '/admin'
const AUTH_ROUTE_PREFIX = '/auth'
const AUTH_COOKIE = 'cohorts_token'
const ROLE_COOKIE = 'cohorts_role'

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_MATCHER.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE)?.value

  if (pathname.startsWith(AUTH_ROUTE_PREFIX)) {
    if (token) {
      const target = request.nextUrl.clone()
      target.pathname = '/dashboard'
      target.search = ''
      return NextResponse.redirect(target)
    }
    return NextResponse.next()
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith(ADMIN_ONLY_ROUTE_PREFIX)) {
    const role = request.cookies.get(ROLE_COOKIE)?.value
    if (role !== 'admin') {
      const target = request.nextUrl.clone()
      target.pathname = '/dashboard'
      target.search = ''
      return NextResponse.redirect(target)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
