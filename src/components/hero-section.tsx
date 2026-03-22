import React from 'react'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { getHeroImageSrc } from '@/config/site'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { VercelFull } from '@/components/ui/svgs/vercel'
import { SupabaseFull } from '@/components/ui/svgs/supabase'
import { FirebaseFull } from '@/components/ui/svgs/firebase'
import { Claude } from '@/components/ui/svgs/claude'
import { Figma } from '@/components/ui/svgs/figma'

export default async function HeroSection() {
    const t = await getTranslations('hero')

    return (
        <div className="@container overflow-x-hidden">
                <section>
                    <div className="pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
                        <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
                            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">{t('name')}</h1>
                                <p className="mt-8 max-w-2xl text-pretty text-lg">{t('tagline')}</p>

                                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                                    <Button size="lg" className="px-5 text-base" render={<Link href="#" />} nativeButton={false}><span className="text-nowrap">{t('ctaStart')}</span></Button>
                                    <Button key={2} size="lg" variant="ghost" className="px-5 text-base" render={<Link href="#" />} nativeButton={false}><span className="text-nowrap">{t('ctaDemo')}</span></Button>
                                </div>
                            </div>
                            <div className="lg:w-166 @max-lg:-translate-x-20 not-dark:invert mask-radial-from-35% mask-radial-to-70% max-lg:size-120 max-lg:order-first max-lg:mx-auto max-lg:-mb-20 lg:absolute lg:inset-0 lg:-inset-y-56 lg:ml-auto lg:translate-x-28">
                                <div className="z-1 absolute inset-0 bg-zinc-950 opacity-80 mix-blend-overlay" />
                                <Image
                                    className="size-full object-cover object-right"
                                    src={getHeroImageSrc()}
                                    alt={t('imageAlt')}
                                    height={2000}
                                    width={1500}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="bg-background border-t pb-16 pt-4 md:pb-32">
                    <div className="group relative m-auto max-w-6xl px-6">
                        <div className="flex flex-col items-center md:flex-row">
                            <div className="md:max-w-44 md:border-r md:pr-6">
                                <p className="text-end text-sm">{t('poweringTeams')}</p>
                            </div>
                            <div className="**:fill-foreground relative py-6 md:w-[calc(100%-11rem)]">
                                <InfiniteSlider
                                    speedOnHover={20}
                                    speed={40}
                                    gap={112}>
                                    <VercelFull
                                        height={22}
                                        width={84}
                                    />
                                    <SupabaseFull className="h-6" />
                                    <FirebaseFull
                                        height={24}
                                        width={80}
                                    />
                                    <Claude
                                        height={26}
                                        width={90}
                                    />
                                    <Figma
                                        height={24}
                                        width={24}
                                    />
                                </InfiniteSlider>

                                <div
                                    aria-hidden
                                    className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"
                                />
                                <div
                                    aria-hidden
                                    className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"
                                />
                                <ProgressiveBlur
                                    className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                    direction="left"
                                    blurIntensity={1}
                                />
                                <ProgressiveBlur
                                    className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                    direction="right"
                                    blurIntensity={1}
                                />
                            </div>
                        </div>
                    </div>
                </section>
        </div>
    )
}
