import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  // Protected routes (everything under /dashboard and root)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname === '/'

  if (isProtectedRoute && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
