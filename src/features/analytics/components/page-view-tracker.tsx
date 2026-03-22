"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { useCookieConsent } from "@/features/cookie-consent"
import { useAnalytics } from "../hooks/use-analytics"

const DASHBOARD_PATH_PREFIX = "/dashboard"

function isDashboardRoute(pathname: string): boolean {
  return pathname === DASHBOARD_PATH_PREFIX || pathname.startsWith(`${DASHBOARD_PATH_PREFIX}/`)
}

/**
 * Tracks page views for all routes except /dashboard and its nested paths.
 * Only tracks when user has consented to analytics.
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const { analyticsConsent } = useCookieConsent()
  const { logEvent } = useAnalytics()

  useEffect(() => {
    if (!pathname) return
    if (!analyticsConsent) return
    if (isDashboardRoute(pathname)) return
    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return

    logEvent("page_view", {
      page_path: pathname,
      page_title: typeof document !== "undefined" ? document.title : pathname,
    })
  }, [pathname, analyticsConsent, logEvent])

  return null
}
