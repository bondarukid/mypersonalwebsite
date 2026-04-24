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
import { PlusIcon, Trash2Icon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AboutTimelineSkillRow, AboutTimelineTagRow } from "@/lib/about-timeline-types"
import {
  createSkillAction,
  createTagAction,
  deleteSkillAction,
  deleteTagAction,
  updateSkillAction,
  updateTagAction,
} from "./actions"

type TFn = (key: string) => string

type Props = {
  skills: AboutTimelineSkillRow[]
  tags: AboutTimelineTagRow[]
  t: TFn
}

export function TimelineSkillsTagsCatalog({ skills, tags, t }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [newSkillEn, setNewSkillEn] = useState("")
  const [newTagEn, setNewTagEn] = useState("")

  const saveSkill = async (id: string, patch: { en?: string; uk?: string; ja?: string }) => {
    setBusy(true)
    const r = await updateSkillAction(id, {
      label_en: patch.en,
      label_uk: patch.uk,
      label_ja: patch.ja,
    })
    setBusy(false)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  const saveTagEnOnly = async (id: string, labelEn: string) => {
    setBusy(true)
    const r = await updateTagAction(id, {
      label_en: labelEn,
      label_uk: "",
      label_ja: "",
    })
    setBusy(false)
    if (r.error) toast.error(r.error)
    else {
      toast.success(t("saved"))
      router.refresh()
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("skillsLibrary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {skills.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("skillsEmpty")}</p>
          ) : null}
          <ul className="space-y-3">
            {skills.map((s) => (
              <li
                key={s.id}
                className="space-y-2 rounded-md border border-border/60 p-2"
              >
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">{t("labelEn")}</Label>
                    <Input
                      key={`${s.id}-en-${s.label_en}`}
                      className="text-sm"
                      defaultValue={s.label_en}
                      disabled={busy}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v !== s.label_en) {
                          void saveSkill(s.id, { en: v })
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("labelUk")}</Label>
                    <Input
                      key={`${s.id}-uk-${s.label_uk}`}
                      className="text-sm"
                      defaultValue={s.label_uk}
                      disabled={busy}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v !== s.label_uk) {
                          void saveSkill(s.id, { uk: v })
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t("labelJa")}</Label>
                    <Input
                      key={`${s.id}-ja-${s.label_ja}`}
                      className="text-sm"
                      defaultValue={s.label_ja}
                      disabled={busy}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v !== s.label_ja) {
                          void saveSkill(s.id, { ja: v })
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={async () => {
                      setBusy(true)
                      const r = await deleteSkillAction(s.id)
                      setBusy(false)
                      if (r.error) toast.error(r.error)
                      else {
                        toast.success(t("skillDeleted"))
                        router.refresh()
                      }
                    }}
                    disabled={busy}
                    aria-label={t("deleteSkill")}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Input
              className="min-w-0 flex-1"
              placeholder={t("newSkillPlaceholder")}
              value={newSkillEn}
              onChange={(e) => setNewSkillEn(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={busy || !newSkillEn.trim()}
              onClick={async () => {
                setBusy(true)
                const r = await createSkillAction({
                  label_en: newSkillEn.trim(),
                  label_uk: "",
                  label_ja: "",
                })
                setBusy(false)
                if (r.error) toast.error(r.error)
                else {
                  toast.success(t("skillCreated"))
                  setNewSkillEn("")
                  router.refresh()
                }
              }}
            >
              <PlusIcon className="mr-1 size-3.5" />
              {t("addSkill")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("tagsLibrary")}</CardTitle>
          <CardDescription className="text-xs">
            {t("tagsLibraryEnOnly")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tags.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("tagsEmpty")}</p>
          ) : null}
          <ul className="space-y-2">
            {tags.map((g) => (
              <li
                key={g.id}
                className="flex items-end gap-2 rounded-md border border-border/60 p-2"
              >
                <div className="min-w-0 flex-1">
                  <Label className="text-xs">{t("tagNameEn")}</Label>
                  <Input
                    key={`${g.id}-${g.label_en}`}
                    className="text-sm"
                    defaultValue={g.label_en}
                    disabled={busy}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && v !== g.label_en) {
                        void saveTagEnOnly(g.id, v)
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={async () => {
                    setBusy(true)
                    const r = await deleteTagAction(g.id)
                    setBusy(false)
                    if (r.error) toast.error(r.error)
                    else {
                      toast.success(t("tagDeleted"))
                      router.refresh()
                    }
                  }}
                  disabled={busy}
                  aria-label={t("deleteTag")}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-0 flex-1"
              placeholder={t("newTagPlaceholder")}
              value={newTagEn}
              onChange={(e) => setNewTagEn(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              disabled={busy || !newTagEn.trim()}
              onClick={async () => {
                setBusy(true)
                const r = await createTagAction({
                  label_en: newTagEn.trim(),
                  label_uk: "",
                  label_ja: "",
                })
                setBusy(false)
                if (r.error) toast.error(r.error)
                else {
                  toast.success(t("tagCreated"))
                  setNewTagEn("")
                  router.refresh()
                }
              }}
            >
              <PlusIcon className="mr-1 size-3.5" />
              {t("addTag")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
