'use client'

import { Link } from '@/i18n/routing'
import { Logo } from '@/components/logo'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { RepoInfoBlock } from '@/components/repo-info-block'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { RepoInfo } from '@/lib/github/repo-info'

export const SiteHeader = ({ repoInfo }: { repoInfo?: RepoInfo | null }) => {
    const [menuState, setMenuState] = React.useState(false)
    const t = useTranslations('header')
    const tCommon = useTranslations('common')

    const menuItems = [
        { name: tCommon('home'), href: '/' },
        { name: tCommon('about'), href: '/about' },
        { name: tCommon('professional'), href: '/professional' },
        { name: tCommon('projects'), href: '/projects' },
        { name: tCommon('contact'), href: '/contact' },
    ]

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="bg-background/50 fixed z-20 w-full border-b backdrop-blur-3xl">
                <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
                            <Link
                                href="/"
                                aria-label={t('ariaHome')}
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? t('closeMenu') : t('openMenu')}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>

                            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-8">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <LocaleSwitcher />
                                {repoInfo && (
                                    <RepoInfoBlock
                                        repoInfo={repoInfo}
                                        className="ml-auto"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden flex flex-col gap-6">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <LocaleSwitcher />
                                {repoInfo && (
                                    <RepoInfoBlock
                                        repoInfo={repoInfo}
                                        className="ml-auto w-fit"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
