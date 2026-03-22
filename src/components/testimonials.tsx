import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTranslations } from 'next-intl/server'

export default async function TestimonialsSection() {
    const t = await getTranslations('testimonials')

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <blockquote>
                        <p className="text-lg font-medium sm:text-xl md:text-3xl">{t('quote')}</p>

                        <div className="mt-12 flex items-center justify-center gap-6">
                            <Avatar className="size-12">
                                <AvatarImage
                                    src="https://tailus.io/images/reviews/shekinah.webp"
                                    alt={t('avatarAlt')}
                                    height="400"
                                    width="400"
                                    loading="lazy"
                                />
                                <AvatarFallback>AM</AvatarFallback>
                            </Avatar>

                            <div className="space-y-1 border-l pl-6">
                                <cite className="font-medium">{t('author')}</cite>
                                <span className="text-muted-foreground block text-sm">{t('role')}</span>
                            </div>
                        </div>
                    </blockquote>
                </div>
            </div>
        </section>
    )
}
