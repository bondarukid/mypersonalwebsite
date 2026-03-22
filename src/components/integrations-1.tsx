import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import * as React from 'react'
import { Gemini } from '@/components/ui/svgs/gemini'
import { Replit } from '@/components/ui/svgs/replit'
import { MagicUI } from '@/components/ui/svgs/magic-ui'
import { VSCodium } from '@/components/ui/svgs/vs-codium'
import { MediaWiki } from '@/components/ui/svgs/media-wiki'
import { GooglePaLM } from '@/components/ui/svgs/google-palm'

export default async function IntegrationsSection() {
    const t = await getTranslations('integrations')

    return (
        <section>
            <div className="py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center">
                        <h2 className="text-balance text-3xl font-semibold md:text-4xl">{t('heading')}</h2>
                        <p className="text-muted-foreground mt-6">{t('subcopy')}</p>
                    </div>

                    <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <IntegrationCard
                            title={t('googleGemini')}
                            description={t('integrationDesc')}
                            learnMore={t('learnMore')}>
                            <Gemini />
                        </IntegrationCard>

                        <IntegrationCard
                            title={t('replit')}
                            description={t('integrationDesc')}
                            learnMore={t('learnMore')}>
                            <Replit />
                        </IntegrationCard>

                        <IntegrationCard
                            title={t('magicUI')}
                            description={t('integrationDesc')}
                            learnMore={t('learnMore')}>
                            <MagicUI />
                        </IntegrationCard>

                        <IntegrationCard
                            title={t('vsCodium')}
                            description={t('integrationDesc')}
                            learnMore={t('learnMore')}>
                            <VSCodium />
                        </IntegrationCard>

                        <IntegrationCard
                            title={t('mediaWiki')}
                            description={t('integrationDesc')}
                            learnMore={t('learnMore')}>
                            <MediaWiki />
                        </IntegrationCard>

                        <IntegrationCard
                            title={t('googlePaLM')}
                            description={t('integrationDesc')}
                            learnMore={t('learnMore')}>
                            <GooglePaLM />
                        </IntegrationCard>
                    </div>
                </div>
            </div>
        </section>
    )
}

const IntegrationCard = ({ title, description, learnMore, children, link = 'https://github.com/meschacirung/cnblocks' }: { title: string; description: string; learnMore: string; children: React.ReactNode; link?: string }) => {
    return (
        <Card className="p-6">
            <div className="relative">
                <div className="*:size-10">{children}</div>

                <div className="space-y-2 py-6">
                    <h3 className="text-base font-medium">{title}</h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
                </div>

                <div className="flex gap-3 border-t border-dashed pt-6">
                    <Button variant="secondary" size="sm" className="gap-1 pr-2 shadow-none" render={<Link href={link} />} nativeButton={false}>{learnMore}
                                                <ChevronRight className="ml-0 !size-3.5 opacity-50" /></Button>
                </div>
            </div>
        </Card>
    )
}
