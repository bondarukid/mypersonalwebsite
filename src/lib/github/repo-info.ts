import { unstable_cache } from "next/cache"

export type RepoInfo = {
  url: string
  fullName: string
  stars: number
  forks: number
} | null

async function fetchRepoFromGitHub(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoInfo> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }
  if (token) {
    ;(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    )
    if (!res.ok) return null

    const data = (await res.json()) as {
      html_url: string
      full_name: string
      stargazers_count: number
      forks_count: number
    }

    return {
      url: data.html_url ?? `https://github.com/${owner}/${repo}`,
      fullName: data.full_name ?? `${owner}/${repo}`,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
    }
  } catch (err) {
    console.error("[fetchRepoFromGitHub]", err)
    return null
  }
}

/**
 * Fetch GitHub repo info (stars, forks, url) with 1h cache.
 * Returns null if repo slug is invalid or API fails.
 */
export async function getRepoInfo(
  owner: string,
  repo: string
): Promise<RepoInfo> {
  if (!owner?.trim() || !repo?.trim()) return null

  const token = process.env.GITHUB_TOKEN

  return unstable_cache(
    () => fetchRepoFromGitHub(owner.trim(), repo.trim(), token),
    [`github-repo-${owner}-${repo}`],
    { revalidate: 3600 }
  )()
}
