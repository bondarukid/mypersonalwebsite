import { getTranslations } from "next-intl/server"
import { getAllSocialLinksForAdmin } from "@/lib/supabase/social-links"
import { SocialLinksDataTable } from "./social-links-data-table"

export default async function SocialPage() {
  const t = await getTranslations("dashboard.socialPage")
  const links = await getAllSocialLinksForAdmin()

  return (
    <div className="flex flex-col gap-6 py-4 px-4 md:py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>
      <SocialLinksDataTable data={links} />
    </div>
  )
}
