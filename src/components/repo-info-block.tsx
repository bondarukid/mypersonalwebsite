"use client"

import { Github, Star, GitFork } from "lucide-react"
import { useTranslations } from "next-intl"
import type { RepoInfo } from "@/lib/github/repo-info"

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

const blockBase =
  "inline-flex items-center gap-1.5 text-sm text-muted-foreground border rounded-md px-2 py-1"

export function RepoInfoBlock({
  repoInfo,
  className,
}: {
  repoInfo: RepoInfo
  className?: string
}) {
  const t = useTranslations("header")

  if (!repoInfo) return null

  return (
    <a
      href={repoInfo.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("repoAria", { repo: repoInfo.fullName })}
      className={`${blockBase} hover:text-accent-foreground hover:border-muted-foreground/30 transition-colors ${className ?? ""}`}
    >
      <Github className="size-4 shrink-0" aria-hidden />
      <span className="font-medium">{repoInfo.fullName}</span>
      <span className="text-muted-foreground/60" aria-hidden>
        |
      </span>
      <Star className="size-4 shrink-0" aria-hidden />
      <span>{formatCount(repoInfo.stars)}</span>
      <GitFork className="size-4 shrink-0 ml-0.5" aria-hidden />
      <span>{formatCount(repoInfo.forks)}</span>
    </a>
  )
}
