"use client"

import { useActionState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { updateSocialLinkAction } from "./actions"
import { socialLinksColumns } from "./social-links-columns"
import type { SocialLink } from "@/lib/supabase/social-links"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SocialLinksDataTableProps {
  data: SocialLink[]
}

export function SocialLinksDataTable({ data }: SocialLinksDataTableProps) {
  const t = useTranslations("dashboard.socialPage")
  const [state, formAction, isPending] = useActionState(
    updateSocialLinkAction,
    null
  )

  const table = useReactTable({
    data,
    columns: socialLinksColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          role="status"
          className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
        >
          {state.success}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="w-0 p-0">
                    <input
                      type="hidden"
                      name="linkId"
                      value={row.original.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={socialLinksColumns.length}
                  className="h-24 text-center"
                >
                  No social links configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? t("saving") : t("save")}
      </Button>
    </form>
  )
}
