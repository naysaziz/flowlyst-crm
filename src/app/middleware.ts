import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create Supabase client for middleware
  const supabase = createMiddlewareClient(
    {
      req,
      res,
    },
    {
      cookies: {},
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Auth guard: redirect unauth users from /app/* to /login
  if (!session?.user && pathname.startsWith('/app/')) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Workspace slug resolution
  let workspaceSlug = 'default' // Default workspace

  if (pathname.startsWith('/app/')) {
    const segments = pathname.split('/').slice(2) // Skip empty and 'app'
    if (segments.length > 0) {
      workspaceSlug = segments[0]
    }
  }

  // Inject workspace context headers
  res.headers.set('x-workspace-slug', workspaceSlug)

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}