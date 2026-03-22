"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import {
  SiKotlin,
  SiSwift,
  SiXcode,
  SiAndroidstudio,
  SiNextdotjs,
  SiReact,
  SiShadcnui,
  SiTailwindcss,
  SiVscodium,
  SiWebstorm,
  SiArduino,
} from "@icons-pack/react-simple-icons"

const TAB_IDS = [
  "mobile",
  "web",
  "ides",
  "robotics",
] as const

const ICON_MAP = {
  kotlin: SiKotlin,
  swift: SiSwift,
  xcode: SiXcode,
  androidstudio: SiAndroidstudio,
  nextdotjs: SiNextdotjs,
  react: SiReact,
  shadcnui: SiShadcnui,
  tailwindcss: SiTailwindcss,
  vscodium: SiVscodium,
  webstorm: SiWebstorm,
  arduino: SiArduino,
} as const

const TAB_ITEMS: Record<(typeof TAB_IDS)[number], { iconSlug: keyof typeof ICON_MAP; titleKey: string; descKey: string }[]> = {
  mobile: [
    { iconSlug: "kotlin", titleKey: "kotlin", descKey: "kotlinDesc" },
    { iconSlug: "swift", titleKey: "swift", descKey: "swiftDesc" },
    { iconSlug: "swift", titleKey: "swiftui", descKey: "swiftuiDesc" },
    { iconSlug: "xcode", titleKey: "xcode", descKey: "xcodeDesc" },
    { iconSlug: "androidstudio", titleKey: "androidStudio", descKey: "androidStudioDesc" },
  ],
  web: [
    { iconSlug: "nextdotjs", titleKey: "nextjs", descKey: "nextjsDesc" },
    { iconSlug: "react", titleKey: "react", descKey: "reactDesc" },
    { iconSlug: "shadcnui", titleKey: "shadcnui", descKey: "shadcnuiDesc" },
    { iconSlug: "tailwindcss", titleKey: "tailwindcss", descKey: "tailwindcssDesc" },
  ],
  ides: [
    { iconSlug: "vscodium", titleKey: "vsCode", descKey: "vsCodeDesc" },
    { iconSlug: "webstorm", titleKey: "webstorm", descKey: "webstormDesc" },
  ],
  robotics: [
    { iconSlug: "arduino", titleKey: "arduino", descKey: "arduinoDesc" },
  ],
}

export default function IntegrationsSection() {
  const t = useTranslations("integrations")

  return (
    <section>
      <div className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              {t("heading")}
            </h2>
            <p className="mt-6 text-muted-foreground">{t("subcopy")}</p>
          </div>

          <Tabs defaultValue={TAB_IDS[0]} className="mt-12">
            <TabsList className="mb-8 grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="mobile">{t("tabMobile")}</TabsTrigger>
              <TabsTrigger value="web">{t("tabWeb")}</TabsTrigger>
              <TabsTrigger value="ides">{t("tabIDEs")}</TabsTrigger>
              <TabsTrigger value="robotics">{t("tabRobotics")}</TabsTrigger>
            </TabsList>

            {TAB_IDS.map((tabId) => (
              <TabsContent key={tabId} value={tabId}>
                <IntegrationsGrid tabId={tabId} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}

function IntegrationsGrid({ tabId }: { tabId: (typeof TAB_IDS)[number] }) {
  const t = useTranslations("integrations")
  const items = TAB_ITEMS[tabId]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ iconSlug, titleKey, descKey }) => {
        const Icon = ICON_MAP[iconSlug]
        return (
          <IntegrationCard
            key={titleKey}
            title={t(titleKey)}
            description={t(descKey)}
            learnMore={t("learnMore")}>
            <Icon size={40} color="currentColor" className="text-foreground" />
          </IntegrationCard>
        )
      })}
    </div>
  )
}

function IntegrationCard({
  title,
  description,
  learnMore,
  children,
  link = "#",
}: {
  title: string
  description: string
  learnMore: string
  children: React.ReactNode
  link?: string
}) {
  return (
    <Card className="p-6">
      <div className="relative">
        <div className="*:size-10">{children}</div>
        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-3 border-t border-dashed pt-6">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1 pr-2 shadow-none"
            render={<Link href={link} />}
            nativeButton={false}>
            {learnMore}
            <ChevronRight className="ml-0 !size-3.5 opacity-50" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
