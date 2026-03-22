import { redirect } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "./onboarding-form"
import { getTranslations } from "next-intl/server"
import { LogoIcon } from "@/components/logo"
import { Link } from "@/i18n/routing"

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: "/login", locale })
    return null
  }

  const metadata = user.user_metadata ?? {}
  const firstName = metadata.first_name ?? ""
  const lastName = metadata.last_name ?? ""

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single()

  if (profile?.display_name?.trim()) {
    redirect({ href: "/dashboard", locale })
  }

  const initialDisplayName =
    profile?.display_name?.trim() ||
    `${firstName} ${lastName}`.trim() ||
    ""

  const t = await getTranslations("onboarding")

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="m-auto w-full max-w-sm">
        <div className="bg-muted overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
            <div className="text-center">
              <Link href="/" aria-label="go home" className="mx-auto block w-fit">
                <LogoIcon />
              </Link>
              <h1 className="mb-1 mt-4 text-xl font-semibold">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
            <OnboardingForm initialDisplayName={initialDisplayName} />
          </div>
        </div>
      </div>
    </section>
  )
}
