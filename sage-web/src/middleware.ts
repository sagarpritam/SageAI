import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/history', '/dashboard']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sageai_jwt')?.value
  const path = request.nextUrl.pathname

  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => 
    path.startsWith(route)
  )

  if (isProtected && !token) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is already logged in and tries to access login page, redirect to home
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
