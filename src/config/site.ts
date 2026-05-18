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

const DEFAULT_HERO = "/images/myphotolanding.jpg"

/** Shown if the configured hero asset is missing or unreachable. */
export const HERO_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1586173806725-797f4d632f5d?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

/**
 * - `NEXT_PUBLIC_LANDING_HERO_URL`: optional override (site path `/hero.jpg` or full URL).
 * - Otherwise: `/images/myphotolanding.jpg` under `public/`.
 */
function configuredHeroImageSrc(): string {
  const o = process.env.NEXT_PUBLIC_LANDING_HERO_URL?.trim()
  if (o) return o
  return DEFAULT_HERO
}

export function getHeroImageSrc(): string {
  return configuredHeroImageSrc()
}

/**
 * Picks a hero URL that Next/Image can load. If the file is missing or returns
 * 4xx, falls back to {@link HERO_IMAGE_FALLBACK}.
 */
export async function resolveHeroImageSrc(): Promise<string> {
  const u = configuredHeroImageSrc()
  if (u === HERO_IMAGE_FALLBACK) return u
  if (u.startsWith("/")) return u
  if (u.includes("images.unsplash.com")) return u
  if (!u.startsWith("http")) return u
  try {
    const r = await fetch(u, { method: "HEAD", next: { revalidate: 86_400 } })
    if (r.ok) return u
  } catch {
    // ignore
  }
  return HERO_IMAGE_FALLBACK
}

/**
 * GitHub repo slug (owner/repo). Owner comes from GITHUB_USERNAME when repo-only.
 * - NEXT_PUBLIC_GITHUB_REPO=mypersonalwebsite → GITHUB_USERNAME/mypersonalwebsite
 * - NEXT_PUBLIC_GITHUB_REPO=owner/repo → used as-is
 */
export function getGithubRepo(): string | null {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO?.trim()
  if (!repo) return null

  if (repo.includes("/")) {
    return repo
  }

  const username = process.env.GITHUB_USERNAME?.trim()
  if (!username) return null

  return `${username}/${repo}`
}
