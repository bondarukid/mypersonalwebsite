import { createClient } from "./server"

export type Profile = {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function getProfileByUserId(
  userId: string
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error || !data) return null
  return data as Profile
}

export async function upsertProfile(
  userId: string,
  displayName: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        display_name: displayName.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

  if (error) return { error: error.message }
  return {}
}
