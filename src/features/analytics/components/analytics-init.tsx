"use client"

import { CookieConsentBanner, CookieConsentProvider } from "@/features/cookie-consent"
import { AnalyticsProvider } from "./analytics-provider"
import { PageViewTracker } from "./page-view-tracker"

/**
 * Wraps children with cookie consent, analytics provider, and page view tracking.
 * Dashboard routes are excluded from tracking.
 * Analytics runs only after user accepts.
 */
export function AnalyticsInit({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <AnalyticsProvider>
        <PageViewTracker />
        <CookieConsentBanner />
        {children}
      </AnalyticsProvider>
    </CookieConsentProvider>
  )
}
