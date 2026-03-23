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

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import {
  createCertificate,
  updateCertificateGroupByImagePath,
  deleteCertificatesByImagePath,
  updateCertificateImagePath,
} from "@/lib/supabase/certificates"
import {
  uploadCertificateImage,
  uploadCertificateImageFromBuffer,
  deleteCertificateImage,
} from "@/lib/supabase/certificate-storage"
import { routing } from "@/i18n/routing"

const createSchema = z.object({
  name_en: z.string().min(1, "Name (EN) is required"),
  name_uk: z.string(),
  name_ja: z.string(),
  description_en: z.string(),
  description_uk: z.string(),
  description_ja: z.string(),
  date_obtained: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
})

function revalidatePaths() {
  revalidatePath("/dashboard/certificates")
  revalidatePath("/professional")
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`)
    revalidatePath(`/${locale}/professional`)
    revalidatePath(`/${locale}/dashboard/certificates`)
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return handlePostJson(request)
  }

  const formData = await request.formData()
  const file = formData.get("image") as File | null

  console.log("[certificates] POST FormData received", {
    hasFile: !!file,
    isFile: file instanceof File,
    fileSize: file instanceof File ? file.size : null,
    name_en: formData.get("name_en"),
    date_obtained: formData.get("date_obtained"),
  })

  if (!file || !(file instanceof File) || file.size === 0) {
    console.error("[certificates] 400: Image required", {
      hasFile: !!file,
      isFile: file instanceof File,
      size: file instanceof File ? file.size : null,
    })
    return NextResponse.json(
      {
        error: "Image is required",
        code: "IMAGE_REQUIRED",
        details: { hasFile: !!file },
      },
      { status: 400 }
    )
  }

  const parsed = createSchema.safeParse({
    name_en: formData.get("name_en") ?? "",
    name_uk: formData.get("name_uk") ?? "",
    name_ja: formData.get("name_ja") ?? "",
    description_en: formData.get("description_en") ?? "",
    description_uk: formData.get("description_uk") ?? "",
    description_ja: formData.get("description_ja") ?? "",
    date_obtained: formData.get("date_obtained") ?? "",
  })

  if (!parsed.success) {
    console.error("[certificates] 400: Validation failed", parsed.error.issues)
    const first = parsed.error.issues[0]
    return NextResponse.json(
      {
        error: first?.message ?? "Invalid data",
        code: "VALIDATION_ERROR",
        details: parsed.error.issues,
      },
      { status: 400 }
    )
  }

  const baseFilename = parsed.data.name_en
  const { path, error: uploadError } = await uploadCertificateImage(
    file,
    baseFilename
  )

  if (uploadError) {
    console.error("[certificates] 400: Upload failed", uploadError)
    return NextResponse.json(
      { error: uploadError, code: "UPLOAD_ERROR", details: { uploadError } },
      { status: 400 }
    )
  }

  const { error } = await createCertificate({
    image_path: path,
    date_obtained: parsed.data.date_obtained,
    name_en: parsed.data.name_en,
    name_uk: parsed.data.name_uk || parsed.data.name_en,
    name_ja: parsed.data.name_ja || parsed.data.name_en,
    description_en: parsed.data.description_en,
    description_uk: parsed.data.description_uk,
    description_ja: parsed.data.description_ja,
  })

  if (error) {
    await deleteCertificateImage(path)
    return NextResponse.json({ error }, { status: 500 })
  }

  revalidatePaths()
  return NextResponse.json({ success: "Certificate created" })
}

async function handlePostJson(request: Request) {
  let body: {
    name_en?: string
    description_en?: string
    date_obtained?: string
    imageBase64?: string
    mimeType?: string
  }
  try {
    body = await request.json()
  } catch {
    console.error("[certificates] 400: Invalid JSON body")
    return NextResponse.json(
      { error: "Invalid JSON", code: "INVALID_JSON", details: {} },
      { status: 400 }
    )
  }

  console.log("[certificates] POST JSON received", {
    hasImageBase64: !!body.imageBase64,
    imageBase64Length: body.imageBase64?.length ?? 0,
    name_en: body.name_en,
    date_obtained: body.date_obtained,
  })

  const { name_en, description_en, date_obtained, imageBase64, mimeType } =
    body

  if (!imageBase64) {
    console.error("[certificates] 400: imageBase64 required")
    return NextResponse.json(
      {
        error: "Image is required",
        code: "IMAGE_REQUIRED",
        details: {},
      },
      { status: 400 }
    )
  }

  const parsed = createSchema.safeParse({
    name_en: name_en ?? "",
    name_uk: "",
    name_ja: "",
    description_en: description_en ?? "",
    description_uk: "",
    description_ja: "",
    date_obtained: date_obtained ?? "",
  })

  if (!parsed.success) {
    console.error("[certificates] 400: Validation failed (JSON)", parsed.error.issues)
    const first = parsed.error.issues[0]
    return NextResponse.json(
      {
        error: first?.message ?? "Invalid data",
        code: "VALIDATION_ERROR",
        details: parsed.error.issues,
      },
      { status: 400 }
    )
  }

  const baseFilename = parsed.data.name_en
  const { path, error: uploadError } = await uploadCertificateImageFromBuffer(
    Buffer.from(imageBase64, "base64"),
    baseFilename,
    mimeType ?? "image/jpeg"
  )

  if (uploadError) {
    console.error("[certificates] 400: Upload failed (base64)", uploadError)
    return NextResponse.json(
      { error: uploadError, code: "UPLOAD_ERROR", details: {} },
      { status: 400 }
    )
  }

  const { error } = await createCertificate({
    image_path: path,
    date_obtained: parsed.data.date_obtained,
    name_en: parsed.data.name_en,
    name_uk: parsed.data.name_uk || parsed.data.name_en,
    name_ja: parsed.data.name_ja || parsed.data.name_en,
    description_en: parsed.data.description_en,
    description_uk: parsed.data.description_uk,
    description_ja: parsed.data.description_ja,
  })

  if (error) {
    await deleteCertificateImage(path)
    return NextResponse.json({ error }, { status: 500 })
  }

  revalidatePaths()
  return NextResponse.json({ success: "Certificate created" })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const imagePath = formData.get("image_path") as string

  if (!imagePath) {
    return NextResponse.json(
      { error: "Image path is required" },
      { status: 400 }
    )
  }

  const file = formData.get("image") as File | null
  let finalPath = imagePath

  if (file && file instanceof File && file.size > 0) {
    const baseFilename =
      (formData.get("name_en") as string) || "certificate"
    const { path, error: uploadError } = await uploadCertificateImage(
      file,
      baseFilename
    )
    if (uploadError) {
      return NextResponse.json({ error: uploadError }, { status: 400 })
    }
    finalPath = path

    const { error: pathError } = await updateCertificateImagePath(
      imagePath,
      path
    )
    if (pathError) {
      await deleteCertificateImage(path)
      return NextResponse.json({ error: pathError }, { status: 500 })
    }
    await deleteCertificateImage(imagePath)
  }

  const dateObtained = formData.get("date_obtained") as string
  if (!dateObtained || !/^\d{4}-\d{2}-\d{2}$/.test(dateObtained)) {
    return NextResponse.json(
      { error: "Invalid date format" },
      { status: 400 }
    )
  }

  const { error } = await updateCertificateGroupByImagePath(finalPath, {
    date_obtained: dateObtained,
    name_en: (formData.get("name_en") as string) || "",
    name_uk: (formData.get("name_uk") as string) || "",
    name_ja: (formData.get("name_ja") as string) || "",
    description_en: (formData.get("description_en") as string) ?? "",
    description_uk: (formData.get("description_uk") as string) ?? "",
    description_ja: (formData.get("description_ja") as string) ?? "",
  })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  revalidatePaths()
  return NextResponse.json({ success: "Certificate saved" })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const imagePath = searchParams.get("image_path")

  if (!imagePath) {
    return NextResponse.json(
      { error: "Image path is required" },
      { status: 400 }
    )
  }

  const { error } = await deleteCertificatesByImagePath(imagePath)
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  await deleteCertificateImage(imagePath)
  revalidatePaths()
  return NextResponse.json({ success: "Certificate deleted" })
}
