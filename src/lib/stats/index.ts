import { unstable_cache } from 'next/cache'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

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

async function getGitHubStars(): Promise<number> {
  const username = process.env.GITHUB_USERNAME
  if (!username) return 0

  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return 0
    const repos = (await res.json()) as Array<{ stargazers_count: number }>
    return repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0)
  } catch (err) {
    console.error('[getGitHubStars]', err)
    return 0
  }
}

async function getGA4Stats(): Promise<{ activeUsers: number; poweredApps: number }> {
  const propertyIds = process.env.GA_PROPERTY_IDS
  const clientEmail = process.env.GA_CLIENT_EMAIL
  const privateKey = process.env.GA_PRIVATE_KEY

  if (!propertyIds || !clientEmail || !privateKey) {
    return { activeUsers: 0, poweredApps: 0 }
  }

  const ids = propertyIds.split(',').map((id) => id.trim()).filter(Boolean)
  if (ids.length === 0) return { activeUsers: 0, poweredApps: 0 }

  let client: BetaAnalyticsDataClient
  try {
    client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
    })
  } catch (err) {
    console.error('[getGA4Stats] Failed to create client:', err)
    return { activeUsers: 0, poweredApps: ids.length }
  }

  let totalActiveUsers = 0
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  const startStr = startDate.toISOString().slice(0, 10)
  const endStr = endDate.toISOString().slice(0, 10)

  for (const id of ids) {
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

  return { activeUsers: totalActiveUsers, poweredApps: ids.length }
}

async function fetchStatsImpl(): Promise<Stats> {
  const [stars, ga4] = await Promise.all([
    getGitHubStars(),
    getGA4Stats(),
  ])

  return {
    stars: stars || FALLBACK.stars,
    activeUsers: ga4.activeUsers || FALLBACK.activeUsers,
    poweredApps: ga4.poweredApps || FALLBACK.poweredApps,
  }
}

export async function getStats(): Promise<Stats> {
  return unstable_cache(
    fetchStatsImpl,
    ['stats-github-ga4'],
    { revalidate: 3600 }
  )()
}
