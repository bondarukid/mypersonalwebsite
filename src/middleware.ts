import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard && !user) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectTo", pathname)
    return Response.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
