import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // MOCK
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('qnkrdqxuhkkixksxghpv')) {
    const user = null
    const PUBLIC_ROUTES = ['/', '/login', '/register']
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
      request.nextUrl.pathname === route
    )

    // Permitir acceso a todas las rutas protegidas para poder diseñar
    return supabaseResponse

    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const PUBLIC_ROUTES = ['/', '/login', '/register']
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    request.nextUrl.pathname === route
  )

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('next', nextPath)
    return NextResponse.redirect(url)
  }

  // Optional: Redirect authenticated users away from public pages (like login/register) to dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const nextPath = request.nextUrl.searchParams.get('next')
    if (nextPath?.startsWith('/')) {
      return NextResponse.redirect(new URL(nextPath, request.url))
    }

    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
