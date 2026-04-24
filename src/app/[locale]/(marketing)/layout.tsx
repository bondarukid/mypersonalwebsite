import { SiteHeader } from "@/components/header"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col pt-14">{children}</main>
    </>
  )
}
