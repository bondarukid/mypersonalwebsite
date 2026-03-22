"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

const STORAGE_KEY = "cookie_consent"

export type ConsentState = {
  analytics: boolean
  timestamp: number
  version: 1
}

function parseStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (parsed.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

function persistConsent(state: ConsentState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

type CookieConsentContextValue = {
  hasAnswered: boolean
  analyticsConsent: boolean
  acceptAll: () => void
  declineAll: () => void
  clearConsent: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
)

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [state, setState] = useState<ConsentState | null>(null)

  useEffect(() => {
    setState(parseStoredConsent())
  }, [])

  const acceptAll = useCallback(() => {
    const next: ConsentState = {
      analytics: true,
      timestamp: Date.now(),
      version: 1,
    }
    persistConsent(next)
    setState(next)
  }, [])

  const declineAll = useCallback(() => {
    const next: ConsentState = {
      analytics: false,
      timestamp: Date.now(),
      version: 1,
    }
    persistConsent(next)
    setState(next)
  }, [])

  const clearConsent = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setState(null)
  }, [])

  const value: CookieConsentContextValue = {
    hasAnswered: state !== null,
    analyticsConsent: state?.analytics ?? false,
    acceptAll,
    declineAll,
    clearConsent,
  }

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider")
  }
  return ctx
}
