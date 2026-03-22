"use client"

import { useActionState } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { signUpAction } from "./actions"
import { LogoIcon } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
  const t = useTranslations("signUp")

  const [state, formAction, isPending] = useActionState(signUpAction, null)

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        action={formAction}
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">{t("title")}</h1>
            <p className="text-sm">{t("subtitle")}</p>
          </div>

          <div className="mt-6 space-y-6">
            {(state?.error || state?.success) && (
              <div
                role="alert"
                className={`rounded-md px-3 py-2 text-sm ${
                  state.success
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {state.success ?? state.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="block text-sm">
                  {t("firstname")}
                </Label>
                <Input
                  type="text"
                  name="firstname"
                  id="firstname"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="block text-sm">
                  {t("lastname")}
                </Label>
                <Input
                  type="text"
                  name="lastname"
                  id="lastname"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                {t("email")}
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                {t("password")}
              </Label>
              <Input
                type="password"
                required
                name="password"
                id="password"
                className="input sz-md variant-mixed"
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("createAccount") + "…" : t("createAccount")}
            </Button>
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              {t("orContinueWith")}
            </span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                />
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                />
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                />
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                />
              </svg>
              <span>{t("google")}</span>
            </Button>
            <Button type="button" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 256 256"
              >
                <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z" />
                <path fill="#80cc28" d="M256 121.666H134.335V0H256z" />
                <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z" />
                <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z" />
              </svg>
              <span>{t("microsoft")}</span>
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            {t("hasAccount")}{" "}
            <Button
              variant="link"
              className="px-2"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              {t("signIn")}
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}
