'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Link } from '@/i18n/routing'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'

type FAQItem = {
    id: string
    icon: IconName
    questionKey: string
    answerKey: string
}

export default function FAQsThree() {
    const t = useTranslations('faqs')

    const faqItems: FAQItem[] = [
        { id: 'item-1', icon: 'clock', questionKey: 'q1', answerKey: 'a1' },
        { id: 'item-2', icon: 'credit-card', questionKey: 'q2', answerKey: 'a2' },
        { id: 'item-3', icon: 'truck', questionKey: 'q3', answerKey: 'a3' },
        { id: 'item-4', icon: 'globe', questionKey: 'q4', answerKey: 'a4' },
        { id: 'item-5', icon: 'package', questionKey: 'q5', answerKey: 'a5' },
    ]

    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">{t('title')}</h2>
                            <p className="text-muted-foreground mt-4">
                                {t('supportBlurb')}{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    {t('customerSupport')}
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{t(item.questionKey)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{t(item.answerKey)}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
