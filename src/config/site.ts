const HERO_IMAGE_PATH = "images/myphotolanding.jpg"

/** Shown if Supabase is unset, storage 404/400, or for local dev when no asset exists. */
export const HERO_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1586173806725-797f4d632f5d?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

/**
 * - `NEXT_PUBLIC_LANDING_HERO_URL`: optional override. May be a site path (`/hero.jpg` →
 *   `public/hero.jpg`) or any absolute URL.
 * - Otherwise: Supabase public object `images` bucket, key `myphotolanding.jpg`.
 *   Create that bucket, mark public, and upload the file, or the URL will 400.
 * - If `NEXT_PUBLIC_SUPABASE_URL` is missing: returns Unsplash fallback.
 */
function configuredHeroImageSrc(): string {
  const o = process.env.NEXT_PUBLIC_LANDING_HERO_URL?.trim()
  if (o) return o
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return HERO_IMAGE_FALLBACK
  return `${supabaseUrl}/storage/v1/object/public/${HERO_IMAGE_PATH}`
}

export function getHeroImageSrc(): string {
  return configuredHeroImageSrc()
}

/**
 * Picks a hero URL that Next/Image can load. If the Storage object is missing or returns
 * 4xx, falls back to {@link HERO_IMAGE_FALLBACK} (avoids noisy optimizer errors in logs).
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
