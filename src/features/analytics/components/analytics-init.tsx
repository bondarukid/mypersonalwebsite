"use client"

import { CookieConsentBanner, CookieConsentProvider } from "@/features/cookie-consent"
import { AnalyticsProvider } from "./analytics-provider"
import { PageViewTracker } from "./page-view-tracker"

/**
 * Cookie consent (localStorage) + optional Firebase Analytics after opt-in.
 */
export function AnalyticsInit({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <AnalyticsProvider>
        <PageViewTracker />
        {children}
        <CookieConsentBanner />
      </AnalyticsProvider>
    </CookieConsentProvider>
  )
}
