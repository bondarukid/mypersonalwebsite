/*
 * Copyright (C) 2026 Ivan Bondaruk (https://bondarukid.com)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CertificateGroup } from "@/lib/supabase/certificates"
import { AwardIcon, Loader2, PlusIcon } from "lucide-react"
import { routing } from "@/i18n/routing"
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/kibo-ui/dropzone"

function getCertificateImageUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  return `${base}/storage/v1/object/public/certificates/${imagePath}`
}

const LOCALES = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "uk", label: "Ukrainian", flag: "🇺🇦" },
  { id: "ja", label: "日本語", flag: "🇯🇵" },
] as const

interface CertificatesEditorProps {
  certificates: CertificateGroup[]
}

export function CertificatesEditor({ certificates }: CertificatesEditorProps) {
  const t = useTranslations("dashboard.certificatesPage")
  const router = useRouter()
  const params = useParams()
  const uiLocale = (params?.locale as string) ?? "en"
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createDate, setCreateDate] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editingGroup, setEditingGroup] = useState<CertificateGroup | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [createFile, setCreateFile] = useState<File | null>(null)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const createFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (editingGroup) setEditDate(editingGroup.date_obtained)
  }, [editingGroup])

  const injectFileIntoInput = useCallback(
    (form: HTMLFormElement | null, file: File | null) => {
      if (!form || !file) return
      const input = form.querySelector(
        'input[type="file"][name="image"]'
      ) as HTMLInputElement | null
      if (!input) return
      const dt = new DataTransfer()
      dt.items.add(file)
      input.files = dt.files
    },
    []
  )

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(",")[1]
        resolve(base64 ?? "")
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!createFile) {
      toast.error(t("imageRequired"))
      return
    }
    if (!createDate.trim()) {
      toast.error(t("invalidDate"))
      return
    }
    const form = e.currentTarget
    const name_en = (form.querySelector('[name="name_en"]') as HTMLInputElement)
      ?.value
    const description_en = (
      form.querySelector('[name="description_en"]') as HTMLTextAreaElement
    )?.value
    const date_obtained = createDate.trim()

    setSaving(true)
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        body: (() => {
          injectFileIntoInput(form, createFile)
          const formData = new FormData(form)
          return formData
        })(),
        credentials: "include",
      })
      const data = (await res.json()) as {
        error?: string
        success?: string
        code?: string
      }

      if (!res.ok) {
        console.error("[create cert] FormData response:", res.status, data)
        if (res.status === 400 && createFile) {
          const imageBase64 = await fileToBase64(createFile)
          const res2 = await fetch("/api/certificates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name_en,
              description_en: description_en ?? "",
              date_obtained,
              imageBase64,
              mimeType: createFile.type,
            }),
            credentials: "include",
          })
          const data2 = (await res2.json()) as { error?: string; success?: string }
          if (!res2.ok) {
            console.error("[create cert] Base64 retry response:", res2.status, data2)
            toast.error(data2.error ?? t("unexpectedError"))
            return
          }
          toast.success(t("created"))
          setIsCreateOpen(false)
          setCreateFile(null)
          setCreateDate("")
          form.reset()
          router.refresh()
          return
        }
        toast.error(data.error ?? t("unexpectedError"))
        return
      }

      toast.success(t("created"))
      setIsCreateOpen(false)
      setCreateFile(null)
      setCreateDate("")
      form.reset()
      router.refresh()
    } catch (err) {
      console.error("[create cert] Error:", err)
      toast.error(
        err instanceof Error ? err.message : t("unexpectedError")
      )
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!editingGroup) return
    e.preventDefault()
    const form = e.currentTarget
    if (editFile) injectFileIntoInput(form, editFile)
    const formData = new FormData(form)
    formData.set("image_path", editingGroup.image_path)
    setSaving(true)
    try {
      const res = await fetch("/api/certificates", {
        method: "PUT",
        body: formData,
        credentials: "include",
      })
      const data = (await res.json()) as { error?: string; success?: string }
      if (!res.ok) {
        toast.error(data.error ?? t("unexpectedError"))
      } else {
        toast.success(t("saved"))
        setEditingGroup(null)
        setEditFile(null)
        router.refresh()
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("unexpectedError")
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingGroup) return
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/certificates?image_path=${encodeURIComponent(editingGroup.image_path)}`,
        { method: "DELETE" }
      )
      const data = (await res.json()) as { error?: string; success?: string }
      if (!res.ok) {
        toast.error(data.error ?? t("unexpectedError"))
      } else {
        toast.success(t("deleted"))
        setEditingGroup(null)
        router.refresh()
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("unexpectedError")
      )
    } finally {
      setDeleting(false)
    }
  }

  const enCert = (g: CertificateGroup) => {
    return g.locales.find((c) => c.locale === "en") ?? g.locales[0]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon data-slot="icon" data-icon="inline-start" />
          {t("addCertificate")}
        </Button>
      </div>

      {certificates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AwardIcon className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-center text-muted-foreground">
              {t("noCertificates")}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setIsCreateOpen(true)}
            >
              {t("addCertificate")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {certificates.map((group) => (
            <button
              key={group.image_path}
              type="button"
              onClick={() => setEditingGroup(group)}
              className="flex flex-col items-stretch text-left rounded-lg border bg-card overflow-hidden hover:border-muted-foreground/30 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                  src={getCertificateImageUrl(group.image_path)}
                  alt={enCert(group).name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">
                  {enCert(group).name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {group.date_obtained}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (open) setCreateDate("")
          if (!open) setCreateFile(null)
          setIsCreateOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("addCertificate")}</DialogTitle>
          </DialogHeader>
          <form ref={createFormRef} onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name-en">{t("name")}</Label>
                <Input
                  id="create-name-en"
                  name="name_en"
                  placeholder={t("namePlaceholder")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-desc-en">{t("description")}</Label>
                <Textarea
                  id="create-desc-en"
                  name="description_en"
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                />
              </div>
            </div>
            <div>
              <input type="hidden" name="date_obtained" value={createDate} />
              <Label htmlFor="create-date">{t("dateObtained")}</Label>
              <DatePicker
                id="create-date"
                value={createDate}
                onValueChange={setCreateDate}
                locale={uiLocale}
                placeholder={t("dateObtained")}
                aria-label={t("dateObtained")}
              />
            </div>
            <div>
              <Label>{t("uploadImage")}</Label>
              <Dropzone
                accept={{ "image/jpeg": [], "image/png": [], "image/webp": [] }}
                maxFiles={1}
                maxSize={5 * 1024 * 1024}
                minSize={1024}
                inputName="image"
                src={createFile ? [createFile] : undefined}
                onDrop={(acceptedFiles) => {
                  const file = acceptedFiles[0] ?? null
                  setCreateFile(file)
                  injectFileIntoInput(createFormRef.current, file)
                }}
                className="mt-2"
              >
                <DropzoneEmptyState />
                <DropzoneContent>
                  {createFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative aspect-[4/3] w-24 overflow-hidden rounded border bg-muted">
                        <Image
                          src={URL.createObjectURL(createFile)}
                          alt={createFile.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium truncate max-w-full">
                        {createFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("dragToReplace")}
                      </p>
                    </div>
                  ) : null}
                </DropzoneContent>
              </Dropzone>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setEditingGroup(null)
            setEditFile(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("editCertificate")}</DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {LOCALES.filter((l) =>
                    routing.locales.includes(l.id)
                  ).map((locale) => (
                    <TabsTrigger key={locale.id} value={locale.id}>
                      {locale.flag} {locale.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LOCALES.filter((l) => routing.locales.includes(l.id)).map(
                  (locale) => {
                    const cert =
                      editingGroup.locales.find((c) => c.locale === locale.id) ??
                      editingGroup.locales[0]
                    return (
                      <TabsContent key={locale.id} value={locale.id}>
                        <div className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor={`edit-name-${locale.id}`}>
                              {t("name")}
                            </Label>
                            <Input
                              id={`edit-name-${locale.id}`}
                              name={`name_${locale.id}`}
                              defaultValue={cert.name}
                              required={locale.id === "en"}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-desc-${locale.id}`}>
                              {t("description")}
                            </Label>
                            <Textarea
                              id={`edit-desc-${locale.id}`}
                              name={`description_${locale.id}`}
                              defaultValue={cert.description ?? ""}
                              rows={3}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    )
                  }
                )}
              </Tabs>
              <div>
                <input type="hidden" name="date_obtained" value={editDate} />
                <Label htmlFor="edit-date">{t("dateObtained")}</Label>
                <DatePicker
                  id="edit-date"
                  value={editDate}
                  onValueChange={setEditDate}
                  locale={uiLocale}
                  placeholder={t("dateObtained")}
                  aria-label={t("dateObtained")}
                />
              </div>
              <div>
                <Label>{t("uploadImage")}</Label>
                <Dropzone
                  accept={{ "image/jpeg": [], "image/png": [], "image/webp": [] }}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024}
                  minSize={1024}
                  inputName="image"
                  src={editFile ? [editFile] : undefined}
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles[0] ?? null
                    setEditFile(file)
                  }}
                  className="mt-2"
                >
                  <DropzoneEmptyState>
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative aspect-[4/3] w-24 overflow-hidden rounded border bg-muted">
                        <Image
                          src={getCertificateImageUrl(
                            editingGroup.image_path
                          )}
                          alt={enCert(editingGroup).name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("uploadImageHint")}
                      </p>
                    </div>
                  </DropzoneEmptyState>
                  <DropzoneContent>
                    {editFile && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative aspect-[4/3] w-24 overflow-hidden rounded border bg-muted">
                          <Image
                            src={URL.createObjectURL(editFile)}
                            alt={editFile.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium truncate max-w-full">
                          {editFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("dragToReplace")}
                        </p>
                      </div>
                    )}
                  </DropzoneContent>
                </Dropzone>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="size-4 animate-spin" />}
                  {t("delete")}
                </Button>
                <div className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingGroup(null)}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {t("save")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
