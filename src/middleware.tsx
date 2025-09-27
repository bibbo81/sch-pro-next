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
  
  console.log('Middleware: Checking auth for', pathname)
  console.log('Session exists:', !!session)
  
  // Protezione per dashboard e API protette
  const requiresAuth = pathname.startsWith('/dashboard') ||
                      pathname.startsWith('/api/shipments') ||
                      pathname.startsWith('/api/products') ||
                      pathname.startsWith('/api/trackings') ||
                      pathname.startsWith('/api/users') ||
                      pathname.startsWith('/api/organizations') ||
                      (pathname.startsWith('/api/super-admin') && !pathname.includes('/activate') && !pathname.includes('/check')) ||
                      pathname.startsWith('/super-admin') ||
                      pathname.startsWith('/api/protected')
  
  if (!session && requiresAuth) {
    console.log('Redirecting to login - no session for:', pathname)
    
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