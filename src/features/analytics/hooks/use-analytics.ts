"use client"

import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics"
import { useCallback } from "react"
import { getFirebaseApp } from "@/lib/firebase"

/**
 * Hook for logging analytics events. Isolates Firebase so the service
 * can be swapped without changing consumers.
 */
export function useAnalytics() {
  const logEvent = useCallback((eventName: string, params?: object) => {
    if (typeof window === "undefined") return

    const app = getFirebaseApp()
    if (!app) return

    const analytics = getAnalytics(app)
    firebaseLogEvent(analytics, eventName, params)
  }, [])

  return { logEvent }
}
