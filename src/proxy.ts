import { type NextRequest } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { updateSession } from "@/lib/supabase/middleware"
import { routing } from "@/i18n/routing"

const intlMiddleware = createIntlMiddleware(routing)

export async function proxy(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname
  const localeSegment = pathname.match(/^\/(en|uk|ja)(\/|$)/)
  const isDashboard =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    (localeSegment && pathname.includes("/dashboard"))

  if (isDashboard && !user) {
    const locale = localeSegment?.[1] ?? routing.defaultLocale
    const loginPath =
      locale === routing.defaultLocale ? "/login" : `/${locale}/login`
    const redirectUrl = new URL(loginPath, request.url)
    redirectUrl.searchParams.set("redirectTo", pathname)
    return Response.redirect(redirectUrl)
  }

  const intlResponse = intlMiddleware(request)

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      maxAge: cookie.maxAge,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
    })
  })

  return intlResponse
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
