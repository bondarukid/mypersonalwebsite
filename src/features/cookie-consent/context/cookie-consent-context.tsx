"use client"

/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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

function persistConsent(state: ConsentState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore (private mode, disabled storage)
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
  const [state, setState] = useState<ConsentState | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const syncFromStorage = useCallback(() => {
    setState(parseStoredConsent())
  }, [])

  useEffect(() => {
    syncFromStorage()
    setHydrated(true)

    const onStoreChange = () => syncFromStorage()
    storeListeners.add(onStoreChange)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncFromStorage()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      storeListeners.delete(onStoreChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [syncFromStorage])

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

  /** Until hydrated, match server HTML (no localStorage) to avoid hydration errors. */
  const hasAnswered = hydrated && state !== null
  const analyticsConsent = hydrated && (state?.analytics ?? false)

  const value: CookieConsentContextValue = {
    hasAnswered,
    analyticsConsent,
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
