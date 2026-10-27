import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that strictly require authentication
const protectedRoutes = ['/history', '/dashboard', '/settings', '/scan', '/deep-search']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('sageai_jwt')?.value
  const path = request.nextUrl.pathname

  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  )

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', path)
    return NextResponse.redirect(loginUrl)
  }

  // If user is already logged in and tries to access login page, redirect to dashboard
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const response = NextResponse.next()

  // Apply OWASP security headers to all responses
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; frame-ancestors 'self';"
  )

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
