import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="flex-1 min-h-[200px]" />
    </div>
  )
}
