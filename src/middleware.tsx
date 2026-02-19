import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Ignora path specifici e asset statici
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/.well-known') ||
    pathname === '/login' ||  // Aggiungo /login per evitare loop
    (pathname.includes('.') && !pathname.startsWith('/api'))
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // SECURITY: Protect ALL API routes and dashboard pages by default.
  // Only explicitly exempt routes that handle their own auth:
  const isPublicApiRoute =
    pathname.startsWith('/api/cron/') ||          // Uses CRON_SECRET bearer token
    pathname === '/api/stripe/webhook' ||          // Uses Stripe signature verification
    pathname === '/api/vehicle-types' ||            // Public static reference data
    pathname === '/api/carriers' ||                 // Public static reference data
    pathname === '/api/transport-modes' ||          // Public static reference data
    pathname === '/api/subscription-plans'          // Public read-only plans

  const requiresAuth = (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/settings') ||
    (pathname.startsWith('/api/') && !isPublicApiRoute)
  )

  if (!session && requiresAuth) {
    // Per le API, ritorna 401 invece di redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Per le pagine, redirect al login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}