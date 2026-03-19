import { type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Env validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars')
    return new NextResponse('Service unavailable', { status: 500 })
  }

  let res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Workspace slug resolution with validation
  let workspaceSlug = 'default'
  if (pathname.startsWith('/app/')) {
    const segments = pathname.split('/').slice(2).filter(Boolean) // Filter empty segments (handles /app/)
    if (segments.length > 0) {
      const rawSlug = segments[0]
      // Validate slug: alphanumeric, hyphens, underscores, 1-32 chars
      const isValidSlug = /^[a-z0-9-_]{1,32}$/.test(rawSlug)
      workspaceSlug = isValidSlug ? rawSlug : 'default'
    }
  }

  let session = null
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session: supabaseSession } } = await supabase.auth.getSession()
    session = supabaseSession
  } catch (error) {
    console.error('Middleware error:', error)
    // Session remains null, which will cause auth guard to redirect from /app routes
  }

  // Set workspace slug header (after validation)
  res.headers.set('x-workspace-slug', workspaceSlug)

  // Protect app routes
  if ((pathname === '/app' || pathname.startsWith('/app/')) && !session) {
    const redirectUrl = new URL('/login', req.url)
    const redirectRes = NextResponse.redirect(redirectUrl)
    // Transfer cookies from res to redirectRes (spread preserves httpOnly, secure, sameSite, etc.)
    res.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectRes.cookies.set(name, value, options)
    })
    // Also copy workspace slug header to redirect response
    redirectRes.headers.set('x-workspace-slug', workspaceSlug)
    return redirectRes
  }

  // Optional: redirect logged in to app (or dashboard? keep / for now)
  if (session && ['/login', '/signup'].includes(pathname)) {
    const redirectUrl = new URL('/', req.url)
    const redirectRes = NextResponse.redirect(redirectUrl)
    // Transfer cookies from res to redirectRes (spread preserves httpOnly, secure, sameSite, etc.)
    res.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectRes.cookies.set(name, value, options)
    })
    // Also copy workspace slug header to redirect response
    redirectRes.headers.set('x-workspace-slug', workspaceSlug)
    return redirectRes
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}