"use client"

import dynamic from "next/dynamic"

const LandingHomeEditor = dynamic(
  () => import("./landing-home-editor").then((m) => m.LandingHomeEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[240px] animate-pulse rounded-lg border border-border bg-muted/40"
        role="status"
        aria-busy
      />
    ),
  }
)

export { LandingHomeEditor }
