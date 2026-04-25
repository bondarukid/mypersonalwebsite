"use client"

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react"

const STORAGE_KEY = "cookie_consent"

export type ConsentState = {
  analytics: boolean
  timestamp: number
  version: 1
}

const storeListeners = new Set<() => void>()

function emitConsentChange() {
  for (const l of storeListeners) l()
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

function getConsentRawSnapshot(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function subscribeToConsentStore(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }
  storeListeners.add(onChange)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    storeListeners.delete(onChange)
    window.removeEventListener("storage", onStorage)
  }
}

function persistConsent(state: ConsentState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
  emitConsentChange()
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
  const rawState = useSyncExternalStore(
    subscribeToConsentStore,
    getConsentRawSnapshot,
    () => null
  )
  const state =
    rawState == null
      ? null
      : (() => {
          try {
            const parsed = JSON.parse(rawState) as ConsentState
            return parsed.version === 1 ? parsed : null
          } catch {
            return null
          }
        })()

  const acceptAll = useCallback(() => {
    const next: ConsentState = {
      analytics: true,
      timestamp: Date.now(),
      version: 1,
    }
    persistConsent(next)
  }, [])

  const declineAll = useCallback(() => {
    const next: ConsentState = {
      analytics: false,
      timestamp: Date.now(),
      version: 1,
    }
    persistConsent(next)
  }, [])

  const clearConsent = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    emitConsentChange()
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
