"use server"

import { createClient } from "@/lib/supabase/server"

export type Testimonial = {
  id: string
  locale: string
  quote: string
  author: string
  role: string
  avatar_url: string | null
  sort_order: number
  created_at: string
}

export async function getTestimonial(
  locale: string
): Promise<Testimonial | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, locale, quote, author, role, avatar_url, sort_order, created_at")
    .eq("locale", locale)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as Testimonial | null
}
