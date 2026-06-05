import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createMiddleware(routing)

// Cache for site settings (5 minutes)
const siteSettingsCache: { data: any; timestamp: number } = { data: null, timestamp: 0 }

async function getSiteSettings() {
  const now = Date.now()
  if (siteSettingsCache.data && now - siteSettingsCache.timestamp < 5 * 60 * 1000) {
    return siteSettingsCache.data
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase.from('site_settings').select('*').single()
  siteSettingsCache.data = data
  siteSettingsCache.timestamp = now
  return data
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // /admin and /api paths don't go through intl
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Chinese language conditional logic
  const settings = await getSiteSettings()
  const enableChinese = settings?.enable_chinese || false
  const enableChineseByIp = settings?.enable_chinese_by_ip || false

  // Redirect /zh to /en if Chinese is disabled
  if (!enableChinese && pathname.match(/^\/zh(\/|$)/)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/zh/, '/en')
    return NextResponse.redirect(url)
  }

  // Auto-detect Chinese IP
  if (enableChineseByIp && !request.cookies.get('NEXT_LOCALE')) {
    const country = request.headers.get('cf-ipcountry') || ''
    if (country === 'CN' && !pathname.match(/^\/zh(\/|$)/)) {
      const url = request.nextUrl.clone()
      url.pathname = '/zh' + pathname
      return NextResponse.redirect(url)
    }
  }

  // Adjust locales based on Chinese setting
  const locales = enableChinese
    ? routing.locales
    : routing.locales.filter(l => l !== 'zh')

  // Create adjusted middleware with filtered locales
  const adjustedMiddleware = createMiddleware({ ...routing, locales })

  return adjustedMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
