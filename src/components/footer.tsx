"use client"

import { Logo } from "@/components/logo"
import { SOCIAL_PLATFORM_ICONS } from "@/components/social-platform-icons"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import type { SocialLink } from "@/lib/supabase/social-links"

const PLATFORM_ARIA_KEYS: Record<string, string> = {
  twitter: "ariaTwitter",
  linkedin: "ariaLinkedIn",
  facebook: "ariaFacebook",
  threads: "ariaThreads",
  instagram: "ariaInstagram",
  tiktok: "ariaTikTok",
}

type FooterSectionProps = {
  socialLinks?: SocialLink[]
}

export default function FooterSection({ socialLinks = [] }: FooterSectionProps) {
  const t = useTranslations("footer")

  const links = [
    {
      group: t("product"),
      items: [
        { title: t("features"), href: "#" },
        { title: t("solution"), href: "#" },
        { title: t("customers"), href: "#" },
        { title: t("pricing"), href: "#" },
        { title: t("help"), href: "#" },
        { title: t("about"), href: "/about" },
      ],
    },
    {
      group: t("solution"),
      items: [
        { title: t("startup"), href: "#" },
        { title: t("freelancers"), href: "#" },
        { title: t("organizations"), href: "#" },
        { title: t("students"), href: "#" },
        { title: t("collaboration"), href: "#" },
        { title: t("design"), href: "#" },
        { title: t("management"), href: "#" },
      ],
    },
    {
      group: t("company"),
      items: [
        { title: t("about"), href: "/about" },
        { title: t("careers"), href: "#" },
        { title: t("blog"), href: "#" },
        { title: t("press"), href: "#" },
        { title: t("contact"), href: "/contact" },
        { title: t("help"), href: "#" },
      ],
    },
    {
      group: t("legal"),
      items: [
        { title: t("licence"), href: "#" },
        { title: t("privacy"), href: "#" },
        { title: t("cookies"), href: "/cookies" },
        { title: t("security"), href: "#" },
      ],
    },
  ]

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              href="/"
              aria-label={t("ariaGoHome")}
              className="block size-fit"
            >
              <Logo />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-3">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 text-sm">
                <span className="block font-medium">{link.group}</span>
                {link.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="text-muted-foreground hover:text-primary block duration-150"
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
            {t("copyright", { year: 2026 })}
          </span>
          <div className="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last">
            {socialLinks.map((link) => {
              const ariaKey = PLATFORM_ARIA_KEYS[link.platform]
              const icon = SOCIAL_PLATFORM_ICONS[link.platform]
              if (!icon) return null
              return (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaKey ? t(ariaKey as "ariaTwitter") : link.platform}
                  className="text-muted-foreground hover:text-primary block"
                >
                  <svg
                    className="size-6"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    {icon}
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
