"use client"

/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Link2, Trash2, StickyNote, FileIcon, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { AboutTimelineAttachmentRow } from "@/lib/about-timeline-types"
import {
  createAttachmentAction,
  createAttachmentWithUploadAction,
  deleteAttachmentAction,
} from "./actions"

function kindLabel(kind: string): string {
  switch (kind) {
    case "link":
      return "link"
    case "image":
      return "image"
    case "file":
      return "file"
    case "note":
      return "note"
    default:
      return kind
  }
}

const KIND_ICON = {
  link: Link2,
  image: ImageIcon,
  file: FileIcon,
  note: StickyNote,
} as const

type Props = {
  t: (key: string) => string
  milestoneId?: string
  depthEventId?: string
  items: AboutTimelineAttachmentRow[]
}

export function TimelineAttachmentsBlock({
  t,
  milestoneId,
  depthEventId,
  items,
}: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteBody, setNoteBody] = useState("")

  if (!milestoneId && !depthEventId) return null

  const onDelete = async (id: string) => {
    setBusy(true)
    const r = await deleteAttachmentAction(id)
    setBusy(false)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("attachmentDeleted"))
      router.refresh()
    }
  }

  const onAddLink = async () => {
    if (!linkUrl.trim()) {
      toast.error(t("urlRequired"))
      return
    }
    setBusy(true)
    const r = await createAttachmentAction({
      milestoneId,
      depthEventId,
      kind: "link",
      url: linkUrl.trim(),
      title: linkTitle.trim() || undefined,
    })
    setBusy(false)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("attachmentAdded"))
      setLinkUrl("")
      setLinkTitle("")
      router.refresh()
    }
  }

  const onAddNote = async () => {
    if (!noteBody.trim()) {
      toast.error(t("noteTextRequired"))
      return
    }
    setBusy(true)
    const r = await createAttachmentAction({
      milestoneId,
      depthEventId,
      kind: "note",
      body: noteBody.trim(),
      title: noteTitle.trim() || undefined,
    })
    setBusy(false)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("attachmentAdded"))
      setNoteTitle("")
      setNoteBody("")
      router.refresh()
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      <p className="text-sm font-medium">{t("attachmentsTitle")}</p>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("attachmentsEmpty")}</p>
        ) : null}
        {items.map((a) => {
          const Ico = KIND_ICON[a.kind] ?? FileIcon
          return (
            <li
              key={a.id}
              className="flex items-start justify-between gap-2 rounded-md border border-border/80 bg-muted/20 px-2 py-1.5 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Ico className="size-3.5 shrink-0 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {kindLabel(a.kind)}
                  </Badge>
                  {a.title ? <span className="truncate font-medium">{a.title}</span> : null}
                </div>
                {a.body ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {a.body}
                  </p>
                ) : null}
                {a.url ? (
                  <p className="mt-0.5 truncate text-xs text-primary">{a.url}</p>
                ) : a.storage_path ? (
                  <p className="mt-0.5 truncate text-xs text-primary">{a.storage_path}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => onDelete(a.id)}
                disabled={busy}
                aria-label={t("removeAttachment")}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          )
        })}
      </ul>
      <div className="grid gap-2 rounded-md border border-dashed p-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{t("addLink")}</Label>
          <Input
            placeholder="https://…"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={busy}
          />
          <Input
            placeholder={t("linkTitleOptional")}
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onAddLink}
            disabled={busy}
          >
            {t("saveLink")}
          </Button>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t("addNote")}</Label>
          <Input
            placeholder={t("linkTitleOptional")}
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            disabled={busy}
          />
          <Textarea
            rows={2}
            placeholder={t("noteBodyPlaceholder")}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            disabled={busy}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onAddNote}
            disabled={busy}
          >
            {t("saveNote")}
          </Button>
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">
        {t("uploadFileOrImage")}
      </p>
      <form
        className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const fd = new FormData(form)
          if (milestoneId) fd.set("milestoneId", milestoneId)
          if (depthEventId) fd.set("depthEventId", depthEventId)
          fd.set("kind", "image")
          setBusy(true)
          const r = await createAttachmentWithUploadAction(fd)
          setBusy(false)
          if (r.error) toast.error(r.error)
          else {
            toast.success(t("attachmentAdded"))
            form.reset()
            router.refresh()
          }
        }}
      >
        {milestoneId ? (
          <input type="hidden" name="milestoneId" value={milestoneId} />
        ) : null}
        {depthEventId ? (
          <input type="hidden" name="depthEventId" value={depthEventId} />
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-xs">{t("image")}</Label>
          <input
            className="block w-full text-xs file:me-2 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1"
            name="file"
            type="file"
            required
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          <input type="hidden" name="kind" value="image" />
          <Input
            name="title"
            placeholder={t("linkTitleOptional")}
            className="text-sm"
          />
        </div>
        <Button type="submit" size="sm" disabled={busy}>
          {t("uploadImage")}
        </Button>
      </form>
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const fd = new FormData(form)
          if (milestoneId) fd.set("milestoneId", milestoneId)
          if (depthEventId) fd.set("depthEventId", depthEventId)
          fd.set("kind", "file")
          setBusy(true)
          const r = await createAttachmentWithUploadAction(fd)
          setBusy(false)
          if (r.error) toast.error(r.error)
          else {
            toast.success(t("attachmentAdded"))
            form.reset()
            router.refresh()
          }
        }}
      >
        {milestoneId ? (
          <input type="hidden" name="milestoneId" value={milestoneId} />
        ) : null}
        {depthEventId ? (
          <input type="hidden" name="depthEventId" value={depthEventId} />
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-xs">{t("file")}</Label>
          <input
            className="block w-full text-xs file:me-2 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1"
            name="file"
            type="file"
            required
            accept="application/pdf,.zip,.md,text/plain"
          />
          <input type="hidden" name="kind" value="file" />
          <Input
            name="title"
            placeholder={t("linkTitleOptional")}
            className="text-sm"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" disabled={busy}>
          {t("uploadFile")}
        </Button>
      </form>
    </div>
  )
}
