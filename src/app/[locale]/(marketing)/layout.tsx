import { SiteHeader } from "@/components/header"
import { getGithubRepo } from "@/config/site"
import { getRepoInfo } from "@/lib/github/repo-info"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const slug = getGithubRepo()
  let repoInfo = null
  if (slug) {
    const [owner, repo] = slug.split("/")
    if (owner && repo) {
      repoInfo = await getRepoInfo(owner, repo)
      if (!repoInfo) {
        repoInfo = {
          url: `https://github.com/${slug}`,
          fullName: slug,
          stars: 0,
          forks: 0,
        }
      }
    }
  }

  return (
    <>
      <SiteHeader repoInfo={repoInfo} />
      <main className="flex flex-1 flex-col pt-14">{children}</main>
    </>
  )
}
