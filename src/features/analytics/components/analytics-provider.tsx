"use client"

import { getAnalytics, isSupported } from "firebase/analytics"
import { useEffect } from "react"
import { useCookieConsent } from "@/features/cookie-consent"
import { getFirebaseApp } from "@/lib/firebase"

/**
 * Client-side provider that initializes Firebase Analytics.
 * Analytics only runs when Measurement ID is configured and user has consented.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { analyticsConsent } = useCookieConsent()

  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined") return
      if (!analyticsConsent) return
      if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return

      const supported = await isSupported()
      if (!supported) return

      const app = getFirebaseApp()
      if (!app) return

      getAnalytics(app)
    }

    init()
  }, [analyticsConsent])

  return children
}
