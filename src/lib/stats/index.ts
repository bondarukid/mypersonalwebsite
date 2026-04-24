import { unstable_cache } from 'next/cache'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import type { LandingStatsContentRow } from '@/lib/supabase/landing-stats-content'

/** Fallback values when APIs fail or env is not configured */
const FALLBACK = {
  stars: 1200,
  activeUsers: 22_000_000,
  poweredApps: 500,
} as const

export type Stats = {
  stars: number
  activeUsers: number
  poweredApps: number
}

export { formatActiveUsers } from '@/lib/stats-display'

/**
 * Returns synced/env stats, or manual totals from CMS when
 * `use_manual_totals` is enabled on the landing company row.
 */
export async function getStatsForLandingDisplay(
  content: LandingStatsContentRow | null
): Promise<Stats> {
  if (content?.use_manual_totals) {
    return {
      stars: content.manual_stars,
      activeUsers: content.manual_active_users,
      poweredApps: content.manual_powered_apps,
    }
  }
  return getStats()
}

export async function fetchGitHubStars(
  username: string,
  token?: string
): Promise<number> {
  if (!username) return 0

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers }
    )
    if (!res.ok) return 0
    const repos = (await res.json()) as Array<{ stargazers_count: number }>
    return repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0)
  } catch (err) {
    console.error('[fetchGitHubStars]', err)
    return 0
  }
}

async function getGitHubStars(): Promise<number> {
  const username = process.env.GITHUB_USERNAME
  if (!username) return 0
  return fetchGitHubStars(username, process.env.GITHUB_TOKEN)
}

export async function fetchGA4ActiveUsers(
  propertyIds: string[],
  credentials?: { gaClientEmail: string; gaPrivateKey: string }
): Promise<{ activeUsers: number }> {
  const clientEmail = credentials?.gaClientEmail || process.env.GA_CLIENT_EMAIL
  const privateKey = credentials?.gaPrivateKey || process.env.GA_PRIVATE_KEY

  if (!clientEmail || !privateKey || propertyIds.length === 0) {
    return { activeUsers: 0 }
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
  })

  let totalActiveUsers = 0
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  const startStr = startDate.toISOString().slice(0, 10)
  const endStr = endDate.toISOString().slice(0, 10)

  for (const id of propertyIds) {
    try {
      const [response] = await client.runReport({
        property: `properties/${id}`,
        dateRanges: [{ startDate: startStr, endDate: endStr }],
        metrics: [{ name: 'activeUsers' }],
      })

      // Prefer totals for metrics-only reports; fallback to rows
      const totals = response.totals?.[0]?.metricValues?.[0]?.value
      if (totals) {
        totalActiveUsers += parseInt(totals, 10)
      } else {
        const rows = response.rows ?? []
        for (const row of rows) {
          const val = row.metricValues?.[0]?.value
          if (val) totalActiveUsers += parseInt(val, 10)
        }
      }
    } catch (err) {
      console.error(`[getGA4Stats] Property ${id}:`, err)
    }
  }

  return { activeUsers: totalActiveUsers }
}

async function getGA4Stats(): Promise<{
  activeUsers: number
  poweredApps: number
}> {
  const propertyIds = (
    process.env.GA_PROPERTY_IDS ?? ''
  )
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  const clientEmail = process.env.GA_CLIENT_EMAIL
  const privateKey = process.env.GA_PRIVATE_KEY

  if (!propertyIds.length || !clientEmail || !privateKey) {
    return { activeUsers: 0, poweredApps: 0 }
  }

  const { activeUsers } = await fetchGA4ActiveUsers(propertyIds)
  return { activeUsers, poweredApps: propertyIds.length }
}

export async function refreshLandingStatsForCompany(
  companyId: string,
  apps: Array<{
    ga_property_id: string | null
    github_username: string | null
    enabled_for_landing: boolean
  }>,
  options?: { persist?: boolean; useAdmin?: boolean }
): Promise<Stats> {
  const enabled = apps.filter((a) => a.enabled_for_landing)
  const gaPropertyIds = enabled
    .map((a) => a.ga_property_id)
    .filter((id): id is string => !!id?.trim())
  const githubUsernames = [
    ...new Set(
      enabled
        .map((a) => a.github_username)
        .filter((u): u is string => !!u?.trim())
    ),
  ]

  const dbCredentials = await import('@/lib/supabase/stats-credentials').then(
    (m) => m.getStatsCredentials(companyId, { useAdmin: options?.useAdmin })
  )
  const clientEmail = dbCredentials?.gaClientEmail || process.env.GA_CLIENT_EMAIL
  const privateKey = dbCredentials?.gaPrivateKey || process.env.GA_PRIVATE_KEY
  const token = dbCredentials?.githubToken || process.env.GITHUB_TOKEN

  const ga4Creds =
    clientEmail && privateKey
      ? { gaClientEmail: clientEmail, gaPrivateKey: privateKey }
      : undefined

  const [ga4Result, ...githubResults] = await Promise.all([
    gaPropertyIds.length && ga4Creds
      ? fetchGA4ActiveUsers(gaPropertyIds, ga4Creds)
      : Promise.resolve({ activeUsers: 0 }),
    ...githubUsernames.map((u) => fetchGitHubStars(u, token)),
  ])

  const totalStars = githubResults.reduce((s, n) => s + n, 0)
  const ga4Users = ga4Result?.activeUsers ?? 0
  const stats: Stats = {
    stars: totalStars || FALLBACK.stars,
    activeUsers: ga4Users || FALLBACK.activeUsers,
    poweredApps: enabled.length || FALLBACK.poweredApps,
  }

  if (options?.persist) {
    const { upsertLandingStatsSnapshot } = await import(
      '@/lib/supabase/landing-stats-snapshot'
    )
    await upsertLandingStatsSnapshot(
      companyId,
      {
        stars: stats.stars,
        active_users: stats.activeUsers,
        powered_apps: stats.poweredApps,
      },
      { useAdmin: options?.useAdmin }
    )
  }

  return stats
}

function fetchStatsFromEnv(): Promise<Stats> {
  return Promise.all([
    getGitHubStars(),
    getGA4Stats(),
  ]).then(([stars, ga4]) => ({
    stars: stars || FALLBACK.stars,
    activeUsers: ga4.activeUsers || FALLBACK.activeUsers,
    poweredApps: ga4.poweredApps || FALLBACK.poweredApps,
  }))
}

export async function getStats(): Promise<Stats> {
  const { getLandingCompany } = await import(
    '@/lib/supabase/companies'
  )
  const { getLandingStatsSnapshot } = await import(
    '@/lib/supabase/landing-stats-snapshot'
  )

  const landing = await getLandingCompany()
  if (landing) {
    const snapshot = await getLandingStatsSnapshot(landing.id)
    if (snapshot) {
      const syncedAt = new Date(snapshot.synced_at).getTime()
      const maxAge = 25 * 60 * 60 * 1000
      if (Date.now() - syncedAt < maxAge) {
        return {
          stars: snapshot.stars || FALLBACK.stars,
          activeUsers: snapshot.active_users || FALLBACK.activeUsers,
          poweredApps: snapshot.powered_apps || FALLBACK.poweredApps,
        }
      }
    }
  }

  return unstable_cache(
    fetchStatsFromEnv,
    ['stats-github-ga4-env'],
    { revalidate: 3600 }
  )()
}
