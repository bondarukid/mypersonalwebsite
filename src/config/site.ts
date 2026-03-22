const HERO_IMAGE_PATH = "images/myphotolanding.jpg"

const UNSPLASH_FALLBACK =
  "https://images.unsplash.com/photo-1586173806725-797f4d632f5d?q=80&w=2388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

export function getHeroImageSrc(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return UNSPLASH_FALLBACK
  return `${supabaseUrl}/storage/v1/object/public/${HERO_IMAGE_PATH}`
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
