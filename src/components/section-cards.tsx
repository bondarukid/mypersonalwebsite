"use client"

import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SectionCards() {
  const t = useTranslations("dashboard")

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("totalRevenue")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("trendingUp")}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("visitors6Months")}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("newCustomers")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon
              />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("down20")}{" "}
            <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {t("acquisitionNeedsAttention")}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("activeAccounts")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("strongRetention")}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{t("engagementExceedTargets")}</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("growthRate")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon
              />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {t("steadyPerformance")}{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{t("meetsGrowthProjections")}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
