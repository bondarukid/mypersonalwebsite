import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SignUpForm } from "./sign-up-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("signUp")
  return {
    title: t("title"),
    description: t("subtitle"),
    robots: { index: false, follow: false },
  }
}

export default function SignUpPage() {
  return <SignUpForm />
}
