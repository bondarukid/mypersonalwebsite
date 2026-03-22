import { createClient } from "./server"
import { encryptCredentials, decryptCredentials } from "@/lib/crypto/credentials"

export type StatsCredentials = {
  gaClientEmail: string
  gaPrivateKey: string
  githubToken: string
}

type StatsCredentialsRow = {
  ga_client_email_encrypted: string | null
  ga_private_key_encrypted: string | null
  github_token_encrypted: string | null
}

export async function getStatsCredentials(
  companyId: string,
  options?: { useAdmin?: boolean }
): Promise<StatsCredentials | null> {
  const supabase = options?.useAdmin
    ? (await import("./admin")).createAdminClient()
    : await createClient()

  const { data, error } = await supabase
    .from("stats_api_credentials")
    .select("ga_client_email_encrypted, ga_private_key_encrypted, github_token_encrypted")
    .eq("company_id", companyId)
    .single()

  if (error || !data) return null

  const row = data as StatsCredentialsRow
  try {
    const gaClientEmail = row.ga_client_email_encrypted
      ? decryptCredentials(row.ga_client_email_encrypted)
      : ""
    const gaPrivateKey = row.ga_private_key_encrypted
      ? decryptCredentials(row.ga_private_key_encrypted)
      : ""
    const githubToken = row.github_token_encrypted
      ? decryptCredentials(row.github_token_encrypted)
      : ""
    return { gaClientEmail, gaPrivateKey, githubToken }
  } catch {
    return null
  }
}

export async function upsertStatsCredentials(
  companyId: string,
  credentials: {
    gaClientEmail?: string
    gaPrivateKey?: string
    githubToken?: string
  }
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("stats_api_credentials")
    .select("ga_client_email_encrypted, ga_private_key_encrypted, github_token_encrypted")
    .eq("company_id", companyId)
    .single()

  const existingRow = existing as StatsCredentialsRow | null
  const now = new Date().toISOString()

  let gaClientEmailEncrypted: string | null = null
  let gaPrivateKeyEncrypted: string | null = null
  let githubTokenEncrypted: string | null = null

  try {
    if (credentials.gaClientEmail !== undefined) {
      gaClientEmailEncrypted = credentials.gaClientEmail?.trim()
        ? encryptCredentials(credentials.gaClientEmail.trim())
        : null
    } else if (existingRow) {
      gaClientEmailEncrypted = existingRow.ga_client_email_encrypted
    }

    if (credentials.gaPrivateKey !== undefined) {
      gaPrivateKeyEncrypted = credentials.gaPrivateKey?.trim()
        ? encryptCredentials(credentials.gaPrivateKey.trim().replace(/\\n/g, "\n"))
        : null
    } else if (existingRow) {
      gaPrivateKeyEncrypted = existingRow.ga_private_key_encrypted
    }

    if (credentials.githubToken !== undefined) {
      githubTokenEncrypted = credentials.githubToken?.trim()
        ? encryptCredentials(credentials.githubToken.trim())
        : null
    } else if (existingRow) {
      githubTokenEncrypted = existingRow.github_token_encrypted
    }
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Encryption failed. Ensure ENCRYPTION_KEY is set.",
    }
  }

  const payload = {
    company_id: companyId,
    updated_at: now,
    ga_client_email_encrypted: gaClientEmailEncrypted,
    ga_private_key_encrypted: gaPrivateKeyEncrypted,
    github_token_encrypted: githubTokenEncrypted,
  }

  const { error } = await supabase
    .from("stats_api_credentials")
    .upsert(payload, { onConflict: "company_id" })

  if (error) return { error: error.message }
  return {}
}

export async function hasStatsCredentials(companyId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stats_api_credentials")
    .select("id")
    .eq("company_id", companyId)
    .single()
  return !error && !!data
}
