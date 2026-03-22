import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function Features() {
    const t = await getTranslations('features')

    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">{t('heading')}</h2>
                    <p>{t('intro')}</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">{t('fast')}</h3>
                        </div>
                        <p className="text-sm">{t('fastDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">{t('powerful')}</h3>
                        </div>
                        <p className="text-sm">{t('powerfulDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />
                            <h3 className="text-sm font-medium">{t('security')}</h3>
                        </div>
                        <p className="text-sm">{t('securityDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />
                            <h3 className="text-sm font-medium">{t('customization')}</h3>
                        </div>
                        <p className="text-sm">{t('customizationDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />
                            <h3 className="text-sm font-medium">{t('control')}</h3>
                        </div>
                        <p className="text-sm">{t('controlDesc')}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">{t('builtForAi')}</h3>
                        </div>
                        <p className="text-sm">{t('builtForAiDesc')}</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
